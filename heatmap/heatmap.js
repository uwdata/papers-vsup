
//Global Variables

var body = d3.select("body");

var svg = body.append("svg").attr("height", 900).append("g").attr("transform","translate(10, 10)");

var map = d3.interpolateViridis;

//Other maps to test:
// interpolateViridis
// interpolateInferno
// interpolatePlasma
// interpolateWarm
// interpolateCool

//Chart creation functions

function makeHeatmap(svg, x, y, size, data, z, name){
  //creates an svg heatmap with a 2d matrix of data, and a mapping function z
  var w = size/data[0].length;
  var h = size/data.length;

  var heatmap = svg.append("g")
             .attr("transform","translate("+x+","+y+")");

  if(name){
    heatmap.attr("id",name);
  }

  heatmap.selectAll("g")
  .data(data)
  .enter()
  .append("g")
  .selectAll("rect")
    .data(function(d,i){ return d.map(function(val){ return {r:i, v:val};});})
    .enter()
    .append("rect")
    .datum(function(d,i){ d.c = i; return d; })
    .attr("x", function(d){ return d.c*w;})
    .attr("y", function(d){ return d.r*h;})
    .attr("width",w)
    .attr("height",h)
    .attr("fill", function(d){ return z(d.v);});
}

function makeArcmap(svg, x, y, size, data, z, name){
  //creates an svg "wedge" map
  var w = size/data[0].length;
  var h = size/data.length;

  var arcmap = svg.append("g")
             .attr("transform","translate("+(x+size/2)+","+(y+size)+")");

  if(name){
    arcmap.attr("id",name);
  }

  arcmap.selectAll("g")
  .data(data)
  .enter()
  .append("g")
  .selectAll("path")
    .data(function(d,i){ return d.map(function(val){ return {r:i, v:val};});})
    .enter()
    .append("path")
    .datum(function(d,i){ d.c = i; return d; })
    .attr("d", function(d){ return makeArc(d,size,data.length,data[d.r].length);})
    .attr("fill", function(d){ return z(d.v);});
}

function makeArc(d,size,rows,cols){
  var angle = d3.scaleLinear().domain([0,cols]).range([-Math.PI/6,Math.PI/6]);
  var radius = d3.scaleLinear().domain([0,rows]).range([size,0]);

  var arc = d3.arc()
    .innerRadius(radius(d.r+1))
    .outerRadius(radius(d.r))
    .startAngle(angle(d.c))
    .endAngle(angle(d.c+1));

  return arc();
}

function makeArcHexmap(svg, x, y, size, data, z, name){
  //creates an svg "hexwedge" map of regular hexagons

  var r = size/data[0].length;
  var h = size/data.length;
  r/=2;

  //other display options:
  //var xPos = d3.scaleLinear().domain([0,data[0].length]).range([r,size-r]);
  //pack hexs as tightly as possible in y
  //var yPos = d3.scaleLinear().domain([0,data.length]).range([r,2*data.length*r]);
  //pack hexs as loosely as possible in y
  //var yPos = d3.scaleLinear().domain([0,data.length-1]).range([h/2,size-(h/2)]);

  //currently, lay hexes out in radial fashion.
  var arcmap = svg.append("g")
             .attr("transform","translate("+(x+size/2)+","+(y+size)+")");

  if(name){
    arcmap.attr("id",name);
  }

  arcmap.selectAll("g")
  .data(data)
  .enter()
  .append("g")
  .selectAll("path")
    .data(function(d,i){ return d.map(function(val){ return {r:i, v:val};});})
    .enter()
    .append("path")
    .datum(function(d,i){ d.c = i; return d; })
    .attr("d", function(d){ return makeArcHexagon(d,r*z(d.v).s,data.length,data[d.r].length,size);})
  //  .attr("d", function(d){ return makeHexagon(r,xPos(d.c + ((data[0].length - data[d.r].length)/2)),yPos(d.r));})
    .attr("fill", function(d){ return z(d.v).c;});
}

