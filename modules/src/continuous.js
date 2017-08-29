import * as d3 from "d3";

export function continuousSquare(m_el,m_size,m_scale){
  var el = m_el,
  size = m_size,
  scale = m_scale,
  pixelScale,
  context,
  canvas,
  made = false;

  var square = {};


  square.makePixelData = function() {
      var pixelData = [];
      var c;
      for(var i = 0;i<size;i++) {
        for(var j = 0;j<size;j++) {
          c = scale(j/size);
          c = d3.interpolateLab(c,d3.color("#ddd"))(i/size);
          //r,g,b,a
          c = d3.color(c);
          pixelData.push(c.r);
          pixelData.push(c.g);
          pixelData.push(c.b);
          pixelData.push(255);
        }
      }
      return pixelData;
  }

  square.make = function() {
    if(!scale) {
      return;
    }

    if(!el) {
      el = d3.select("body");
    }

    if(!canvas) {
      canvas = el.append("canvas")
    }

    canvas
      .attr("width",size)
      .attr("height",size);

    var cnode = canvas.node();
    context = cnode.getContext("2d");

    square.setPixels();
    made = true;
  }

  square.setPixels = function() {
    var img = context.createImageData(size,size);
    img.data.set(square.makePixelData());
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

export function continuousArc(m_el,m_size,m_scale) {
  var arc = continuousSquare(m_el,m_size,m_scale);

  arc.makePixelData = function() {
    var pixelData = [];
    var c, x,y,theta, r;
    var angle = d3.scaleLinear().domain([-Math.PI/6,Math.PI/6]).range([1,0]);
    var size = arc.size();

    for(var i = 0;i<size;i++) {
      for(var j = 0;j<size;j++) {
        x = (j/size)-0.5;
        y = 1-(i/size);
        r = Math.sqrt( Math.pow(x,2) + Math.pow(y,2));
        theta = Math.atan2(y,x) - (Math.PI/2) ;

        if(theta >-Math.PI/6 && theta < Math.PI/6 && r>0 && r<1){
          c = arc.scale()(angle(theta));
          c = d3.interpolateLab(c,d3.color("#ddd"))(1-r);
          c = d3.color(c);
        }
        else {
          c = d3.color("white");
          c.opacity = 0;
        }

        pixelData.push(c.r);
        pixelData.push(c.g);
        pixelData.push(c.b);
        pixelData.push(255*c.opacity);
      }
    }
    return pixelData;
  }

  arc.make();
  return arc;
}
