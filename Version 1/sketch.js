const sketch1 = (p) => {

let cols, rows; // Establish the collumn and row variables
let grid = 20; // Set the scale for the grid
let map = []; // Create an empty array to hold the map data
let height = 800; // Set the height of the canvas
let width = 800; // Set the width of the canvas
let timeout = 1000; // Initialize a timeout variable for controlling the loop timing
let lastTime = 0; // Initialize a variable to track the last time the loop was executed


p.setup = () => { // Runs this Sketches setup function once when the sketch starts
  p.createCanvas(width, height); 
  cols = p.floor(width / grid); // Calculate the number of columns based on the canvas width and scale
  rows = p.floor(height / grid); // Calculate the number of rows based on the canvas height and scale

  p.noLoop(); // Disable continuous drawing to only draw once, comment out to cause seasures
}
p.draw = () => { // Runs this Sketches draw function continuously, note 60 per second
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
        p.fill(0); // Fill color for cells with value 1
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
    } else { // If the timeout has not passed, log a message to the console
      p.loop(1); // Call the loop function to redraw the canvas
    }
    
}
};

// Initialize both sketches
new p5(sketch1); // Creates Canvas 1