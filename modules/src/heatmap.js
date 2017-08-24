/*
A lightweight factory for making d3 heatmaps.
*/
import * as d3 from "d3";

export function simpleHeatmap(data,m_scale,m_size,m_svg,m_name,m_x,m_y) {
  var svg = m_svg,
  x = m_x ? m_x : 0,
  y = m_y ? m_y : 0,
  size = m_size ? m_size: 0,
  scale = m_scale ? m_scale : function(){ return "#fff"; },
  name = m_name;

  data = data ? data : [1];
  var h = size/data.length,
  grid;

  var heatmap = {};

  heatmap.make = function() {
    if(!svg){
      svg = d3.select("body").append("svg");
    }
    grid = svg.append("g")
      .attr("transform","translate("+x+","+y+")");

    grid.selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .selectAll("rect")
        .data(function(d,i){ return d.map(function(val){ return {r:i, v:val};});})
        .enter()
        .append("rect")
        .datum(function(d,i){ d.c = i; return d; });

    heatmap.setProperties();

    if(name) {
      grid.attr("id",name);
    }
  };

  heatmap.data = function(newData) {
    if(!arguments.length) {
      return data;
    }
    else {
      data = newData;
      h = size/data.length;
      grid.selectAll("g").remove("*");
      heatmap.make();
      return heatmap;
    }
  };

  heatmap.svg = function(newSvg) {
    if(!arguments.length) {
      return svg;
    }
    else {
      svg = newSvg;
      grid.selectAll("g").remove("*");
      heatmap.make();
      return heatmap;
    }
  };

  heatmap.x = function(newX) {
    if(!arguments.length) {
      return x;
    }
    else {
      x = newX;
      grid.attr("transform","translate("+x+","+y+")");
      return heatmap;
    }
  };

  heatmap.y = function(newY) {
    if(!arguments.length) {
      return y;
    }
    else {
      y = newY;
      grid.attr("transform","translate("+x+","+y+")");
      return heatmap;
    }
  };

  heatmap.size = function(newSize) {
    if(!arguments.length) {
      return size;
    }
    else {
      size = newSize;
      h = size/data.length;
      heatmap.setProperties();
      return heatmap;
    }
  };

  heatmap.scale = function(newScale) {
    if(!arguments.length) {
      return scale;
    }
    else {
      scale = newScale;
      heatmap.setProperties();
      return heatmap;
    }
  };

  heatmap.setProperties= function() {
    grid.selectAll("g").selectAll("rect")
      .attr("x", function(d){ return (size/data[d.r].length)*d.c;})
      .attr("y", function(d){ return d.r*h;})
      .attr("width",function(d){ return (size/data[d.r].length);})
      .attr("height",h)
      .attr("fill", function(d){ return scale(d.v);});
  };

  if(data) {
    heatmap.make();
  }
  return heatmap;
}
