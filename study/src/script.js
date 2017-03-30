/*
Code for Turk Experiments for analysis of Value Suppressing Uncertainty Maps

IVs:

1. Map type
A. Juxtaposed Map: Two heatmaps, one showing value, the other uncertainty.
Color ramps have as small a bin size as possible, down to JND 5.0 in CIELAB.
B. Superimposed Map: One heatmap, bivariate map down to as small a bin size as possible.
Will be coarser than the juxtaposed map, since there's inteference between the two variables.
C. VSUP: One heatmap, bivariate, but with uncertain values increasing aliased together.

2. Map
A. Value: (Viridis, Spectral?). Uncertainty: (Lightness, Size).

Procedure:
1. Get Consent.
2. Tutorial showing examples of tasks, as well as a general primer on uncertainty.
In this case, we'll be using variability as our uncertainty measure.
3. Identification tasks. Given a heatmap, and a location (highlighted or indicated),
what is the value, and what is the uncertainty?
or: find min and max locations
4. Roulette tasks: Given a heatmap, and n tokens, place them such that you maximize the E.V.
Include both gain and loss framings.
5. Collect demographic information, including risk assay.
*/

var experiment = "Pilot";
var startTime;
var main = d3.select("#fcontainer");
var done = false;
var questionNum = 1;

var taskOneStimuli = [];
var taskTwoStimuli = [];

var taskTwoGrid = [];
var taskTwoTokens = 0;

//var map = d3.interpolateViridis;

function scaleGenerator(map){
  var maps = makeMaps(map, 18);
  var uSL = makeuSL(map);
  var uSize = makeuSize(map);

  var squareScale = makeScaleFunction(maps.square, uSL);
  var arcScale = makeScaleFunction(maps.arc, uSL);
  var arcSizeScale = makeScaleFunction(maps.arcSize, uSize);

  return {"square":maps.square, "arc":maps.arc, "arcSize":maps.arcSize,
  "cs":uSize, "cl":uSL, "squareScale": squareScale, "arcScale": arcScale, "arcSizeScale":arcSizeScale};
}

var vMap = scaleGenerator(d3.interpolateViridis);
var pMap = scaleGenerator(d3.interpolatePlasma);
var cMap = scaleGenerator(d3.interpolateCool);

var vV = function(d){
  return d3.interpolateViridis(d.v);
}

var vP = function(d){
  return d3.interpolatePlasma(d.v);
}

var vC = function(d){
  return d3.interpolateCool(d.v);
}

var u = function(d){
  return d3.interpolateGreys(1-d.u);
}

function gup(name){
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var tmpURL = window.location.href;
  var results = regex.exec( tmpURL );
  if( results == null )
  return "";
  else
  return results[1];
}

var workerId = gup("workerId");
if(!workerId){
  workerId = "UNKNOWN";
}

var assignmentId = gup("assignmentId");
if(!assignmentId){
  assignmentId = "";
}

function consent(){
  //Consent form
  main.append("iframe")
  .attr("src","consent.html");

  var readyBtn = main.append("input")
  .attr("class","button")
  .attr("id","answer")
  .attr("name","answer")
  .attr("value","I Consent")
  .attr("type", "button")
  .on("click",finishConsent);

  if(assignmentId=="ASSIGNMENT_ID_NOT_AVAILABLE"){
    readyBtn.attr("disabled","disabled");
    readyBtn.attr("value","PREVIEW");
  }

}

function finishConsent(){
  //Thing to do when we've consented.
  //Ought to be setting up for a tutorial.
  ishihara();
}

