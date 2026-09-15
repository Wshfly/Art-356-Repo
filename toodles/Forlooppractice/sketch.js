function setup() {
  createCanvas(300, 300);
}

function draw() {
  background(100);

for (let circleX = 75; circleX <= 255; circleX += 70) {
    for (let circleY = 75; circleY <= 255; circleY += 70) {
        circle(circleX, circleY, 50);
    }
}
}