let awnserResults = ["no", "yes", "maybe", "sometimes", "Ask Again Later", "Punch that mofo till he black n blue"]

function setup() {
    createCanvas(500, 700);

}

function draw() {
    background(150);

    fill(0);
    ellipse(width/2, 300, 300);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("8", width/2, 300);
}