function ishihara(){
  var plates = [5,6,8,12,42];
  dl.permute(plates);

  main.selectAll("iframe").remove();
  main.select("#answer").remove();

  main.append("p")
  .html("In order to be eligible for this study, you must be capable of distinguishing colors. That is, you should be free from color vision deficiency (color blindness).");

  main.append("p")
  .html("To verify this, for each of the following images, input the number that you see in each circle:");

  var numPlates = 3;

  var platesDiv = main.append("div")
  .attr("id","plates");

  for(var i = 0;i<3;i++){
    platesDiv.append("div")
    .append("img")
    .attr("width","300px")
    .attr("src","img/ishihara/"+plates[i]+".png");

    platesDiv.append("div")
    .html("Visible number:")
    .append("input")
    .attr("type","number")
    .attr("name","plate"+plates[i])
    .attr("id","plate"+plates[i]);

  }

  main.append("p")
  .append("input")
  .attr("class","button")
  .attr("id","answer")
  .attr("name","answer")
  .attr("value","Ready")
  .on("click",finishIshihara);

}

function finishIshihara(){
  var plates = [];
  main.select("#plates").selectAll("input").each( function(){
    plates.push({"right": d3.select(this).attr("name").replace("plate",""), "guess": d3.select(this).property("value")});
  });
  var correct = true;

  for(plate of plates){
    correct = correct && plate.right==(plate.guess+"");
  }

  if(correct){
    tutorial();
  }
  else{
    ineligible();
  }

}

function tutorial(){
  //Set up tutorial. When we're done, start the first task
  main.selectAll("*").remove();

  main.append("iframe")
  .attr("src","tutorial.html");

  main.append("input")
  .attr("class","button")
  .attr("id","answer")
  .attr("name","answer")
  .attr("value","Ready")
  .on("click",finishTutorial);
}

function finishTutorial(){
  main.selectAll("#answer").remove();
  main.selectAll("iframe").remove();
  taskOne();
}

function makeTaskOneStimuli(){
  var stimuli = [];

  var types = ["juxta","2D","vsum"];
  var ramps = ["viridisLightness","viridisSize"];
  var sizes = ["4","8"];
  var questions = [
    "Click on the map location with the <b>highest</b> uncertainty",
    "Click on the map location with the <b>lowest</b> uncertainty AND <b>highest</b> value",
    "Click on the map location with the <b>lowest</b> uncertainty AND <b>lowest</b> value"
  ];

  var perLevel = 1;

  for(type of types){
    for(size of sizes){
      for(question of questions){
        for(ramp of ramps){
          for(var i = 0;i<perLevel;i++){
            stimuli.push( {"type":type, "ramp": ramp, "size": size, "question":question});
          }
        }
      }
    }
  }

  dl.permute(stimuli);
  return stimuli;
}

function makeTaskTwoStimuli(){
  var stimuli = [];

  var types = ["juxta","2D","vsum"];
  var ramps = ["lightness","size"];
  var sizes = ["4","8"];
  var roles = ["att","def"];

  var perLevel = 1;

  for(type of types){
    for(size of sizes){
      for(ramp of ramps){
        for(role of roles){
          for(var i = 0;i<perLevel;i++){
            stimuli.push( {"type":type, "size": size, "ramp": ramp, "role": role});
          }
        }
      }
    }
  }

  dl.permute(stimuli);
  return stimuli;
}

function makeTaskOneMap(size){
  //want to ensure that:
  // there is at least one of each combination of
  // high/low value and uncertainty
  // potentially multiple answers, but no ambiguity

  var mid = dl.random.uniform(0.34,0.65);
  var high = dl.random.uniform(0.34,1.0);
  var low = dl.random.uniform(0.0,0.65);

  var values = [];
  values.push({"v": 1.0, "u": 0.0});
  values.push({"v": 0.0, "u": 0.0});
  values.push({"v": 1.0, "u": 1.0});
  values.push({"v": 0.0, "u": 1.0});
  values.push({"v": mid(), "u": 1.0});
  values.push({"v": 0.0, "u": mid()});



  for(var i = 5;i<(size*size);i++){
    if(Math.random()<0.5){
      values.push({"v": Math.random(), "u": mid()});
    }
    else{
      values.push({"v": mid(), "u": low()});
    }
  }

  dl.permute(values);

  var matrix = [];

  for(var i = 0;i<size;i++){
    matrix.push(Array(size));
    for(var j = 0;j<size;j++){
      matrix[i][j] = values[i*size + j];
    }
  }

  return matrix;
}

