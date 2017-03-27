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

var startTime;
var main = d3.select("#fcontainer");
var done = false;

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
  .on("click",finishConsent);

  if(assignmentId=="ASSIGNMENT_ID_NOT_AVAILABLE"){
    readyBtn.attr("disabled","disabled");
    readyBtn.attr("value","PREVIEW");
  }

}

function finishConsent(){
  main.selectAll("*").remove();
  postTest();
  //Thing to do when we've consented.
  //Ought to be setting up for a tutorial.
}

function tutorial(){
  //Set up tutorial. When we're done, start the main task
}

function task(){
 //Set up the main task. Should have a button that calls "writeAnswer"
}

function initialize(){
  //What to do when we have a new question
  starttime = (new Date()).getTime();

}

function writeAnswer(response){
  //Called when we answer a question in the main task
  //XML to call out to a php script to store our data in a csv over in ./data/
  var rt = (new Date()).getTime() - startTime;
  var writeRequest = new XMLHttpRequest();
  var writeString = "answer="+JSON.stringify(response);
  writeRequest.open("GET","data/writeJSON.php?"+writeString,true);
  writeRequest.setRequestHeader("Content-Type", "application/json");
  writeRequest.addEventListener("load",doneAnswer);
  writeRequest.send();
}

function doneAnswer(){
  //What to do when we get our XML request back.

  //TODO error handling here
  //console.log(this.responseText);

  //Should check to see if we've run out of questions to answer
  if(done){
    finishTask();
  }
  else{
    initialize();
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

consent();
