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

var experiment = "Exp2";
var startTime;
var main = d3.select("#fcontainer");
var done = false;
var questionNum = 1;

var taskOneStimuli = [];
var taskTwoStimuli = [];

var taskTwoGrid = [];
var taskTwoTokens = 0;

//Variables for our 8 conditions

//8 conditions
// 1. Discrete square
// 2. Continuous square
// 3. Discrete juxtaposed
// 4. Continuous juxtaposed
// 5. Discrete arc
// 6. Continuous arc
// 7. VSUP square
// 8. VSUP arc


//The top types for exp2
var types =
[
  {binned: "discrete", shape:"square", vsup:false},
//  {binned: "continuous", shape:"square", vsup:false},
//  {binned: "discrete", shape:"juxtaposed", vsup:false},
//  {binned: "continuous", shape:"juxtaposed", vsup:false},
  {binned: "discrete", shape:"arc", vsup:false},
//  {binned: "continuous", shape:"arc", vsup:false},
  {binned: "discrete", shape:"square", vsup:true},
  {binned: "discrete", shape:"arc", vsup:true}
];

//quantization schema
vDom = [0,1];
uDom = [0,1];
var Qvsup = bvu.quantization().branching(2).layers(4).valueDomain(vDom).uncertaintyDomain(uDom);
var Q2d = bvu.squareQuantization().n(4).valueDomain(vDom).uncertaintyDomain(uDom);


//bivariate scales
var scalevsup = bvu.scale().quantize(Qvsup).range(d3.interpolateViridis);
var scale2d = bvu.scale().quantize(Q2d).range(d3.interpolateViridis);

var scaleContinuous = function(d) {
  var c = d3.interpolateViridis(d.v);
  return d3.interpolateLab(d3.color("#ddd"), c)(d.u);
}

scaleContinuous.quantize = function() {
  return {
    uncertaintyDomain: function() {
      return [0,1];
    },
    valueDomain: function() {
      return [0,1];
    }
  }
}


//juxtaposed univated scales

var valueScale = d3.scaleQuantize()
    .domain([0, 1])
    .range(d3.quantize(d3.interpolateViridis, 4));

var uncertaintyScale = d3.scaleQuantize()
    .domain([0, 1])
    .range(d3.schemeGreys[4].reverse());

var scale1dV = function(d) { return valueScale(d.v);};
var scale1dU = function(d) { return uncertaintyScale(d.u);};
var scaleContinuous1dV = function(d) {return d3.interpolateViridis(d.v);};
var scaleContinuous1dU = function(d) {return d3.interpolateGreys(1 - d.u);};

//our potential values. these are values that are guaranteed to not lie on a
//bin border of any of our discrete color scales, but also result in unique
//colors for each scale, but also are not aligned with any tick marks

var validQs = [
  {u:0.1, v:0.2},
  {u:0.1, v:0.45},
  {u:0.1, v:0.7},
  {u:0.1, v:0.95},
  {v:0.1, u:0.4},
  {v:0.4, u:0.4},
  {v:0.7, u:0.4},
  {v:0.8, u:0.4},
  {v:0.3, u:0.6},
  {v:0.8, u:0.6},
  {v:0.4, u:0.8},
];

function gup(name) {
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp( regexS );
  var tmpURL = window.location.href;
  var results = regex.exec( tmpURL );
  if ( results == null )
  return "";
  else
  return results[1];
}

var workerId = gup("workerId");
if (!workerId) {
  workerId = "UNKNOWN";
}

var assignmentId = gup("assignmentId");
if (!assignmentId) {
  assignmentId = "";
}

function consent() {
  //Consent form
  main.append("iframe")
  .attr("src", "consent.html");

  var readyBtn = main.append("button")
  .attr("class", "button")
  .attr("type", "button")
  .attr("id", "answer")
  .attr("name", "answer")
  .text("I Consent")
  .on("click", finishConsent);

  if (assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE") {
    readyBtn.attr("disabled", "disabled");
    readyBtn.text("PREVIEW");
  }

  window.scrollTo(0, 0);

}

