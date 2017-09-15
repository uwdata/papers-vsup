var dataOne;
var dataTwo;

process();

function process() {
  //Steps:
  // 1. Load in csvs of both raw data, and turk completion information.
  // 2. Filter out rows from turkIDs who didn't complete the HIT.
  // 5. Anonymize by replacing turkID with index in completion table.
  // 6. save that sucker for the repo (in cleandata.csv)
  // 7. do analysis.

  var demoTable = dl.csv("demo.csv");
  var dataOneTable = dl.csv("dataOne.csv");

  var cleanedOne = [];
  var valids = [];
  var turkId;
  var row;

  for(var i = 0;i<demoTable.length;i++) {
    row = demoTable[i];
    turkId = row.WorkerId;
    valids = dataOneTable.filter(function(x){ return x.workerId == turkId;});
    cleanedOne = cleanedOne.concat(valids);
  }

  for(var i = 0;i<cleanedOne.length;i++) {
    cleanedOne[i].correct = cleanedOne[i].error==0 ? 1 : 0;
    cleanedOne[i].condition = cleanedOne[i].binned + cleanedOne[i].shape;
    if(cleanedOne[i].vsum == "yes") {
      cleanedOne[i].condition = "vsum" + cleanedOne[i].condition;
    }
    writeRow(cleanedOne[i]);
  }

  dataOne = cleanedOne;
}

function writeRow(row) {
  var writeRequest = new XMLHttpRequest();
  var writeString = "clean=true&answer="+JSON.stringify(row);
  //console.log(writeString);
  writeRequest.open("GET","writeJSON.php?"+writeString,true);
  writeRequest.setRequestHeader("Content-Type", "application/json");
  writeRequest.send();
}

function cleanRows(rows, index) {
  var cleanedRows = [];
  var seen = dl.repeat(false,100);
  for(let row of rows) {
    row.id = index;
    if(!seen[row.index]){
      seen[row.index]=true;
      cleanedRows.push(row);
    }
  }
  return cleanedRows;
}

dl.mean.iqm = function(values, f) {
  if (f) values = values.map(dl.$(f));
  values = values.filter(dl.isValid).sort(dl.cmp);
  var mean = 0,
  n = values.length,
  c = n/4,
  v, i;
  for (i = c; i<(3*c); i+=0.25) {
    v = values[Math.floor(i)];
    mean+=0.25*v;
  }
  mean = n>0 ? mean/(2*c) : 0;
  return mean;
};

dl.bootstrap.midmeanci = function(values, a, b, c, d) {
  var X, N, alpha, smooth, bs, means, i;
  if (dl.isFunction(a) || dl.isString(a)) {
    X = values.map(dl.$(a));
    N = b;
    alpha = c;
    smooth = d;
  } else {
    X = values;
    N = a;
    alpha = b;
    smooth = c;
  }
  N = N ? +N : 1000;
  alpha = alpha || 0.05;

  bs = dl.random.bootstrap(X, smooth);
  for (i=0, means = Array(N); i<N; ++i) {
    means[i] = dl.mean.iqm(bs.samples(X.length));
  }
  means.sort(dl.numcmp);
  return [
          dl.quantile(means, alpha/2),
          dl.quantile(means, 1-(alpha/2))
          ];
};

function analysis() {
  dataOne = dl.csv("taskOne.csv");
  dataTwo = dl.csv("taskTwo.csv");
}

function bsci(data, facet, measure) {
  var values = d3.nest().key(function(d){ return d[facet];}).entries(data);
  var cis = values.map(function(d){ return {"key": d.key, "midmean": dl.mean.iqm(d.values,measure), "ci": dl.bootstrap.midmeanci(d.values,measure,1000)};});
  return cis;
}
