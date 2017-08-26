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

  var h;
  var heatmap = {};

  heatmap.make = function() {
    if(data){
      if(!svg) {
        svg = d3.select("body").append("svg");
      }

      if(!this.svgGroup) {
        this.svgGroup = svg.append("g")
          .attr("transform","translate("+x+","+y+")");
      }

      this.svgGroup.selectAll("g")
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
        this.svgGroup.attr("id",name);
      }
    }
  };

  heatmap.unmake = function() {
    if(this.svgGroup) {
      this.svgGroup.selectAll("g").remove("*");
    }
  }

  heatmap.data = function(newData) {
    if(!arguments.length) {
      return data;
    }
    else {
      data = newData;
      h = size/data.length;
      heatmap.unmake();
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
      heatmap.unmake();
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
      if(this.svgGroup){
        this.svgGroup.attr("transform","translate("+x+","+y+")");
      }
      return heatmap;
    }
  };

  heatmap.y = function(newY) {
    if(!arguments.length) {
      return y;
    }
    else {
      y = newY;
      if(this.svgGroup) {
        this.svgGroup.attr("transform","translate("+x+","+y+")");
      }
      return heatmap;
    }
  };

  heatmap.size = function(newSize) {
    if(!arguments.length) {
      return size;
    }
    else {
      size = newSize;
      if(data) {
        h = size/data.length;
        heatmap.setProperties();
      }
      return heatmap;
    }
  };

  heatmap.scale = function(newScale) {
    if(!arguments.length) {
      return scale;
    }
    else {
      scale = newScale;
      if(data) {
        heatmap.setProperties();
      }
      return heatmap;
    }
  };

  heatmap.name = function(newName) {
    if(!arguments.length) {
      return name;
    }
    else {
      name = newName;
      if(this.svgGroup) {
        this.svgGroup.attr("id",name);
      }
      return heatmap;
    }
  };

  heatmap.setProperties= function() {
    this.svgGroup.selectAll("g").selectAll("rect")
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

export function simpleArcmap(data,m_scale,m_size,m_svg,m_name,m_x,m_y) {
  var hmap = simpleHeatmap(data,m_scale,m_size,m_svg,m_name,m_x,m_y);

  function makeArc(d,size,rows,cols) {
    var angle = d3.scaleLinear().domain([0,cols]).range([-Math.PI/6,Math.PI/6]);
    var radius = d3.scaleLinear().domain([0,rows]).range([size,0]);

    var arcPath = d3.arc()
      .innerRadius(radius(d.r+1))
      .outerRadius(radius(d.r))
      .startAngle(angle(d.c))
      .endAngle(angle(d.c+1));

    return arcPath();
  }

  hmap.make = function() {
    if(hmap.data()) {
      if(!hmap.svg()){
        hmap.svg(d3.select("body").append("svg"));
      }

      if(!hmap.svgGroup) {
        hmap.svgGroup = svg.append("g")
          .attr("transform","translate("+hmap.x()+","+hmap.y()+")");
      }

      hmap.svgGroup.selectAll("g")
        .data(hmap.data())
        .enter()
        .append("g")
        .selectAll("path")
          .data(function(d,i){ return d.map(function(val){ return {r:i, v:val};});})
          .enter()
          .append("path")
          .datum(function(d,i){ d.c = i; return d; });

      hmap.setProperties();

      if(hmap.name()) {
        hmap.svgGroup.attr("id",hmap.name());
      }
    }
  }

  hmap.setProperties = function() {
    hmap.svgGroup.attr("transform","translate("+hmap.x()+","+hmap.y()+")");
    hmap.svgGroup.selectAll("g").selectAll("path")
    .attr("transform","translate("+(hmap.size()/2.0)+","+hmap.size()+")")
    .attr("d", function(d){ return makeArc(d,hmap.size(),hmap.data().length,hmap.data()[d.r].length);})
    .attr("fill", function(d){ return hmap.scale()(d.v);});
  }

  if(hmap.data()) {
    hmap.make();
  }
  return hmap;
}