function makeArcHexagon(d,r,rows,cols,size){
  //radial layout
  var x,y,a;
  var angle = d3.scaleLinear().domain([0,cols]).range([-Math.PI/6,Math.PI/6]);
  var radius = d3.scaleLinear().domain([0,rows]).range([size,0]);
  a = angle(d.c+0.5);
  x = Math.cos(a-(Math.PI/2))*radius(d.r+0.5);
  y = Math.sin(a-(Math.PI/2))*radius(d.r+0.5);
  return makeHexagon(r,x,y);
}

function makeHexagon(r,x,y){
  var h = Math.sqrt(3)/2;
  var points = [
    {"x": r+x, "y": y },
    {"x": (r/2)+x, "y": y+(h*r) },
    {"x": (-r/2)+x, "y": y+(h*r)},
    {"x": -r+x, "y": y },
    {"x": (-r/2)+x, "y": (-r*h)+y },
    {"x": (r/2)+x, "y": (-r*h)+y }
  ];

  var line = d3.line()
    .x(function(d){ return d.x;})
    .y(function(d){ return d.y;});

  return line(points);
}

//Data loading and generation

function gradientData(rows, cols) {
  var data = [];
  for(var i = 0; i<rows; i++){
    data[i] = [];
    for(var j = 0; j<cols; j++){
      data[i].push({ u: i/(rows-1), v: j/(cols-1)});
    }
  }

  return data;
}

function randomData(rows,cols){
  //uniform random data
  var data = [];
  for(var i = 0; i<rows; i++){
    data[i] = [];
    for(var j = 0; j<cols; j++){
      data[i].push({ u: Math.random(), v: Math.random() });
    }
  }

  return data;
}

//should use d3.interpolateLab for colors.

function cDist(color1,color2){
  //Euclidean distance between two colors in Lab space.
  var c1 = d3.lab(color1);
  var c2 = d3.lab(color2);

  return Math.sqrt(Math.pow( (c1.l-c2.l),2) + Math.pow(c1.a-c2.a,2) + Math.pow(c1.b - c2.b,2));
}

function cSizeDist(color1,color2,size){
  //Based on Stone 2014, we expect the same color difference to
  //"count" for less, as sizes decrease.
  //since we are defining tolerances as initial distances, rather than
  //JNDs, "size" is the [0,1] percentage of the original glyph size.


  //if ND(p,s) = tolerance
  //then ND(p,s*size) = tolerance + 1/size * K
  //where K(L) = 0.75, K(a) = 1.54, K(b) = 2.87

  if(size==1){
    return cDist(color1,color2);
  }
  else{
    var c1 = d3.lab(color1);
    var c2 = d3.lab(color2);

    var Lab = [
      Math.abs(c1.l-c2.l)  +  ((1/(size)) * 0.75),
      Math.abs(c1.a-c2.a) + ((1/(size)) * 1.54),
      Math.abs(c1.b-c2.b) + ((1/(size)) * 0.75)
    ];
    return Math.sqrt( Math.pow(Lab[0],2) + Math.pow(Lab[1],2) + Math.pow(Lab[2],2));
  }
}

function minDist(colorRamp){
  //What's the closest distance between colors, in our array of colors?
  var minD, D,c1,c2;

  for(var i = 0;i<colorRamp.length;i++){
    for(var j = i+1;j<colorRamp.length;j++){
        D = cDist(colorRamp[i],colorRamp[j]);
        if((i==0 && j==1) || D<minD){
          minD = D;
          c1 = colorRamp[i];
          c2 = colorRamp[j];
        }
    }
  }

  return {"minD": minD, "c1": c1, "c2": c2};
}

function minSizeDist(colorRamp){
  //What's the closest distance between colors, in our 2D array of colors?
  var minD, D,c1,c2,size;

  for(var i = 0;i<colorRamp.length;i++){
    for(var j = 0;j<colorRamp[i].length-1;j++){
      for(var k = j+1;k<colorRamp[i].length;k++){
        D = cSizeDist(colorRamp[i][j].c,colorRamp[i][k].c, colorRamp[i][j].s);
        if((i==0 && j==0 && k==1) || D<minD){
          minD = D;
          c1 = colorRamp[i][j].c;
          c2 = colorRamp[i][k].c;
          size = colorRamp[i][j].s;
        }
      }
    }
  }
  return {"minD": minD, "c1": c1, "c2": c2, "size": size };
}