function finishConsent() {
  //Thing to do when we've consented.
  //Ought to be setting up for a tutorial.
  ishihara();
}

function ishihara() {
  var plates = [5, 6, 8, 12, 42];
  dl.permute(plates);

  main.selectAll("iframe").remove();
  main.select("#answer").remove();

  main.append("p")
  .html("In order to be eligible for this study, you must be capable of distinguishing colors. That is, you should be free from color vision deficiency (color blindness).");

  main.append("p")
  .html("To verify this, for each of the following images, input the number that you see in each circle:");

  var numPlates = 3;

  var platesDiv = main.append("div")
  .attr("id", "plates");

  for (var i = 0;i < numPlates;i++) {
    platesDiv.append("div")
    .append("img")
    .attr("width", "300px")
    .attr("src", "img/ishihara/" + plates[i] + ".png");

    platesDiv.append("div")
    .html("Visible number:")
    .append("input")
    .attr("type", "number")
    .attr("name", "plate" + plates[i])
    .attr("id", "plate" + plates[i]);

  }

  main.append("p")
  .append("button")
  .attr("class", "button")
  .attr("type", "button")
  .attr("id", "answer")
  .attr("name", "answer")
  .text("Ready")
  .on("click", finishIshihara);

}

function finishIshihara() {
  var plates = [];
  var plate;
  main.select("#plates").selectAll("input").each( function() {
    plates.push({"right": d3.select(this).attr("name").replace("plate", ""), "guess": d3.select(this).property("value")});
  });
  var correct = true;

  for (plate of plates) {
    correct = correct && plate.right == (plate.guess + "");
  }

  if (correct) {
    tutorial();
  }
  else {
    ineligible();
  }

}

function tutorial() {
  //Set up taske one tutorial. When we're done, start the first task
  main.selectAll("*").remove();

  main.append("iframe")
  .attr("height", "100%")
  .attr("src", "tutorial.html");

  main.append("button")
  .attr("class", "button")
  .attr("type", "button")
  .attr("id", "answer")
  .attr("name", "answer")
  .text("Ready")
  .on("click", finishTutorial);

  window.scrollTo(0, 0);
}

function finishTutorial() {
  main.selectAll("#answer").remove();
  main.selectAll("iframe").remove();
  taskOne();
}

function tutorialTwo() {
  //Set up task two tutorial. When we're done, start the second task
  main.selectAll("*").remove();

  main.append("iframe")
  .attr("src", "tutorialTwo.html");

  main.append("button")
  .attr("class", "button")
  .attr("type", "button")
  .attr("id", "answer")
  .attr("name", "answer")
  .text("Ready")
  .on("click", finishTutorialTwo);
}

function finishTutorialTwo() {
  main.selectAll("#answer").remove();
  main.selectAll("iframe").remove();
  taskTwo();
}

function makeTaskOneStimuli() {
  var stimuli = [];

  var replicates = experiment=="Exp1" ? 8 : 4;

  for (var type of types) {
    for (var i = 0;i < replicates;i++) {
      stimuli.push({binned: type.binned, shape:type.shape, vsup: type.vsup, question: validQs[Math.floor(Math.random() * validQs.length)]});
    }
  }

  dl.permute(stimuli);
  return stimuli;
}

function makeTaskTwoStimuli() {
  var stimuli = [];

  var replicates = 6;

  for (var type of types) {
    for (var i = 0;i < replicates;i++) {
      stimuli.push({binned: type.binned, shape:type.shape, vsup: type.vsup});
    }
  }

  dl.permute(stimuli);
  return stimuli;
}

function makeTaskOneMap(size) {
  // Each map has exactly one of each color in the 2D map

  var values = validQs.slice();

  //the rest are just random distractors.

  for (var i = values.length;i < (size * size);i++) {
    values.push(validQs[Math.floor(Math.random() * validQs.length)]);
  }

  dl.permute(values);

  var matrix = [];

  for (i = 0;i < size;i++) {
    matrix[i] = [];
    for (var j = 0;j < size;j++) {
      matrix[i][j] = values[i * size + j];
    }
  }

  return matrix;
}