function taskOne(){
  taskOneStimuli = makeTaskOneStimuli();

  main.append("p")
  .attr("id","questionTitle")
  .html("Question <span id=\"questionNum\">"+questionNum+"</span>/<span id=\"maxQuestions\">"+taskOneStimuli.length+"</span>");

  main.append("p")
  .html("You will be asked to find a location on a map that fits a certain criteria. Multiple locations might fit the criteria, in which case choose the any valid location.");

  main.append("p")
  .attr("id","prompt")
  .html("Click the \"Ready\" button to begin.");

  main.append("p")
  .attr("id","question")
  .append("input")
  .attr("class","button")
  .attr("id","answer")
  .attr("name","answer")
  .attr("value","Ready")
  .attr("style","position: relative; top: 225px;")
  .on("click",revealTaskOne);

  main.append("svg")
  .attr("id","map")
  .attr("style","width: 400px; height: 200px;");

  main.append("svg")
  .attr("id","legend")
  .attr("style","width: 400px; height: 200px;");

}

function initializeTaskOne(){
  d3.select("#map").selectAll("*").remove();
  d3.select("#legend").selectAll("*").remove();

  d3.select("#prompt")
  .html("Click the \"Ready\" button to begin.");

  d3.select("#question").append("input")
  .attr("class","button")
  .attr("id","answer")
  .attr("name","answer")
  .attr("value","Ready")
  .attr("style","position: relative; top: 225px;")
  .on("click",revealTaskOne);

}

function revealTaskOne(){
  main.select("#answer").remove();
  var mapSvg = d3.select("#map");
  var legendSvg = d3.select("#legend");
  var stim = taskOneStimuli[questionNum-1];
  //"viridisLightness","viridisSize","plasmaLightness","plasmaSize"

  switch(stim.type){
    case "vsum":
    makeHeatmap(mapSvg,100,0,200,makeTaskOneMap(stim.size),vMap.arcScale);
    makeArcmap(legendSvg, 20, 60, 160,vMap.arc,vMap.arcScale);
    makeArcLegend(legendSvg, 20, 60, 160, vMap.arc, [0,100], [0,100], "Value", "Uncertainty");
    break;

    case "juxta":
    var tempMap = makeTaskOneMap(stim.size);
    makeHeatmap(mapSvg,0,0,200,tempMap,vV);
    makeHeatmap(mapSvg,200,0,200,tempMap,u);
    //makeHeatmap(legendSvg, 20, 60, 80,vMap.square,vMap.squareScale);
    //makeJuxtaLegend(legendSvg, 20, 60, 80, vV,u, [0,100], [0,100], "Value", "Uncertainty");
    break;

    case "2D":
    default:
    makeHeatmap(mapSvg,100,0,200,makeTaskOneMap(stim.size),vMap.squareScale);
    makeHeatmap(legendSvg, 20, 60, 160,vMap.square,vMap.squareScale);
    makeHeatmapLegend(legendSvg, 20, 60, 160, vMap.square, [0,100], [0,100], "Value", "Uncertainty");
    break;
  }

  mapSvg.selectAll("rect")
  .on("click",answerTaskOne);

  main.select("#prompt").html(stim.question);
  startTime = (new Date()).getTime();
}


function answerTaskOne(){
  var rt = (new Date()).getTime() - startTime;
  var d = d3.select(this).datum();
  writeAnswerTaskOne({ "workerId": workerId, "task": "One", "index": questionNum, "rt": rt, "v": d.v.v, "u": d.v.u, "stim":taskOneStimuli[questionNum-1]});
}

function writeAnswerTaskOne(response){
  //Called when we answer a question in the first task
  //XML to call out to a php script to store our data in a csv over in ./data/
  var writeRequest = new XMLHttpRequest();
  var writeString = "answer="+JSON.stringify(response);
  writeRequest.open("GET","data/writeJSON.php?"+writeString,true);
  writeRequest.setRequestHeader("Content-Type", "application/json");
  writeRequest.addEventListener("load",doneAnswerTaskOne);
  writeRequest.send();
}

