import * as d3 from "d3";

export function continuousSquare(m_el,m_size,m_scale){
  var el = m_el,
  size = m_size,
  scale = m_scale,
  pixelScale,
  pixelData,
  context,
  canvas,
  made = false;

  var square = {};


  square.makePixelData = function() {
      pixelData = [];
      var c;
      for(var i = 0;i<size;i++) {
        for(var j = 0;j<size;j++) {
          c = scale(j/size);
          c = d3.interpolateLab(c,d3.color("white"))(i/size);
          //r,g,b,a
          c = d3.color(c);
          pixelData.push(c.r);
          pixelData.push(c.g);
          pixelData.push(c.b);
          pixelData.push(255);
        }
      }
  }

  square.make = function() {
    if(!scale) {
      return;
    }

    if(!el) {
      el = d3.select("body");
    }

    canvas = el.append("canvas")
      .attr("width",size)
      .attr("height",size);

    var cnode = canvas.node();
    context = cnode.getContext("2d");

    square.setPixels();
    made = true;
  }

  square.setPixels = function() {
    square.makePixelData();
    var img = context.createImageData(size,size);
    img.data.set(pixelData);
    context.putImageData(img,0,0);
  }

  square.size = function(newSize) {
    if(!arguments.length) {
      return size;
    }
    else {
      size = newSize;
      if(made) {
        canvas
          .attr("width",size)
          .attr("height",size);

        square.setPixels();
      }
      return square;
    }
  }

  square.scale = function(newScale) {
    if(!arguments.length) {
      return scale;
    }
    else {
      scale = newScale;
      if(made) {
        square.setPixels();
      }
      else {
        square.make();
      }
      return square;
    }
  }

  square.make();
  return square;
}
