
var svg = d3.select("body").append("svg");

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

function makeArcmap(x,y,size,data,z){
  //creates an svg "wedge" map
  //TODO finish arcmap function

}

function lerp(v1,v2,amount){
       amount = Math.min(Math.max(amount,0),1);
       return v1 + (v2 - v1) * amount;
}

function labLerp(c1,c2,amount){
  //Linearly interpolates two colors in CIELAB space
  var lc1 = d3.lab(c1);
  var lc2 = d3.lab(c2);
  return d3.lab( lerp(lc1.l,lc2.l,amount), lerp(lc1.a,lc2.a,amount), lerp(lc1.b,lc2.b,amount));

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

  var map = colorbrewer.YlGnBu[9];
  var z = d3.scale.quantize().range(map);
  var u = d3.scale.quantize().range(colorbrewer.Greys[9]);

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

  z.domain([d3.min(d3.min(data)),d3.max(d3.max(data))]);
  u.domain([0,1]);

  makeHeatmap(0,0,250,data,function(d){ return z(d.v);},"value");
  makeHeatmap(300,0,250,uncertainty,function(d){ return u(d.v);},"uncertainty");
}

main();
