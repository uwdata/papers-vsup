var img;
var samples;

function preload(){
 img = loadImage("img/lenna-bw.png");  
}

function setup(){
  pixelDensity(displayDensity());
  createCanvas(2*img.width,img.height);
  noLoop();
  background(0);
  loadPixels();
  img.loadPixels();
  samples = dl.range(0,(img.pixels.length)/4);
  samples = permute(samples); 
}

function draw(){
}

function mousePressed(){
  nsample(100);
  updatePixels();
}

// Generate a sample
function sample(){
  if(samples.length>0){
    setSample(samples.pop());
  }
  else{
    return null;
  }
}

// Generate n pixel samples
function nsample(n){
  for(var i = 0;i<n;i++){
    sample();
  }
}

// Set a pixel in the canvas to the sampled pixel value.
// Requires a call to updatePixels() to force a redraw.
function setSample(aSample){
  if(aSample){
    var y = floor(aSample/img.width);
    var x = aSample - (y*img.width);
    var d = pixelDensity();
    var value = img.pixels[aSample*4];
    var idx;
    for(var i = 0;i<d;i++){
      for(var j = 0;j<d;j++){
        idx = 4 * ((y * d + j) * width * d + (x * d + i));
        pixels[idx] = value;
        pixels[idx+1] = value;
        pixels[idx+2] = value;
        pixels[idx+3] = 255;
      }
    }
  }  
}

function testPixels(){
  for(var i = 0;i<pixels.length/2;i+=4){
    pixels[i] = 255;
    pixels[i+1] = 0;
    pixels[i+2] = 0;
    pixels[i+3] = 255;
  }
  updatePixels();
}

function permute(anArray){
  var i = 0;
  var temp;
  var tempArray = anArray.slice(0);
  var m = anArray.length;

  while(m){
    i = floor(random(m--));
    temp = tempArray[m];
    tempArray[m] = tempArray[i];
    tempArray[i] = temp;
  }
  return tempArray;
}