function taskOne() {
  taskOneStimuli = makeTaskOneStimuli();

  main.append("p")
  .attr("id", "questionTitle")
  .html("Question <span id=\"questionNum\">" + questionNum + "</span>/<span id=\"maxQuestions\">" + taskOneStimuli.length + "</span>");

  main.append("p")
  .attr("id", "prompt")
  .html("Click the \"Ready\" button to begin.");

  main.append("p")
  .attr("id", "question");

  main.append("svg")
  .attr("id", "map")
  .attr("style", "width: 700px; height: 250px; padding-bottom: 10px");

  main.append("div")
  .attr("id", "legend")
  .attr("style", "width: 700px;");

  main.append("p")
  .html("You will be asked to find a location on a map that fits a certain criteria. Multiple locations might fit the criteria, in which case choose any valid location.");

  initializeTaskOne();
}

function initializeTaskOne() {
  d3.select("#map").selectAll("*").remove();
  d3.select("#legend").selectAll("*").remove();

  d3.select("#prompt")
  .html("Click the \"Ready\" button to begin.");

  d3.select("#question").append("button")
  .attr("class", "button")
  .attr("type", "button")
  .attr("id", "answer")
  .attr("name", "answer")
  .text("Ready")
  .attr("style", "position: relative; top: 125px;")
  .on("click", revealTaskOne);

}


function drawMap(stim, data, task) {

  //make legend
  var legendSvg, legend;
  var vtitle = task == "two" ? "Danger" : "Value";
  if (stim.shape == "juxtaposed") {
    legendSvg = d3.select("#legend").append("svg").attr("style", "width: 100%; height: 75");
    legend = bvu.legend.simpleLegend()
    .title(vtitle)
    .size(250)
    .format(".2f")
    .height(20)
    .scale(valueScale)
    .x(100)
    .y(20);

    var ulegend = bvu.legend.simpleLegend()
    .title("Uncertainty")
    .size(250)
    .format(".2f")
    .height(20)
    .scale(uncertaintyScale)
    .x(400)
    .y(20);

    legendSvg.append("g").call(ulegend);
    legendSvg.append("g").call(legend);

  }
  else {
    legendSvg = d3.select("#legend").append("svg").attr("style", "width: 100%; height: 225");
    if (stim.shape == "arc") {
      legend = bvu.legend.arcmapLegend()
          .size(150)
          .x(275)
          .y(50)
          .scale(scaleContinuous);
    }
    else {
      legend = bvu.legend.heatmapLegend()
          .size(150)
          .x(275)
          .y(50)
          .scale(scaleContinuous);
    }

    if (stim.vsup) {
      legend.scale(scalevsup)
    }
    else {
      legend.scale(scale2d);
    }
    legend.vtitle(vtitle);
    legendSvg.append("g").call(legend);
  }

  if (stim.binned == "continuous") {
    var canvasDiv = d3.select("#legend").append("div")
      .attr("style", "position: relative; margin-top: -175px; margin-left: 275px; padding-bottom: 25px;")
    if (stim.shape == "square") {
      var square = bvu.csquare(150, d3.interpolateViridis);
      canvasDiv.call(square);
    }
    else if (stim.shape == "arc") {
      var arc = bvu.carc(150, d3.interpolateViridis);
      canvasDiv.call(arc);
    }
    else {
      legendSvg.attr("style", "width: 100%; height: 75");
      var vLine = bvu.cline(250, 20, d3.interpolateViridis);
      var uLine = bvu.cline(250, 20, function(d) { return d3.interpolateGreys(1 - d);});

      canvasDiv
        .attr("style", "position: relative; margin-left: 100px; margin-top: -55px; height: 75px");

      canvasDiv.call(vLine);

      var uCanvasDiv = d3.select("#legend").append("div")
        .attr("style", "position: relative; margin-left: 400px; margin-top: -75px; height: 75px");

      uCanvasDiv.call(uLine);
    }
  }

  //make map
  var mapSvg = d3.select("#map");
  var map = bvu.heatmap().x(225).size(250).scale(scale2d).data(data);

  if (stim.vsup) {
    map.scale(scalevsup);
  }
  else if (stim.shape == "juxtaposed") {
    var umap = bvu.heatmap().size(250).scale(scale1dU).data(data).x(400);
    map.x(100).scale(scale1dV);
    if (stim.binned == "continuous") {
      map.scale(scaleContinuous1dV)
      umap.scale(scaleContinuous1dU);
    }
    mapSvg.append("g").call(umap);
  }
  else if (stim.binned == "continuous") {
    map.scale(scaleContinuous);
  }
  mapSvg.append("g").call(map);
}