function distanceMatrix(scaleData){
  var colors = scaleData.reduce(function(arr, curr) {
    return arr.concat(curr.map(uSL));
  }, []);
  //What's the distance between all colors in the ramp?
  var matrix = [colors.length];

  for(var i = 0;i<colors.length;i++){
    matrix[i] = [colors.length];
    //give the row a label
    matrix[i].name = colors[i];
    for(var j = 0;j<colors.length;j++){
      matrix[i][j] = cDist(colors[i],colors[j]);
    }
  }
  return matrix;
}

/**
 * Uncertainty is in the range from 0 to 1-1/n.
 * Value is in the range of 0 to 1.
 */
function makeScaleData(n) {
  var arr = [];
  for (var u = 0; u < n; u++) {
    var row = [];
    for (var v = 0; v < n; v++) {
      row.push({u: u/n, v: v/(n - 1)});
    }
    arr.push(row);
  }
  return arr;
}

/**
 * Value is in the range 0 to 1.
 * Uncertainty is in the range 0 to 1-1/n.
 */
function makeArcScaleData(n) {
  var arr = [];
  var perRow = n;
  var numRows = Math.floor(Math.log2(n));
  var u = 0;
  while(perRow>=2){
    var row = [];
    for (var v = 0; v < perRow; v++) {
      row.push({u: u/numRows, v: v/(perRow-1)});
    }
    arr.push(row);
    u++;
    perRow= Math.floor(perRow/2);
  }

  // tip
  arr.push([{u: (n-1)/n, v:1/n}]);

  return arr;
}

function makeScaleFunction(scaleData,mappingFunction){
  //a quantized scale function from a given scale
  return function f(d){
    var u,v;
    var i = 0;
    var j = 0;

    var rows = d3.scaleQuantize().domain([0,1]).range(scaleData);
    var row = rows(d.u);

    var cols = d3.scaleQuantize().domain([0,1]).range(row);
    var value = cols(d.v);

    if(!mappingFunction){
      return uSL(value);
    }
    else{
      return mappingFunction(value);
    }
  }
}

function numBins(scaleData){
  var colors = scaleData.reduce(function(arr, curr) {
    return arr.concat(curr.map(uSL));
  }, []);
  return colors.length;
}

function colorDiff(scaleData){
  var colors = scaleData.reduce(function(arr, curr) {
    return arr.concat(curr.map(uSL));
  }, []);
  return minDist(colors);
}

function colorSizeDiff(scaleData){
  var colors = scaleData.map(function(row) {
    return row.map(uSize);
  });
  return minSizeDist(colors);
}

function makeMaps(threshold){
  //Create all relevant maps
  var DEFAULT_THRESHOLD = 5;
  var THRESHOLD = threshold ? threshold : DEFAULT_THRESHOLD;
  var scaleData, arcScaleData, arcSizeScaleData, closest, n;

  n = 2;
  while (true) {
    var data = makeScaleData(n);
    var c = colorDiff(data);
    if (c.minD >= THRESHOLD) {
      scaleData = data;
      closest = c;
    }
    else {
      break;
    }
    n++;
  }
  if (!closest) {
    console.log("No valid matrix color map at threshold "+THRESHOLD);
  }
  else{
    console.log("The two closest arc size colors:(" + closest.c1 +"," + closest.c2 +") are "+closest.minD+" apart in CIELAB.");
  }
  n = 2;
  while (true) {
    var data = makeArcScaleData(n);
    var c = colorDiff(data);
    if (c.minD >= THRESHOLD) {
      arcScaleData = data;
      closest = c;
    } else {
      break;
    }
    n++;
  }
  if (!closest) {
    console.log("No valid arc color map at threshold "+THRESHOLD);
  } else {
    console.log("The two closest arc colors:(" + closest.c1 +"," + closest.c2 +") are "+closest.minD+" apart in CIELAB.");
  }

  n = 2;
  while (true) {
    var data = makeArcScaleData(n);
    var c = colorSizeDiff(data);
    if (c.minD >= THRESHOLD) {
      arcSizeScaleData = data;
      closest = c;
    } else {
      break;
    }
    n++;
  }
  if (!closest) {
    console.log("No valid arc size color map at threshold "+THRESHOLD);
  } else {
    console.log("The two closest matrix colors:(" + closest.c1 +"," + closest.c2 +") are "+closest.minD+" pseudo-units apart in CIELAB, at a size ratio of "+closest.size);
  }

  return {square:scaleData, arc:arcScaleData, arcSize: arcSizeScaleData};
}

