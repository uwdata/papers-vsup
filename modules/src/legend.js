/*
  A lightweight factory for making legends.
*/
import * as d3 from "d3";

export function simpleLegend(m_scale,m_size,m_svg,m_height,m_format,m_title,m_x,m_y) {
  var el = m_svg,
      title = m_title,
      scale = m_scale ? m_scale : null,
      size = m_size ? m_size : 200,
      height = m_height ? m_height : 30,
      fmat = m_format ? m_format : ".2f",
      x = m_x ? m_x : 0,
      y = m_y ? m_y : 0,
      mainG,
      rects,
      axis,
      label,
      made = false;

  var legend = {};

  legend.make = function() {
    if (!scale) {
      return;
    }

    if(!el) {
      el = d3.select("body").append("svg");
    }

    mainG = el.append("g");

    rects = mainG.selectAll("rect").data(scale.range()).enter().append("rect");
    axis = mainG.append("g");
    label = mainG.append("text");
    legend.setProperties();

    made = true;
  };

  legend.setProperties = function() {
    var domain = scale.domain(),
        w = size / scale.range().length,
        step = (domain[1] - domain[0]) / scale.range().length,
        dom = d3.range(domain[0], domain[1] + step, step),
        axisScale = d3.scalePoint().range([0, size]).domain(dom).round(true);

    mainG
      .attr("transform","translate("+x+","+y+")");

    rects
      .attr("x", function(d,i) { return i * w; })
      .attr("y", 0)
      .attr("height", height)
      .attr("width", w)
      .attr("fill", function(d) { return d; });

    axis
      .attr("transform", "translate(0, " + height + ")")
      .call(d3.axisBottom(axisScale).tickFormat(d3.format(fmat)));

    label
      .style("text-anchor", "middle")
      .style("font-size", 13)
      .attr("transform", "translate(" + (size / 2) + ", " + (height + 30) + ")")
      .text(title);
  };

  legend.unmake = function() {
    if (!made) {
      return false;
    }

    rects.remove("*");
    axis.remove("*");
    label.remove("*");
  };

  legend.title = function(t) {
    if(!arguments.length) {
      return title;
    }
    else {
      title = t;
      if(label) {
        label.text(title);
      }
      return legend;
    }
  };

  legend.scale = function(s) {
    if(!arguments.length) {
      return scale;
    }
    else {
      scale = s;
      legend.unmake();
      legend.make();
      return legend;
    }
  };

  legend.size = function(s) {
    if(!arguments.length) {
      return size;
    }
    else {
      size = s;
      legend.unmake();
      legend.make();
      return legend;
    }
  };

  legend.height = function(h) {
    if(!arguments.length) {
      return height;
    }
    else {
      height = h;
      legend.unmake();
      legend.make();
      return legend;
    }
  };

  legend.format = function(f) {
    if(!arguments.length) {
      return fmat;
    }
    else {
      fmat = f;
      legend.unmake();
      legend.make();
      return legend;
    }
  };

  legend.x = function(nx) {
    if(!arguments.length) {
      return x;
    }
    else {
      x = nx;
      mainG.attr("transform","translate("+x+","+y+")");
      return legend;
    }
  };

  legend.y = function(ny) {
    if(!arguments.length) {
      return y;
    }
    else {
      y = ny;
      mainG.attr("transform","translate("+x+","+y+")");
      return legend;
    }
  };

  legend.svg = function(newSvg) {
    if(!arguments.length) {
      return el;
    }
    else {
      el = newSvg;
      legend.unmake();
      legend.make();
      return legend;
    }
  }

  if(scale) {
    legend.make();
  }
  return legend;
};

export function heatmapLegend(m_heatmap) {
  var heatmap = m_heatmap;

  var legend = {};

  legend.make = function() {
    if (!heatmap) {
      return;
    }
    // TODO: finish

    var svgGroup = heatmap.svg().append("g")
    var size = heatmap.size;

    svgGroup.attr("transform", "translate(-20, -20)");

    var xAxis = d3.scalePoint().range([0, size]).domain([0,1]);

    svgGroup.append("g")
      .call(d3.axisTop(xAxis).tickFormat(d3.format("d")));

    svgGroup.append("text")
      .style("text-anchor", "middle")
      .style("font-size", 13)
      .attr("transform", "translate(" + (size / 2) + ", " + (-30) + ")")
      .text("Value");

    var yAxis = d3.scalePoint().range([0, size]).domain([0,1]);

    svgGroup.append("g")
      .attr("transform", "translate(" + size + ", 0)")
      .call(d3.axisRight(yAxis).tickFormat(d3.format("d")));

    svgGroup.append("text")
      .style("text-anchor", "middle")
      .style("font-size", 13)
      .attr("transform", "translate(" + (size + 40) + ", " + (size / 2) + ")rotate(90)")
      .text("Uncertainty");
  };

  legend.unmake = function() {
    // TODO
  };

  legend.heatmap = function(nheatmap) {
    if(!arguments.length) {
      return heatmap;
    }
    else {
      heatmap = nheatmap;
      legend.uname();
      legend.make();
      return legend;
    }
  };

  legend.make();
  return legend;
};
