async function setup() {
  createCanvas(600, 600);
  data = await loadJSON("https://api.open-meteo.com/v1/forecast?latitude=37.6688&longitude=-122.0808&current=temperature_2m");
  getData(data);
}
function getData(data) {
    console.log(data);
    weather = data;
}

function draw() {
    background(220);


    if (weather) {
        textSize(32);
        fill(0);
        textAlign(CENTER, CENTER);
        text("Weather Forecast: " + weather.current.time, 300, 100);
        text("Current Temperature: " + weather.current.temperature_2m + "°C", 300, 150);
        ellipse(300, 400, weather.current.temperature_2m * 10, weather.current.temperature_2m * 10);

    }


}


