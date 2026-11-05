# Video Game Comparison

Compare global and regional sales, critic scores, and user scores for two games
from the complete video game sales dataset. Each panel has an independent
autocomplete search across game titles, platforms, release years, genres,
publishers, and developers. Every matching game is available; results are not
truncated.

Use **Game mode** to play higher-or-lower trivia. Each round picks two different
games and a dataset metric; guess whether the second game's value is higher or
lower. Correct guesses add to your current score; a wrong guess ends the run.
Your high score tracks your best completed run and is saved in this browser.
Choose **Play again** to start a new run without resetting your high score.

## Getting Started

Serve this folder locally, then open the local address in your browser. The
dashboard loads its CSV data with `fetch`, so opening `index.html` directly as a
`file://` URL may be blocked by browser security settings.

## Running Locally

From this folder, start a local server with one of these commands:

```bash
# Using Python
python -m http.server 8000

# Using VS Code Live Server extension
# Right-click index.html -> "Open with Live Server"
```

Then visit `http://localhost:8000`.

The CSV file must remain at
`Introcsv common set values/Video_Games_Sales_as_at_22_Dec_2016.csv`.