function revealTaskOne() {
  main.select("#answer").remove();
  var mapSvg = d3.select("#map");
  var stim = taskOneStimuli[questionNum - 1];

  //make data
  var data = makeTaskOneMap(5);

  //make map
  drawMap(stim, data);

  //make question
  //prep for a response

  var questionString =
  "Select the location with a value of " + stim.question.v + " and an uncertainty of " + stim.question.u;
  main.select("#prompt").html(questionString);
  startTime = (new Date()).getTime();

  mapSvg.selectAll("rect")
  .on("click", answerTaskOne);

}


function answerTaskOne() {
  //prevent answers from piling up.
  d3.select("#map").selectAll("rect")
    .on("click", null);

  var rt = (new Date()).getTime() - startTime;
  var d = d3.select(this).datum();
  var stim = taskOneStimuli[questionNum - 1];
  var stimProp;
  var answerData = { "workerId": workerId, "task": "One", "index": questionNum, "rt": rt, "v": d.v.v, "u": d.v.u};
  for (stimProp in stim) {
    answerData[stimProp] = stim[stimProp];
  }

  var vError = d.v.v - stim.question.v;
  var uError = d.v.u - stim.question.u;

  answerData.qV = answerData.question.v;
  answerData.qU = answerData.question.u;
  answerData.vError = vError;
  answerData.uError = uError;
  answerData.error = vError + uError;
  answerData.vsup = stim.vsup ? "yes" : "no";

  delete answerData.question;
  writeAnswerTaskOne(answerData);
}

function writeAnswerTaskOne(response) {
  //Called when we answer a question in the first task
  //XML to call out to a php script to store our data in a csv over in ./data/
  console.log(response);
  var writeRequest = new XMLHttpRequest();
  var writeString = "answer=" + JSON.stringify(response);
  writeRequest.open("GET", "data/writeJSON.php?" + writeString, true);
  writeRequest.setRequestHeader("Content-Type", "application/json");
  writeRequest.addEventListener("load", doneAnswerTaskOne);
  writeRequest.send();
}

function doneAnswerTaskOne() {
  //What to do when we get our XML request back.

  //TODO error handling here

  //Should check to see if we've run out of questions to answer
  questionNum++;
  done = questionNum > taskOneStimuli.length;
  d3.select("#questionNum").html(questionNum);

  if (done) {
    if (experiment=="Exp1") {
      finishTask();
    }
    else {
      tutorialTwo();
    }
  }
  else {
    initializeTaskOne();
  }

}

function makeTaskTwoMap(size) {

  // Unlike task one, we don't care about
  // distinguishability. So we make samples of values
  // at each level of uncertainty.


  var values = [];
  var sampler = [
    dl.random.uniform(0, 0.24),
    dl.random.uniform(0.26, 0.49),
    dl.random.uniform(0.51, 0.74),
    dl.random.uniform(0.76, 1.0)
  ];

  //16 "potential" values, one for each of our 4 levels
  for (var i = 0;i < 4;i++) {
    for (var j = 0;j < 4;j++) {
      values.push({u: sampler[i](), v: sampler[j]()});
    }
  }

  //remaining samples are just "bad" values that are unsafe
  // with high certainty
  var badValue = dl.random.uniform(0.5, 1);
  var lowUncertainty = dl.random.uniform(0, 0.5);

  for (i = values.length;i < (size * size);i++) {
    values.push({u: lowUncertainty(), v: badValue()});
  }

  dl.permute(values);

  var matrix = [];

  for (i = 0;i < size;i++) {
    matrix[i] = [];
    for (j = 0;j < size;j++) {
      matrix[i][j] = values[i * size + j];
    }
  }

  return matrix;
}

