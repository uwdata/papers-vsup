(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.simpleLegend = factory();
    }
}(this, function () {
  function simpleLegend() {
    var title = "";
    var scale = null;
    var size = 200;
    var height = 30;
    var format = ".2f";

    function legend(el) {
      var range = scale.range();
      var domain = scale.domain();

      var w = size / range.length;

      el.selectAll("rect").data(range).enter()
        .append("rect")
        .attr("x", function(d,i) { return i * w; })
        .attr("y", 0)
        .attr("height", height)
        .attr("width", w)
        .attr("fill", function(d) { return d; });

      var step = (domain[1] - domain[0]) / range.length;
      var dom = d3.range(domain[0], domain[1] + step, step);

      var axisScale = d3.scalePoint().range([0, size]).domain(dom).round(true);

      el.append("g")
        .attr("transform", "translate(0, " + height + ")")
        .call(d3.axisBottom(axisScale).tickFormat(d3.format(format)));

      el.append("text")
        .style("text-anchor", "middle")
        .style("font-size", 13)
        .attr("transform", "translate(" + (size / 2) + ", " + (height + 30) + ")")
        .text(title);

      return legend;
    }

    legend.title = function(t) {
      title = t;
      return legend;
    }

    legend.scale = function(s) {
      scale = s;
      return legend;
    }

    legend.size = function(s) {
      size = s;
      return legend;
    }

    legend.height = function(h) {
      height = h;
      return legend;
    }

    legend.format = function(f) {
      format = f;
      return legend;
    }

    return legend;
  }

  return simpleLegend;
}));
