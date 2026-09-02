let awnserResults = ["no", "yes", "maybe", "sometimes", "Ask Again Later", "Punch that mofo till he black n blue"]
let awnser = "8";

function setup() {
    createCanvas(500, 700);

}

function draw() {
    background(150);

    fill(0);
    ellipse(width/2, 300, 300);

    // Awnser text
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text(awnser, width/2, 300);

        //noLoop();

    // button
    rectMode(CENTER);
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && mouseY > 600 - 50 && mouseY < 600 + 50) {
        fill(200);
    } 
    else {
        fill(150);
    }
    rect(width/2, 600, 200, 100); // Draw a button at the bottom of the canvas
    fill(0); // Set the fill color for the button text
    text("ask me", width/2, 600); // Display text on the button
}


function mousePressed() {
    //fill(150);
   // rect(0, 0, width, height); // Cover the canvas with the background color before drawing the new ellipse

   // fill(0);
   // ellipse(width/2, 300, 300);

  //  fill(255);
  //  textAlign(CENTER, CENTER);
   // textSize(32);
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && mouseY > 600 - 50 && mouseY < 600 + 50) {
        awnser = awnserResults[int(random(awnserResults.length))];
        text(awnser, width/2, 300); // Display the new answer
    } 
    else {
        fill(150);
    }

}