function doneAnswerTaskOne(){
  //What to do when we get our XML request back.

  //TODO error handling here

  //Should check to see if we've run out of questions to answer
  questionNum++;
  done = questionNum>taskOneStimuli.length;
  d3.select("#questionNum").html(questionNum);

  if(done){
    taskTwo();
  }
  else{
    initializeTaskOne();
  }

}

function taskTwo(){
  questionNum = 1;
  taskTwoStimuli = makeTaskTwoStimuli();
  main.selectAll("*").remove();

  main.append("p")
  .attr("id","questionTitle")
  .html("Question <span id=\"questionNum\">"+questionNum+"</span>/<span id=\"maxQuestions\">"+taskTwoStimuli.length+"</span>");

  main.append("p")
  .attr("id","question");

  main.append("p")
  .attr("id","prompt")
  .html("Once you have placed all targets, click the \"Confirm\" button to confirm your choices.");

  main.append("svg")
  .attr("id","tokenBar")
  .attr("style","width: 400px; height: 50px;");

  main.append("svg")
  .attr("id","map")
  .attr("style","width: 400px; height: 200px;");

  main.append("svg")
  .attr("id","legend")
  .attr("style","width: 400px; height: 200px;");

  main.append("input")
  .attr("class","button")
  .attr("id","answer")
  .attr("name","answer")
  .attr("value","Confirm")
  .attr("disabled","disabled")
  .on("click",answerTaskTwo);

  initializeTaskTwo();

}

function initializeTaskTwo(){

  d3.select("#map").selectAll("*").remove();
  d3.select("#legend").selectAll("*").remove();
  d3.select("#tokenBar").selectAll("*").remove();

  startTime = (new Date()).getTime();
  var stim = taskTwoStimuli[questionNum-1];

  var tokens = stim.size;
  var mapSvg = d3.select("#map");
  var legendSvg = d3.select("#legend");

  taskTwoTokens = stim.size;

  taskTwoGrid = [];
  for(var i = 0;i<size;i++){
    taskTwoGrid.push(dl.repeat(false,size));
  }

  if(stim.role=="att"){
    d3.select("#question")
    .html("Click to place missiles on the map on locations where you think you will sink the most ships.");
  }
  else{
    d3.select("#question")
    .html("Click to place ships on the map on locations where you think they will be safest from missiles.");
  }

  var tokenSize = 200/tokens;

  var tokenImg = stim.role=="att" ? "boom.png" : "ship.png";
  for(var i =0;i<tokens;i++){
    d3.select("#tokenBar").append("svg:image")
    .attr("x", i*tokenSize)
    .attr("height", tokenSize)
    .attr("width", tokenSize)
    .attr("xlink:href","img/"+tokenImg)
    .datum({"placed":false, "r": -1, "c": -1});

  }

  switch(stim.type){
    case "vsum":
    makeHeatmap(mapSvg,100,0,200,makeTaskOneMap(stim.size),vMap.arcScale);
    makeArcmap(legendSvg, 20, 60, 80,vMap.arc,vMap.arcScale);
    makeArcLegend(legendSvg, 20, 60, 160, vMap.arc, [0,100], [0,100], "Value", "Uncertainty");
    break;

    case "juxta":
    var tempMap = makeTaskOneMap(stim.size);
    makeHeatmap(mapSvg,0,0,200,tempMap,vV);
    makeHeatmap(mapSvg,200,0,200,tempMap,u);
    //makeHeatmap(legendSvg, 20, 60, 80,vMap.square,vMap.squareScale);
    //makeJuxtaLegend(legendSvg, 20, 60, 80, vV,u, [0,100], [0,100], "Value", "Uncertainty");
    break;

    case "2D":
    default:
    makeHeatmap(mapSvg,100,0,200,makeTaskOneMap(stim.size),vMap.squareScale);
    makeHeatmap(legendSvg, 20, 60, 80,vMap.square,vMap.squareScale);
    makeHeatmapLegend(legendSvg, 20, 60, 160, vMap.square, [0,100], [0,100], "Value", "Uncertainty");
    break;
  }

  mapSvg.selectAll("rect")
  .on("click",placeToken);

}

