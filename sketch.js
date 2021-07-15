/*
 * Author: Joel Flanagan
 */
let storedPos, mouseVec; //stores the mouse positions for dragging
let doArrow = false;
let system; //particle system
let averageFrameRate = [];
let averageFrames = 0;
let gridDimension = 300;//the dimensions of the grid containers that particles use to search for neighbours
let img = [];
function preload() {
  for(let i = 1; i <= 5; i++){
    tempImg = loadImage('luke_0'+i+'.png');
    img.push(tempImg);
  }
}
function setup() {
  let cnvWidth = windowWidth + gridDimension - (windowWidth % gridDimension);
  let cnvHeight = windowHeight + gridDimension - (windowHeight % gridDimension);
  createCanvas(cnvWidth, cnvHeight);
  // console.log("window size", windowWidth+"x"+ windowHeight,"canvas size", cnvWidth+"x"+ cnvHeight);
  angleMode(RADIANS);
  system = new ParticleSystem(gridDimension);
  let fit = floor(cnvHeight / gridDimension) * floor(cnvWidth / gridDimension);
  console.log(fit, floor(cnvHeight / gridDimension), floor(cnvWidth / gridDimension));
  for (let i = 0; i < fit; i++) {
    system.addParticle();
  }
  // frameRate(1);
}

function draw() {
  background(0);
  system.update();
  system.display();
  if (doArrow) {//draw the arrow when adding another particle
    mouseVec = createVector(mouseX, mouseY);
    mouseVec.sub(storedPos);
    strokeWeight(2);
    drawArrow(storedPos, mouseVec, "green", true);
  }
  // //framerate averaging
  // let fps = frameRate();
  // averageFrameRate.push(fps);
  // if (averageFrameRate.length == 1) {//first value should be frameRate
  //   averageFrames = fps;
  // } else {//add value to average
  //   averageFrames += fps;
  //   averageFrames /= 2;
  // }
  // if (averageFrameRate.length > 30) {//remove value from average
  //   averageFrames *= averageFrameRate.length;
  //   averageFrames -= averageFrameRate.shift();
  //   averageFrames /= averageFrameRate.length;
  // }
  // if(averageFrames>50){
  //   system.addParticle();
  // } else {
  //   system.delete++;
  // }
  // textSize(32);
  // fill(0);
  // text(averageFrames.toFixed(2), 120, 130);//print average frameRate
  // text(system.particleCount, 120, 160);//print particle count
}

function mousePressed(event) {
  storedPos = createVector(mouseX, mouseY);
  doArrow = true;
}

function touchStarted(event) {
  storedPos = createVector(mouseX, mouseY);
  doArrow = true;
}

function mouseReleased(event) {
  if (mouseVec) {
    system.addParticle(storedPos, mouseVec.copy().div(10));
  }
  doArrow = false;
}

function touchEnded(event) {
  if (mouseVec) {
    system.addParticle(storedPos, mouseVec.copy().div(10));
  }
  doArrow = false;
}

// draw an arrow for a vector at a given base position
function drawArrow(base, vec, myColor, arrow) {
  //source: https://p5js.org/reference/#/p5.Vector/angleBetween
  push();
  stroke(myColor);
  // strokeWeight(3);
  fill(myColor);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 7;
  translate(vec.mag() - arrowSize, 0);
  if (arrow) {
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  }
  pop();
}

function windowResized() {//resizing the canvas
  let cnvWidth = windowWidth + gridDimension - (windowWidth % gridDimension);
  let cnvHeight = windowHeight + gridDimension - (windowHeight % gridDimension);
  resizeCanvas(cnvWidth, cnvHeight);
  system.resize();
}