function main(){
  var maps = makeMaps(15);

  var squareScale = makeScaleFunction(maps.square);
  var arcScale = makeScaleFunction(maps.arc);
  var arcSizeScale = makeScaleFunction(maps.arcSize,uSize);

  makeHeatmap(svg, 0,0,250,maps.square, squareScale, "legendSquare");
  makeArcmap(svg, 300,0,250,maps.arc,arcScale,"legendArc");
  makeArcHexmap(svg, 600,0,250,maps.arcSize,arcSizeScale,"legendSizeArc");

  var gradient = gradientData(20,20);
  makeHeatmap(svg, 0,300,250,gradient, squareScale);
  makeHeatmap(svg, 300,300,250,gradient, arcScale);

  var random = randomData(5,5);
  makeHeatmap(svg, 0,600,250,random, squareScale);
  makeHeatmap(svg, 300,600,250,random, arcScale);

  // flight data example heatmap
  d3.csv("data.csv", function(data) {
    data = data.map(function(d) {
      return {
        DayOfWeek: +d.DayOfWeek,
        DepDelay: +d.DepDelay,
        DepTimeBlk: d.DepTimeBlk,
        StdMeanErr: +d.StdMeanErr
      }
    });
    makeFlightExample(arcScale, maps.arcmap, data);
  }); 
}

function makeFlightExample(colorScale, map, data) {
  var w = 580;
  var h = 240;

  var x = d3.scaleBand().range([0, w]).domain(data.map(function(d) { return d.DepTimeBlk; }));
  var y = d3.scaleBand().range([0, h]).domain(data.map(function(d) { return d.DayOfWeek; }));

  // special scales for axes
  var xAxis = d3.scalePoint().range([0, w]).domain([0, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
  var yAxis = d3.scaleBand().range([0, h]).domain(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
  
  var uScale = d3.scaleLinear().domain(d3.extent(data.map(function(d) { return d.StdMeanErr; }))).range([0,1]);
  var vScale = d3.scaleLinear().domain(d3.extent(data.map(function(d) { return d.DepDelay; }))).range([0,1]);

  var heatmap = body.append("svg").attr("width", w + 100).attr("height", h + 60).append("g")
            .attr("transform","translate(10,10)");

  heatmap.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.DepTimeBlk); })
    .attr("y", function(d) { return y(d.DayOfWeek); })
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("title", JSON.stringify)
    .attr("fill", function(d) { return colorScale({
      u: uScale(d.StdMeanErr),
      v: vScale(d.DepDelay)
    });});

  // axes
  heatmap.append("g")
    .attr("transform", "translate(0," + h + ")")
    .call(d3.axisBottom(xAxis));

  heatmap.append("text")
    .style("text-anchor", "middle")
    .style("font-size", 13)
    .attr("transform", "translate(" + (w / 2) + ", " + (h + 40) + ")")
    .text("Departure Time")

  heatmap.append("g")
    .attr("transform", "translate(" + w + ", 0)")
    .call(d3.axisRight(yAxis));

  heatmap.append("text")
    .style("text-anchor", "middle")
    .style("font-size", 13)
    .attr("transform", "translate(" + (w + 80) + ", " + (h / 2) + ")rotate(90)")
    .text("Day of the Week");

  // legend
  // makeArcmap(heatmap, w + 60,0,200,map,colorScale);
}

//Uncertainty maps

function uSL(d){
  //interpolate to white
  var c = (d3.hsl(map(d.v)));
  var iVal = d3.scaleLinear().domain([0,1]).range([0.0,1.0]);
  return d3.interpolateLab(c,"white")(iVal(d.u));
}

function uSize(d){
  //size and color
  var c = (d3.hsl(map(d.v)));
  var sizeVal = d3.scaleLinear().domain([0,1]).range([1,0]);
  return {"c": c, "s" : sizeVal(d.u)};
}

main();
