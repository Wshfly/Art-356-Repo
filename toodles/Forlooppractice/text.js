// Sketch 1: Draws a moving red circle
const sketch1 = (p) => {
  // Runs once when the sketch starts
  p.setup = () => {
    // Attach canvas to the div with id "canvas1"
    p.createCanvas(300, 300).parent("canvas1");
  };
 
  // Runs continuously (60x/second by default)
  p.draw = () => {
    p.background(240); // Light gray background
    p.fill(255, 0, 0); // Red fill
    // Circle moves with mouse position in Canvas 1
    p.ellipse(p.mouseX, p.mouseY, 50);
  };
};
 
// Sketch 2: Draws a bouncing blue square
const sketch2 = (p) => {
  let x = 0; // Square position
  let speed = 2;
 
  p.setup = () => {
    // Attach canvas to the div with id "canvas2"
    p.createCanvas(300, 300).parent("canvas2");
  };
 
  p.draw = () => {
    p.background(240); // Light gray background
    p.fill(0, 0, 255); // Blue fill
    p.rect(x, 125, 50, 50); // Square
 
    // Bounce logic
    x += speed;
    if (x > p.width - 50 || x < 0) speed *= -1;
  };
};
 
// Initialize both sketches
new p5(sketch1); // Creates Canvas 1
new p5(sketch2); // Creates Canvas 2