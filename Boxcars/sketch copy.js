let data;

async function setup() {
  createCanvas(400, 2000);
  data = await loadJSON("http://api.open-notify.org/astros.json");
  getData(data);
}

function getData(data) {
  console.log(data);


}

function draw() {
  background(200);
    for (let i = 0; i < data.number; i++) {
    ellipse(100, 100 + i * 20, 20, 20);
  }

}

