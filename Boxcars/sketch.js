let cars = []; // Car array storage

function setup() {
  createCanvas(400, 400);

  for (let i = 0; i < 5; i++) { //Loop to create 5 cars
    let y = random(height);
    let c = new Car(
      color(random(255), random(255), random(255)),
      0,
      y,
      random(5)
    );

    cars.push(c);
  }
}

function mousePressed() {
  for (let i = 0; i < cars.length; i++) {
    cars[i].click(mouseX, mouseY);
  }
}

function draw() {
  background(200);

  for (let i = 0; i < cars.length; i++) { // Runs the car Drive and then Display functions 60 per second
    cars[i].drive();
    cars[i].display();
  }
}


class Car { // Car overlord template
  constructor(tempC, tempXpos, tempYpos, tempXspeed) {
    this.c = tempC;
    this.xpos = tempXpos;
    this.ypos = tempYpos;
    this.xspeed = tempXspeed;
  }

  click(px, py) {
    let halfW = 50 / 2;
    let halfH = 25 / 2;

    if (abs(px - this.xpos) < halfW && abs(py - this.ypos) < halfH) { //Gets absolute values to detect when clicking car
      console.log("clicked on car"); // Inspect source to check console output
    }
  }

  display() { // Displays the car on the canvas
    stroke(0);
    fill(this.c);
    rectMode(CENTER);
    rect(this.xpos, this.ypos, 50, 25);
  }

  drive() { // Moves the car and loops position if position greater than width of canvas
    this.xpos = this.xpos + this.xspeed;
    if (this.xpos > width) {
      this.xpos = 0;
    }
  }
}
