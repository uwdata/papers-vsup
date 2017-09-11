import * as d3 from "d3";

// Returns a color, based on a bivariate data point,
// a quantization function, and a color interpolator
// can be extended to different modes (just saturation, say)
export function simpleScale(m_mode, m_range, m_scale) {
  var range = m_range,
      scale = m_scale ? m_scale : function(v, u) {
        var data = u != undefined ? {v:v, u:u} : {v:v.v, u:v.u};
        return data;
      },
      mode = m_mode;

  function CIEdist(color1, color2) {
      var c1 = d3.lab(d3.color(color1)),
          c2 = d3.lab(d3.color(color2));
      return Math.sqrt(Math.pow( (c1.l - c2.l), 2) + Math.pow(c1.a - c2.a, 2) + Math.pow(c1.b - c2.b, 2));
  }

  function map(value, uncertainty) {
    var data = scale(value, uncertainty);
    var vcolor = range(data.v);
    var uScale = d3.scaleLinear().domain([0, 1]).range([0.0, 1.0]);
    switch (mode) {
      case "usl":
      default:
        vcolor = d3.interpolateLab(vcolor, "#ddd")(uScale(data.u));
      break;
    }
    return vcolor;
  }

  map.colorList = function() {
    return scale.range().map(map);
  }

  map.colorDists = function() {
      var clist = this.colorList(),
          matrix = new Array(clist.length),
          minDist,
          minPair = new Array(2),
          dist;

      for (var i = 0;i < matrix.length;i++) {
        matrix[i] = new Array(clist.length);
        for (var j = 0;j < matrix[i].length;j++) {
          dist = CIEDist(clist[i], clist[j]);
          matrix[i][j] = dist;
          if (i != j && ((i == 0 && j == 1) || (dist < minDist))) {
            minDist = dist;
            minPair = [clist[i], clist[j]];
          }
        }
      }

      matrix.minDist = minDist;
      matrix.minPair = minPair;
      return matrix;
  };

  map.mode = function(newMode) {
    if (!arguments.length) {
      return mode;
    }
    else {
      mode = newMode;
      return map;
    }
  }

  map.range = function(newRange) {
    if (!arguments.length) {
      return range;
    }
    else {
      range = newRange;
      return map;
    }
  }

  map.quantize = function(newScale) {
    if (!arguments.length) {
      return scale;
    }
    else {
      scale = newScale;
      return map;
    }
  }

  return map;
}
