

let data;

let birds;



async function setup() {
  createCanvas(400, 2000);
    data = await loadJSON("birds.json");
    birds = data.birds;

}

function draw() {
  background(200);
  let y = 20;

  for (let i = 0; i < birds.length; i++) {

  fill(255, 0, 0);
  textSize(16);
  text(birds[i].family, 10, y);
  y += 20;

  let members = birds[i].members;
  for (let j = 0; j < members.length; j++) {
    textSize(12);
    text(members[j], 10, y);
    y += 20;
    }
      y += 10;
  }

}

