function preload(){

}

function setup(){
  pixelDensity(displayDensity());
  createCanvas(500,500);
  background(255);
  drawHeatmap([0,0.25,0.5,0.75]);
  noLoop();
}

function drawHeatmap(samples){
  var delta, index, perRow, curY;
  perRow = ceil(sqrt(samples.length));
  delta = min(width,height)/perRow;

  curY = 0;
  for(var i = 0;i<perRow;i++){
    curX = 0;
    for(var j=0;j<perRow;j++){
      drawCell(samples[i*perRow + j],0,curX,curY,delta,0);
      curX+=delta;
    }
    curY+=delta;
  }
}

function drawCell(value,uncertainty,x,y,w,mode){
  var fillC = color(255*value);
  noStroke();
  fill(fillC);
  rect(x,y,w,w);
}
