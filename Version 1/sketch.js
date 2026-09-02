let cols, rows; // Establish the collumn and row variables
let grid = 20; // Set the scale for the grid
let map = []; // Create an empty array to hold the map data
let height = 800; // Set the height of the canvas
let width = 800; // Set the width of the canvas
let timeout = 1000; // Initialize a timeout variable for controlling the loop timing
let lastTime = 0; // Initialize a variable to track the last time the loop was executed

function setup() {
  createCanvas(width, height); 
  cols = floor(width / grid); // Calculate the number of columns based on the canvas width and scale
  rows = floor(height / grid); // Calculate the number of rows based on the canvas height and scale

  noLoop(); // Disable continuous drawing to only draw once, comment out to cause seasures
}

function draw() {
  background(220); // Set the background color
  rect(width, height, 0, 0); // Draw a rectangle that covers the entire canvas

    // Initialize the map array with random values (0 or 1)
  for (let i = 0; i < cols; i++) { // Loop through each column
    map[i] = [];// Create a new array for each column
    for (let j = 0; j < rows; j++) {// Loop through each row
      map[i][j] = floor(random(2)); // Randomly assign either 0 or 1 to each cell
    }
  }
  // Loop through the map array and draw rectangles based on the values
  for (let i = 0; i < cols; i++) { // Loop through each collumn
    for (let j = 0; j < rows; j++) { // Loop through each row
      let x = i * grid; // Calculate the x position based on the column index and scale
      let y = j * grid; // Calculate the y position based on the row index and scale

      if (map[i][j] === 1) { // Check if the cell value is 1
        fill(0); // Fill color for cells with value 1
      } else { // Otherwise, Genertate Random RGB values
        let r = random(1, 255);
        let g = random(1, 255);
        let b = random(1, 255); 
        fill(r, g, b); // Fill color for cells with value 0
      }
      rect(x, y, grid, grid); // Draw the rectangle at the calculated position with the specified scale
    }
  }
}
  async function mouseClicked() {
    if (millis() - lastTime > timeout) { // Check if the timeout has passed since the last loop execution
          noLoop();
          lastTime = millis();  // Update the last execution time to the current time
    } else { // If the timeout has not passed, log a message to the console
      loop(1); // Call the loop function to redraw the canvas
    }
    
}