function placeToken(){
  if(taskTwoTokens>0){
    var d = d3.select(this).datum();
    taskTwoGrid[d.r][d.c] = true;
    //gimme the first unplaced token
    var token = d3.select("#tokenBar").selectAll("image").filter(function(t){ return !t.placed;});
    token = d3.select(token.node());
    token.attr("y","-50px");
    token.datum().placed = true;
    token.datum().r = d.r;
    token.datum().c = d.c;
    token.datum().v = d.v.v;
    token.datum().u = d.v.u;

    d3.select("#map").append("svg:image")
    .attr("x",d.c*token.attr("width"))
    .attr("y",d.r*token.attr("height"))
    .attr("width",token.attr("width"))
    .attr("height",token.attr("height"))
    .attr("transform",d3.select("#map").select("g").attr("transform"))
    .attr("xlink:href",token.attr("xlink:href"))
    .datum({"r": d.r, "c": d.c})
    .on("click",removeToken);

    taskTwoTokens--;
    if(taskTwoTokens==0){
      d3.select("#answer").attr("disabled",null);
    }
  }
}

function removeToken(){
    var d = d3.select(this).datum();
    taskTwoGrid[d.r][d.c] = false;
    //gimme the token that was placed here
    var token = d3.select("#tokenBar").selectAll("image").filter(function(t){ return d.r==t.r && d.c==t.c;});
    token.attr("y","0px");
    token.datum().placed = false;
    token.datum().u = -1;
    token.datum().v = -1;
    taskTwoTokens++;
    d3.select(this).remove();
}

function answerTaskTwo(){
  var rt = (new Date()).getTime() - startTime;
  var data = [];
  var d = d3.select("#tokenBar").selectAll("image").each(function(d){ data.push({"v":d.v, "u":d.u});});
  writeAnswerTaskTwo({ "workerId": workerId, "task": "Two", "index": questionNum, "rt": rt, "items": data, "stim":taskTwoStimuli[questionNum-1]});
}

function writeAnswerTaskTwo(response){
  //Called when we answer a question in the second task
  //XML to call out to a php script to store our data in a csv over in ./data/
  var writeRequest = new XMLHttpRequest();
  var writeString = "answer="+JSON.stringify(response);
  writeRequest.open("GET","data/writeJSON.php?"+writeString,true);
  writeRequest.setRequestHeader("Content-Type", "application/json");
  writeRequest.addEventListener("load",doneAnswerTaskTwo);
  writeRequest.send();
}

function doneAnswerTaskTwo(){
  //What to do when we get our XML request back.

  //TODO error handling here

  //Should check to see if we've run out of questions to answer
  questionNum++;
  done = questionNum>taskTwoStimuli.length;
  d3.select("#questionNum").html(questionNum);

  if(done){
    finishTask();
  }
  else{
    initializeTaskTwo();
  }

}

function finishTask(){
  //When we're finished with all tasks.
  main.selectAll("*").remove();
  postTest();
}

function riskAversion(form){
  //A risk aversion assay, from Mandrik and Bao 2005:

  var items = [
    "I do not feel comfortable taking chances.",
    "I prefer situations that have foreseeable outcomes.",
    "Before I make a decision, I like to be absolutely sure how things turn out.",
    "I avoid situations that have uncertain outcomes",
    "I feel comfortable improvising in new situations",
    "I feel nervous when I have to make decisions in uncertain situations"
  ];

  var valences = [
    1,
    1,
    1,
    1,
    -1,
    1
  ];

  //Another option is the ROQ from Rohrmann 1997
  //http://www.rohrmannresearch.net/pdfs/rohrmann-rac-roq.pdf

  form.append("div")
  .html("For the following items indicate how strongly you agree or disagree, where 1=\"Strongly Disagree\" and 7=\"Strongly Agree\":");

  var dlist = form.append("ol");
  var index = 0;

  for(var item of items){
    var question = dlist.append("li");

    question.html(item);

    var label = question.append("div");

    label.classed("likert",true);

    label.append("span")
    .html("Strongly Disagree")
    .attr("style","align-self: left");

    label.append("span")
    .html("Strongly Agree")
    .attr("style","align-self: right");

    var numbers = question.append("div");

    numbers.classed("likert",true);

    var questions = question.append("div");

    questions.classed("likert",true);

    for(var i = 1;i<=7;i++){
      numbers.append("span")
      .html(i+"");

      questions.append("input")
      .attr("type","radio")
      .attr("name","risk"+index)
      .attr("value",i*valences[index]);

    }
    index++;
  }
}