function taskTwo() {
  questionNum = 1;
  taskTwoStimuli = makeTaskTwoStimuli();
  main.selectAll("*").remove();

  main.append("p")
  .attr("id", "questionTitle")
  .html("Question <span id=\"questionNum\">" + questionNum + "</span>/<span id=\"maxQuestions\">" + taskTwoStimuli.length + "</span>");

  main.append("p")
  .attr("id", "question");

  main.append("svg")
  .attr("id", "tokenBar")
  .attr("style", "width: 250px; height: 50px;");

  main.append("svg")
  .attr("id", "map")
  .attr("style", "width: 700px; height: 250px; padding-bottom: 10px");

  main.append("div")
  .attr("id", "legend")
  .attr("style", "width: 700px;");

  main.append("input")
  .attr("class", "button")
  .attr("type", "button")
  .attr("id", "answer")
  .attr("name", "answer")
  .attr("value", "Confirm")
  .attr("disabled", "disabled")
  .on("click", answerTaskTwo);

  main.append("p")
  .attr("id", "prompt")
  .html("Once you have placed all targets, click the \"Confirm\" button to confirm your choices.");


  initializeTaskTwo();

}

function initializeTaskTwo() {
  var size = 5;
  d3.select("#map").selectAll("*").remove();
  d3.select("#legend").selectAll("*").remove();
  d3.select("#tokenBar").selectAll("*").remove();

  startTime = (new Date()).getTime();
  var stim = taskTwoStimuli[questionNum - 1];
  var data = makeTaskTwoMap(5);
  var tokens = size;
  var mapSvg = d3.select("#map");

  taskTwoTokens = size;

  taskTwoGrid = [];
  for (var i = 0;i < size;i++) {
    taskTwoGrid.push(dl.repeat(false, size));
  }

  d3.select("#question")
    .html("Click to place ships on the map on locations where you think your ships are safest.");

  var tokenSize = 50;

  var tokenImg = "ship.png";

  for (i = 0;i < tokens;i++) {
    d3.select("#tokenBar").append("svg:image")
    .attr("x", i * tokenSize)
    .attr("height", tokenSize)
    .attr("width", tokenSize)
    .attr("xlink:href", "img/" + tokenImg)
    .datum({"placed":false, "r": -1, "c": -1});

  }

  drawMap(stim, data, "two");

  mapSvg.selectAll("rect")
  .on("click", toggleToken);

  d3.select("#answer").attr("disabled", "disabled");

}

function toggleToken() {
  var d = d3.select(this).datum();
  if (taskTwoTokens > 0 && !taskTwoGrid[d.r][d.c]) {
    placeToken(d);
  }
  else if (taskTwoGrid[d.r][d.c]) {
    removeToken(d);
  }
}

function placeToken(d) {
  taskTwoGrid[d.r][d.c] = true;
  //gimme the first unplaced token
  var token = d3.select("#tokenBar").selectAll("image").filter(function(t) { return !t.placed;});
  token = d3.select(token.node());
  token.attr("y", "-50px");
  token.datum().placed = true;
  token.datum().r = d.r;
  token.datum().c = d.c;
  token.datum().v = d.v.v;
  token.datum().u = d.v.u;

  var stim = taskTwoStimuli[questionNum - 1];
  var xoffset = 225;
  var yoffset = 0;

  if (stim.shape == "juxtaposed") {
    xoffset = 100;
  }

  d3.select("#map").append("svg:image")
  .attr("x", (d.c * token.attr("width")) + xoffset)
  .attr("y", (d.r * token.attr("height")) + yoffset)
  .attr("width", token.attr("width"))
  .attr("height", token.attr("height"))
  .attr("transform", d3.select("#map").select("g").attr("transform"))
  .attr("xlink:href", token.attr("xlink:href"))
  .datum({"r": d.r, "c": d.c})
  .on("click", toggleToken);

  taskTwoTokens--;
  if (taskTwoTokens == 0) {
    d3.select("#answer").attr("disabled", null);
  }
}

