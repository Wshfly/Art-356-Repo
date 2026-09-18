const sketch0 = (p) => {
  // Runs once when the sketch starts
  p.setup = () => {
    // Attach canvas to the div with id "canvas0"
    p.createCanvas(300, 300).parent("canvas0");
  };
 
  // Runs continuously (60x/second by default)
  p.draw = () => {
    p.background(240); // Light gray background
    p.fill(255, 0, 0); // Red fill
    // Circle moves with mouse position in Canvas 1
    p.ellipse(p.mouseX, p.mouseY, 50);
  };
};



const sketch1 = (p) => {

let cols, rows; // Establish the collumn and row variables
let grid = 20; // Set the scale for the grid
let map = []; // Create an empty array to hold the map data
let height = 800; // Set the height of the canvas
let width = 800; // Set the width of the canvas
let timeout = 1000; // Initialize a timeout variable for controlling the loop timing
let lastTime = 0; // Initialize a variable to track the last time the loop was executed


p.setup = () => { // Runs this Sketches setup function once when the sketch starts
  p.createCanvas(width, height).parent("canvas1"); // Create a canvas and attach it to the div with id "canvas1"
  cols = p.floor(width / grid); // Calculate the number of columns based on the canvas width and scale
  rows = p.floor(height / grid); // Calculate the number of rows based on the canvas height and scale
  p.frameRate(10); // Set frame rate to 10 per second

  p.noLoop(); // Disable continuous drawing to only draw once, comment out to cause seasures
}
p.draw = () => { // Runs this Sketches draw function continuously, note 60 per second
  p.timecheck(); // Call the timecheck function every 10 seconds
  p.background(220); // Set the background color
  p.rect(width, height, 0, 0); // Draw a rectangle that covers the entire canvas

    // Initialize the map array with random values (0 or 1)
  for (let i = 0; i < cols; i++) { // Loop through each column
    map[i] = [];// Create a new array for each column
    for (let j = 0; j < rows; j++) {// Loop through each row
      map[i][j] = p.floor(p.random(2)); // Randomly assign either 0 or 1 to each cell
    }
  }
  // Loop through the map array and draw rectangles based on the values
  for (let i = 0; i < cols; i++) { // Loop through each collumn
    for (let j = 0; j < rows; j++) { // Loop through each row
      let x = i * grid; // Calculate the x position based on the column index and scale
      let y = j * grid; // Calculate the y position based on the row index and scale

      if (map[i][j] === 1) { // Check if the cell value is 1
        p.fill(p.random (1, 255)); // Fill color for cells with value 1
      } else { // Otherwise, Genertate Random RGB values
        let r = p.random(1, 255);
        let g = p.random(1, 255);
        let b = p.random(1, 255); 
        p.fill(r, g, b); // Fill color for cells with value 0
      }
      p.rect(x, y, grid, grid); // Draw the rectangle at the calculated position with the specified scale
    }
  }
}
  p.mouseClicked = () => { // Runs this function when the mouse is clicked inside this function? need to
    if (p.millis() - lastTime > timeout) { // Check if the timeout has passed since the last loop execution
          p.noLoop();
          lastTime = p.millis();  // Update the last execution time to the current time
    } else { 
      p.loop(1); // Call the loop function to redraw the canvas
    }
    
}


  p.timecheck = () => { // Function to check the time since the last loop execution
    if (p.millis() - lastTime > timeout) { // Check if the timeout has passed since the last loop execution
      p.noLoop(); // Stop the loop if the timeout has passed
      lastTime = p.millis(); // Update the last execution time to the current time
    }
  }
};

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
new p5(sketch0); // Creates Canvas 0
new p5(sketch1); // Creates Canvas 1
new p5(sketch2); // Creates Canvas 2