function postTest(){
  //Demographics and submission information.

  // Any metadata we want to be able to read over on MTurk should be set here.
  // All items in the mturk_form are visible in the HIT summary csv.
  var format = d3.format(".3f");

  main.append("div")
  .html("This concludes the main task of the study. Thank you for your participation!");

  form = main.append("form")
  .attr("id","mturk_form")
  .attr("method","post");

  if(document.referrer && (document.referrer.indexOf("workersandbox")!=-1)){
    form.attr("action","https://workersandbox.mturk.com/mturk/externalSubmit")
  }
  else{
    form.attr("action","https://www.mturk.com/mturk/externalSubmit");
  }

  riskAversion(form);

  form.append("div")
  .html("We will now ask for demographic information. You will also have the chance to give feedback. <br />");

  var dlist = form.append("ol");

  var genders = ["Male","Female","Other","Decline to state"];
  var educations = ["Some high school","High school degree","Some college","College degree","Graduate degree"];
  var experiences = ["1. No experience","2.","3. Some experience","4.","5. A great deal of experience"];

  var visionQ = dlist.append("li").html("Do you have normal vision (or vision which has been corrected to normal)? <br />");

  visionQ.append("input")
  .attr("type","radio")
  .attr("name","vision")
  .attr("value","Yes");
  visionQ.append("span").html("Yes <br />");
  visionQ.append("input")
  .attr("type","radio")
  .attr("name","vision")
  .attr("value","No");
  visionQ.append("span").html("No <br />");

  var genderQ = dlist.append("li").html("What is your gender <br />");

  for(var gender of genders){
    genderQ.append("input")
    .attr("type","radio")
    .attr("name","gender")
    .attr("value",gender);

    genderQ.append("span").html(gender +"<br />");
  }

  var eduQ = dlist.append("li").html("What is your highest level of education? <br />");

  for(var education of educations){
    eduQ.append("input")
    .attr("type","radio")
    .attr("name","education")
    .attr("value",education);

    eduQ.append("span").html(education + "<br />");
  }

  var expQ = dlist.append("li").html("How do you rate your experience interpreting graphs and charts (1-5)? <br />");

  for(var i = 0;i<experiences.length;i++){
    expQ.append("input")
    .attr("type","radio")
    .attr("name","experience")
    .attr("value",i);

    expQ.append("span").html(experiences[i]+"<br />");
  }

  var ageQ = dlist.append("li").html("What is your age? <br />");
  ageQ.append("input")
  .attr("type","number")
  .attr("name","age")
  .attr("min","18")
  .attr("max","100");


  var commentQ = dlist.append("li").html("Any additional comments of feedback? <br />");

  commentQ.append("textarea")
  .attr("name","comments")
  .attr("rows","4")
  .attr("cols","50");


  form.append("input")
  .attr("id","turkBtn")
  .attr("type","submit")
  .attr("class","button")
  .attr("name","submit")
  .attr("value","Submit");

}

function ineligible(){
  main.selectAll("*").remove();
  main.append("p")
  .html("We're sorry, but your responses indicate that you are not eligible to participate in this study.");

  main.append("p")
  .html("Please consult our <a href=\"consent.html\" target=\"_blank\">consent form</a> for more information.");

}

consent();