function removeToken(d) {
  taskTwoGrid[d.r][d.c] = false;
  //gimme the token that was placed here
  var token = d3.select("#tokenBar").selectAll("image").filter(function(t) { return d.r == t.r && d.c == t.c;});
  token.attr("y", "0px");
  token.datum().placed = false;
  token.datum().u = -1;
  token.datum().v = -1;
  taskTwoTokens++;
  d3.select("#answer").attr("disabled", "disabled");
  d3.select("#map").selectAll("image").filter(function(t) { return d.r == t.r && d.c == t.c;}).remove();
}

function answerTaskTwo() {
  d3.select("#answer").attr("disabled", "disabled");
  var data = [];
  var stimProp;
  var rt = (new Date()).getTime() - startTime;
  var stim = taskTwoStimuli[questionNum - 1];
  var answerData = { "workerId": workerId, "task": "Two", "index": questionNum, "rt": rt};
  for (stimProp in stim) {
    answerData[stimProp] = stim[stimProp];
  }

  d3.select("#tokenBar").selectAll("image").each(function(d) { data.push({"v":d.v, "u":d.u});});
  answerData.Vs = "\"" + data.map(function(obj) { return obj.v;}).toString() + "\"";
  answerData.Us = "\"" + data.map(function(obj) { return obj.u;}).toString() + "\"";
  answerData.meanV = dl.mean(data, "v");
  answerData.meanU = dl.mean(data, "u");
  answerData.stdV = dl.stdev(data, "v");
  answerData.stdU = dl.stdev(data, "u");
  answerData.vsup = stim.vsup ? "yes" : "no";

  writeAnswerTaskTwo(answerData);
}

function writeAnswerTaskTwo(response) {
  //Called when we answer a question in the second task
  //XML to call out to a php script to store our data in a csv over in ./data/
  console.log(response);
  var writeRequest = new XMLHttpRequest();
  var writeString = "answer=" + JSON.stringify(response);
  writeRequest.open("GET", "data/writeJSON.php?" + writeString, true);
  writeRequest.setRequestHeader("Content-Type", "application/json");
  writeRequest.addEventListener("load", doneAnswerTaskTwo);
  writeRequest.send();
}

function doneAnswerTaskTwo() {
  //What to do when we get our XML request back.

  //TODO error handling here
  //Should check to see if we've run out of questions to answer

  questionNum++;
  done = questionNum > taskTwoStimuli.length;
  d3.select("#questionNum").html(questionNum);

  if (done) {
    finishTask();
  }
  else {
    initializeTaskTwo();
  }

}

function finishTask() {
  //When we're finished with all tasks.
  main.selectAll("*").remove();
  postTest();
}

function riskAversion(form) {
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

  for (var item of items) {
    var question = dlist.append("li");

    question.html(item);

    var label = question.append("div");

    label.classed("likert", true);

    label.append("span")
    .html("Strongly Disagree")
    .attr("style", "align-self: left");

    label.append("span")
    .html("Strongly Agree")
    .attr("style", "align-self: right");

    var numbers = question.append("div");

    numbers.classed("likert", true);

    var questions = question.append("div");

    questions.classed("likert", true);

    for (var i = 1;i <= 7;i++) {
      numbers.append("span")
      .html(i + "");

      questions.append("input")
      .attr("type", "radio")
      .attr("required", "required")
      .attr("name", "risk" + index)
      .attr("value", i * valences[index]);

    }

    question.append("span").html("<br/>");

    index++;
  }
}

