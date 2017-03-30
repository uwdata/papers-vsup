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

function makeHexmap(svg, x, y, size, data, z, maxSize, name){
  var w = size/data[0].length;
  var h = size/data.length;

  var heatmap = svg.append("g")
             .attr("transform","translate("+(x+maxSize)+","+(y+maxSize)+")");

  if(name){
    heatmap.attr("id",name);
  }

  heatmap.selectAll("g")
  .data(data)
  .enter()
  .append("g")
  .selectAll("path")
    .data(function(d,i){ return d.map(function(val){ return {r:i, v:val};});})
    .enter()
    .append("path")
    .datum(function(d,i){ d.c = i; return d; })
    .attr("d", function(d){ return makeHexagon(z(d.v).s,d.c*w,d.r*h);})
    .attr("fill", function(d){ return z(d.v).c;});
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
    .attr("d", function(d){ return makeArcHexagon(d,z(d.v).s,data.length,data[d.r].length,size);})
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

function toVisualAngle(pixels){
  //assume 96 dpi and 24" from screen,
  // so each pixel is 0.0213 degrees of visual angle.
  return Math.abs(pixels*0.0213);
}

function sizeThreshold(color1,color2,size,p){
  //Are two colors sufficiently distinct such that
  //p% of people will discriminate between them?
  var c1 = d3.lab(color1);
  var c2 = d3.lab(color2);

  //per axis values
  dist = [
    Math.abs(c1.l-c2.l),
    Math.abs(c1.a-c2.a),
    Math.abs(c1.b-c2.b)
  ];

  var nd = ND(p,size);

  return (dist[0]>=nd[0] || dist[1]>=nd[1] || dist[2]>=nd[2]);
}

function pGivenS(color1,color2,size){
  //What's the probability that these colors will be distinguished,
  //given their size?
  var c1 = d3.lab(color1);
  var c2 = d3.lab(color2);
  var axes = ["l","a","b"];
  A = [
    10.16,
    10.68,
    10.70
  ];

  B = [
    1.50,
    3.08,
    5.74
  ];

  var p,diff;
  var maxP = 0;

  for(var i = 0;i<axes.length;i++){
    diff = Math.abs(c1[axes[i]]-c2[axes[i]]);
    p = diff/(A[i] + (B[i]/size));
    if(p>maxP){
      maxP = p;
    }
  }

  return Math.min(1,maxP);
}

function pGivenS(threshold,size){
  //What's the probability that a given CIELAB distance will be distinguished,
  //given a size?
  var axes = ["l","a","b"];
  A = [
    10.16,
    10.68,
    10.70
  ];

  B = [
    1.50,
    3.08,
    5.74
  ];

  var p;
  var maxP = 0;

  for(var i = 0;i<axes.length;i++){
    p = threshold/(A[i] + (B[i]/size));
    if(p>maxP){
      maxP = p;
    }
  }

  return Math.min(1,maxP);
}

function ND(p,s){
  //The step size, per axis in CIELAB color space
  //to suggest that p% of people will distinguish between two colors
  //From Stone et al. 2014

  A = [
    10.16,
    10.68,
    10.70
  ];

  B = [
    1.50,
    3.08,
    5.74
  ];

  nd = [
    p*(A[0] + (B[0]/s)),
    p*(A[1] + (B[1]/s)),
    p*(A[2] + (B[2]/s))
  ];

  return nd;
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

function passesSizeThreshold(colorRamp,p,size,threshold){
  //Are the colors really distinct enough, given how small the marks get?
  var minD, D,c1,c2;

  for(var i = 0;i<colorRamp.length;i++){
    for(var j = 0;j<colorRamp[i].length-1;j++){
      for(var k = j+1;k<colorRamp[i].length;k++){
        if(!sizeThreshold(colorRamp[i][j].c,colorRamp[i][k].c,size*colorRamp[i][j].s,p)){
          return false;
        }
      }
    }
  }
  return true;
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

function makeScaleFunction(scaleData, mappingFunction){
  //a quantized scale function from a given scale
  return function f(d){
    var u,v;
    var i = 0;
    var j = 0;

    var rows = d3.scaleQuantize().domain([0,1]).range(scaleData);
    var row = rows(d.u);

    var cols = d3.scaleQuantize().domain([0,1]).range(row);
    var value = cols(d.v);

    return mappingFunction(value);
  }
}

function colorDiff(scaleData, uSL){
  var colors = scaleData.reduce(function(arr, curr) {
    return arr.concat(curr.map(uSL));
  }, []);
  return minDist(colors);
}

function colorSizeDiff(scaleData, threshold, startSize, uSize){
  //Returns difference not in terms of color distance,
  //but as a function of whether or not the colors are at least
  //as descriminable as our target threshold, given their decreasing size.
  var colors = scaleData.map(function(row) {
    return row.map(uSize);
  });
  var p = pGivenS(threshold,startSize);

  return passesSizeThreshold(colors,p,startSize);
}

function makeMaps(map, threshold, maxSize){
  //Create all relevant maps
  var DEFAULT_THRESHOLD = 5;
  var THRESHOLD = threshold ? threshold : DEFAULT_THRESHOLD;
  var scaleData, arcScaleData, arcSizeScaleData, closest, n;

  var uSL = makeuSL(map);
  var uSize = makeuSize(map, maxSize);

  n = 2;
  while (true) {
    var data = makeScaleData(n);
    var c = colorDiff(data, uSL);
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
    var c = colorDiff(data, uSL);
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
    var startsize = toVisualAngle(45);
    var data = makeArcScaleData(n);
    if(colorSizeDiff(data,THRESHOLD,startsize,uSize)){
      arcSizeScaleData = data;
      closest = colorDiff(data, uSL);
    } else {
      break;
    }
    n++;
  }
  if (!closest) {
    console.log("No valid arc size color map at threshold "+THRESHOLD);
  } else {
    console.log("The two closest matrix colors:(" + closest.c1 +"," + closest.c2 +") are "+closest.minD+" units apart in CIELAB");
  }

  return {square:scaleData, arc:arcScaleData, arcSize: arcSizeScaleData};
}

function makeFlightExample(svg, colorScale, map, data, type) {
  var w = 560;
  var h = 240;

  var x = d3.scaleBand().range([0, w]).domain(data.map(function(d) { return d.DepTimeBlk; }));
  var y = d3.scaleBand().range([0, h]).domain(data.map(function(d) { return d.DayOfWeek; }));

  // special scales for axes
  var xAxis = d3.scalePoint().range([0, w]).domain([0, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
  var yAxis = d3.scaleBand().range([0, h]).domain(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);

  var uScale = d3.scaleLinear().domain(d3.extent(data.map(function(d) { return d.StdMeanErr; }))).range([0,1]).nice(map.length);
  var vScale = d3.scaleLinear().domain(d3.extent(data.map(function(d) { return d.DepDelay; }))).range([0,1]).nice(map[0].length);

  var heatmap = svg.attr("width", w + 100).attr("height", h + 60).append("g")
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
  var legendX = w + 140;
  var legendY = 40;
  if (type === "arc") {
    var legendSize = 180;
    makeArcmap(heatmap, legendX, legendY, legendSize,map,colorScale);
    makeArcLegend(heatmap, legendX, legendY, legendSize, map, vScale.ticks(10), uScale.domain(), "Departure Delay (minutes)", "Standard Mean Error");
  } else {
    var legendSize = 160;
    makeHeatmap(heatmap, legendX, legendY, legendSize,map,colorScale);
    makeHeatmapLegend(heatmap, legendX, legendY, legendSize, map, vScale.domain(), uScale.domain(), "Departure Delay (minutes)", "Standard Mean Error");
  }
}

function makeArcLegend(svg, x, y, size, map, vTicks, uDom, vTitle, uTitle) {
  var uStep = (uDom[1] - uDom[0]) / map.length;
  var uDom = d3.range(uDom[0], uDom[1] + uStep, uStep);

  var legend = svg.append("g").attr("transform", "translate(" + x + "," + y + ")");

  var uScale = d3.scalePoint().domain(uDom).range([0, size]);
  var uAxis = d3.axisRight(uScale);
  var px = size/180;
  legend.append("g")
    .attr("transform", "translate(" + (size + 6 * px) + "," + (28 * px) + ")rotate(30)")
    .call(uAxis);

  legend.append("text")
    .attr("transform", "translate(" + (size + 10 * px) + "," + (28 * px + size / 2) + ")rotate(-60)")
    .style("text-anchor", "middle")
    .style("font-size", 13)
    .text(uTitle);

  var angle = d3.scaleLinear()
    .domain([vTicks[0], vTicks[vTicks.length - 1]])
    .range([-30, 30]);

  var offset = 3 * px;

  var arc = d3.arc()
    .innerRadius(size + offset)
    .outerRadius(size + offset + 1)
    .startAngle(-Math.PI/6)
    .endAngle(Math.PI/6);

  var arcAxis = legend.append("g")
    .attr("transform", "translate(" + (size / 2) + "," + (size - offset) + ")");

  arcAxis.append("path")
    .attr("fill", "black")
    .attr("stroke", "transparent")
    .attr("d", arc);

  var labelEnter = arcAxis.selectAll(".arc-label").data(vTicks).enter()
    .append("g")
      .attr("class", "arc-label")
      .attr("transform", function(d) {
        return "rotate(" + angle(d) + ")translate(" + 0 + "," + (-size - offset) + ")";
      })

  labelEnter.append("text")
    .style("font-size", "11")
    .style("text-anchor", "middle")
    .attr("y", -10)
    .text(d3.format(".1f"));

  labelEnter.append("line")
    .attr("x1", 0.5)
    .attr("x2", 0.5)
    .attr("y1", -6)
    .attr("y2", 0)
    .attr("stroke", "#000");

  legend.append("text")
    .style("text-anchor", "middle")
    .style("font-size", 13)
    .attr("x", size/2)
    .attr("y", -35)
    .text(vTitle);
}

function makeHeatmapLegend(svg, x, y, size, map, vDom, uDom, vTitle, uTitle) {
  var legend = svg.append("g").attr("transform", "translate(" + x + "," + y + ")");

  var uStep = (uDom[1] - uDom[0]) / map.length;
  var uDom = d3.range(uDom[0], uDom[1] + uStep, uStep);

  var vStep = (vDom[1] - vDom[0]) / map[0].length;
  var vDom = d3.range(vDom[0], vDom[1] + vStep, vStep);

  var xAxis = d3.scalePoint().range([0, size]).domain(vDom);

  legend.append("g")
    .attr("transform", "translate(0, 0)")
    .call(d3.axisTop(xAxis).tickFormat(d3.format("d")));

  legend.append("text")
    .style("text-anchor", "middle")
    .style("font-size", 13)
    .attr("transform", "translate(" + (size / 2) + ", " + (-40) + ")")
    .text(vTitle);

  var yAxis = d3.scalePoint().range([0, size]).domain(uDom);

  legend.append("g")
    .attr("transform", "translate(" + size + ", 0)")
    .call(d3.axisRight(yAxis).tickFormat(d3.format("d")));

  legend.append("text")
    .style("text-anchor", "middle")
    .style("font-size", 13)
    .attr("transform", "translate(" + (size + 40) + ", " + (size / 2) + ")rotate(90)")
    .text(uTitle);
}

//Uncertainty maps

function makeuSL(map) {
  return function(d) {
    var c = (d3.hsl(map(d.v)));
    var iVal = d3.scaleLinear().domain([0,1]).range([0.0,1.0]);
    return d3.interpolateLab(c,"white")(iVal(d.u));
  }
}

function makeuSize(map, maxSize) {
  return function(d) {
    //size and color
    var c = (d3.hsl(map(d.v)));
    var sizeVal = d3.scaleLinear().domain([0,1]).range([maxSize,0]);
    return {"c": c, "s" : sizeVal(d.u)};
  }
}
