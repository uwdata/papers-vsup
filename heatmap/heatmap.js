
var svg = d3.select("body").append("svg");
var map = colorbrewer.YlGnBu[9];
var z = d3.scale.quantize().range(map);
var u = d3.scale.quantize().range(colorbrewer.Greys[9]);

function makeHeatmap(x,y,size,data,z,name){
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
    .attr("fill", function(d){ return z(d);});
}

function makeArcmap(x,y,size,data,z,name){
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
    .attr("d", function(d){ return makeArc(d,size,data.length,data[d.r].length)();})
    .attr("fill", function(d){ return z(d);});

}

function makeArc(d,size,rows,cols){
  var angle = d3.scale.linear().domain([0,cols]).range([-Math.PI/6,Math.PI/6]);
  var radius = d3.scale.linear().domain([0,rows]).range([size,0]);

  var arc = d3.svg.arc()
  .innerRadius(radius(d.r+1))
  .outerRadius(radius(d.r))
  .startAngle(angle(d.c))
  .endAngle(angle(d.c+1));

  return arc;
}

//should use d3.interpolateLab for colors.

function cDist(color1,color2){
  //Euclidean distance between two colors in Lab space.
  var c1 = d3.lab(color1);
  var c2 = d3.lab(color2);

  return Math.sqrt( Math.pow( (c1.l-c2.l),2) + Math.pow(c1.a-c2.a,2) + Math.pow(c1.b - c2.b,2));
}

function minDist(colorRamp){
  //What's the closest distance between colors, in our array of colors?
  var minD, D;

  for(var i = 0;i<colorRamp.length;i++){
    for(var j = i+1;j<colorRamp.length;j++){
        D = cDist(colorRamp[i],colorRamp[j]);
        if((i==0 && j==1) || D<minD){
          minD = D;
        }
    }
  }

  return minD;
}

function checkMap(mapName){
  //Takes a d3 selection containing all the marks we care about
  //Checks to make sure that colors it contains are sufficiently far apart.
  var colorList = [];
  var aColor;

  mapName
    .each(function(d){
      aColor = d3.select(this).attr("fill");
      if(!colorList.includes(aColor)){
        colorList.push(aColor);
      }
    });

    var closest = minDist(colorList);
    console.log( "The two closest colors are "+closest+" apart in CIELAB.");
    return closest>5;
}

function main(){
  //Create all relevant maps

  /*TODO
  We'll need:
  1) Juxtaposed Data/Uncertainty maps
  2) Integrated map with regular "square" mapping
  3) Integrated map with "arc" mapping
  4) Legends for both square and arc maps.
  */

  var data = [
    [1,2,3],
    [4,5,6],
    [7,8,9]
  ];

  var uncertainty = [
    [0,0.1,0.2],
    [0.3,0.4,0.5],
    [0.6,0.7,0.8]
  ];

  var arcData = [
    [1,2,3],
    [4,5],
    [6]
  ];

  var scaleData = [
    [{v:0.25,u:0.0},{v:0.5,u:0.0},{v:0.75,u:0.0},{v:1.0,u:0.0}],
    [{v:0.25,u:0.25},{v:0.5,u:0.25},{v:0.75,u:0.25},{v:1.0,u:0.25}],
    [{v:0.25,u:0.5},{v:0.5,u:0.5},{v:0.75,u:0.5},{v:1.0,u:0.5}],
    [{v:0.25,u:0.75},{v:0.5,u:0.75},{v:0.75,u:0.75},{v:1.0,u:0.75}]
  ];

  var arcScaleData = [
    [{v:0.25,u:0.0},{v:0.5,u:0.0},{v:0.75,u:0.0},{v:1.0,u:0.0}],
    [{v:0.25,u:0.25},{v:0.5,u:0.25},{v:1.0,u:0.25}],
    [{v:0.25,u:0.5},{v:1.0,u:0.5}],
    [{v:0.5,u:0.75}]
  ];

  z.domain([d3.min(d3.min(data)),d3.max(d3.max(data))]);
  u.domain([0,1]);

  makeHeatmap(0,0,250,scaleData, function(d){ return uL(d.v);}, "SquareLightness");
  makeArcmap(300,0,250,arcScaleData, function(d){ return uL(d.v);}, "ArcLightness");

  makeHeatmap(0,300,250,scaleData, function(d){ return uS(d.v);}, "SquareSaturation");
  makeArcmap(300,300,250,arcScaleData, function(d){ return uS(d.v);}, "ArcSaturation");
  //makeArcmap(0,300,250,arcData,function(d){ return z(d.v);},"arc");
  //makeArcmap(300,300,250,arcData,function(d){ return u((d.v)/6.0);},"arcUncertainty");

  makeHeatmap(0,600,250,scaleData, function(d){ return uSL(d.v);}, "SquareWhite");
  makeArcmap(300,600,250,arcScaleData, function(d){ return uSL(d.v);}, "ArcWhite");

}

//Uncertainty maps

function uL(d){
  //use lightness to encode uncertainty
  var cScale = d3.scale.quantize().domain([0,1]).range(map);
  var steps = map.length;
  var c = (d3.lab(cScale(d.v)));
  //colors start at different lightnesses, so we have limited range here
  var lScale = d3.scale.linear().domain([0,1]).range([c.l,100]);
  c.l = lScale(d.u);

  return c;
}

function uS(d){
  //use saturation to encode uncertainty
  var cScale = d3.scale.quantize().domain([0,1]).range(map);
  var steps = map.length;
  var c = (d3.hsl(cScale(d.v)));
  var sScale = d3.scale.linear().domain([0,1]).range([c.s,0.0]);
  c.s = sScale(d.u);

  return c;
}

function uSL(d){
  //interpolate to white
  var cScale = d3.scale.quantize().domain([0,1]).range(map);
  var steps = map.length;
  var c = (d3.hsl(cScale(d.v)));
  var iVal = d3.scale.linear().domain([0,1]).range([0.0,1.0]);
  return d3.interpolateLab(c,"white")(iVal(d.u));
}

main();