function postTest() {
  //Demographics and submission information.

  // Any metadata we want to be able to read over on MTurk should be set here.
  // All items in the mturk_form are visible in the HIT summary csv.

  main.append("div")
  .html("This concludes the main task of the study. Thank you for your participation!");

  form = main.append("form")
  .attr("id", "mturk_form")
  .attr("method", "post");

  if (document.referrer && (document.referrer.indexOf("workersandbox") != -1)) {
    form.attr("action", "https://workersandbox.mturk.com/mturk/externalSubmit")
  }
  else {
    form.attr("action", "https://www.mturk.com/mturk/externalSubmit");
  }

  form.append("input")
  .attr("type", "hidden")
  .attr("name", "experiment")
  .attr("value", experiment);

  form.append("input")
  .attr("type", "hidden")
  .attr("name", "assignmentId")
  .attr("value", assignmentId);

  form.append("input")
  .attr("type", "hidden")
  .attr("name", "workerId")
  .attr("value", workerId);

  var q;

  form.append("div")
  .html("We will now ask for demographic information. You will also have the chance to give feedback. <br />");

  var dlist = form.append("ol");

  var genders = ["Male", "Female", "Other", "Decline to state"];
  var educations = ["Some high school", "High school degree", "Some college", "College degree", "Graduate degree"];
  var experiences = ["1. No experience", "2.", "3. Some experience", "4.", "5. A great deal of experience"];

  var visionQ = dlist.append("li").html("Do you have normal vision (or vision which has been corrected to normal)? <br />");
  q = visionQ.append("label");

  q.append("input")
  .attr("type", "radio")
  .attr("name", "vision")
  .attr("required", "required")
  .attr("value", "Yes");

  q.append("span").html("Yes <br />");

  q = visionQ.append("label");

  q.append("input")
  .attr("type", "radio")
  .attr("name", "vision")
  .attr("required", "required")
  .attr("value", "No");
  q.append("span").html("No <br />");

  var genderQ = dlist.append("li").html("What is your gender <br />");


  for (var gender of genders) {
    q = genderQ.append("label");

    q.append("input")
    .attr("type", "radio")
    .attr("name", "gender")
    .attr("required", "required")
    .attr("value", gender);

    q.append("span").html(gender + "<br />");
  }

  var eduQ = dlist.append("li").html("What is your highest level of education? <br />");

  for (var education of educations) {
    q = eduQ.append("label");

    q.append("input")
    .attr("type", "radio")
    .attr("name", "education")
    .attr("required", "required")
    .attr("value", education);

    q.append("span").html(education + "<br />");
  }

  var expQ = dlist.append("li").html("How do you rate your experience interpreting graphs and charts (1-5)? <br />");

  for (var i = 0;i < experiences.length;i++) {
    q = expQ.append("label");

    q.append("input")
    .attr("type", "radio")
    .attr("name", "experience")
    .attr("required", "required")
    .attr("value", i);

    q.append("span").html(experiences[i] + "<br />");
  }

  var ageQ = dlist.append("li").html("What is your age? <br />");

  ageQ.append("input")
  .attr("type", "number")
  .attr("name", "age")
  .attr("required", "required")
  .attr("min", "18")
  .attr("max", "100");


  var commentQ = dlist.append("li").html("Any additional comments of feedback? <br />");

  commentQ.append("textarea")
  .attr("name", "comments")
  .attr("rows", "4")
  .attr("cols", "50");

  riskAversion(form);

  form.append("input")
  .attr("id", "turkBtn")
  .attr("type", "submit")
  .attr("class", "button")
  .attr("type", "submit")
  .attr("name", "submit")
  .attr("value", "Submit");

}

function ineligible() {
  main.selectAll("*").remove();
  main.append("p")
  .html("We're sorry, but your responses indicate that you are not eligible to participate in this study.");

  main.append("p")
  .html("Please consult our <a href=\"consent.html\" target=\"_blank\">consent form</a> for more information.");

}

consent();
