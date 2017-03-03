var map = colorbrewer.YlGnBu[9];

var width = 300;
var height = 300;

var x = d3.scale.linear().range([0,width]);
var y = d3.scale.linear().range([0,height]);
var z = d3.scale.quantize().range(map);

var data = [
  [1,2,3],
  [4,5,6],
  [7,8,9]
];

var uncertainty = [
  [1,1,1],
  [1,1,1],
  [1,1,1]
];

x.domain([0,data[0].length]);
y.domain([0,data.length]);
z.domain([d3.min(d3.min(data)),d3.max(d3.max(data))]);

var w = width/data[0].length;
var h = height/data.length;

var svg = d3.select("body").append("svg")
  .attr("width",width)
  .attr("height",height);

var cells = svg.selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .selectAll("rect")
      .data(function(d,i){ return d.map(function(val){ return {r:i, v:val};});})
      .enter()
      .append("rect")
      .datum(function(d,i){ d.c = i; d.u = uncertainty[d.r][d.c]; return d; })
      .attr("x",function(d){ return x(d.c);})
      .attr("y",function(d){ return y(d.r);})
      .attr("width",w)
      .attr("height",h)
      .attr("fill",function(d){ return z(d.v);});


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
