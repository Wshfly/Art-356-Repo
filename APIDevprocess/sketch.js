const dataPath =
  "Introcsv common set values/Video_Games_Sales_as_at_22_Dec_2016.csv";
const highScoreStorageKey = "videoGameComparison.highScore";
const panels = ["left", "right"].map(createPanel);
const quizMetrics = [
  { label: "Global sales", field: "globalSales", unit: "M units", format: formatSales },
  { label: "North America sales", field: "NA_Sales", unit: "M units", format: formatSales },
  { label: "Europe sales", field: "EU_Sales", unit: "M units", format: formatSales },
  { label: "Japan sales", field: "JP_Sales", unit: "M units", format: formatSales },
  { label: "Other-region sales", field: "Other_Sales", unit: "M units", format: formatSales },
  { label: "Critic score", field: "criticScore", unit: "points out of 100", format: formatScore },
  { label: "User score", field: "userScore", unit: "points out of 10", format: formatScore },
  { label: "Critic review count", field: "criticCount", unit: "reviews", format: formatCount },
  { label: "User rating count", field: "userCount", unit: "ratings", format: formatCount }
];
let games = [];
let gamesById = new Map();
let dataError = null;
let gameMode = false;
let quizRound = null;
let quizScore = 0;
let quizHighScore = 0;

function createPanel(side) {
  const root = document.querySelector(`[data-panel="${side}"]`);

  return {
    root,
    input: root.querySelector(".game-search"),
    suggestions: root.querySelector(".suggestions"),
    status: root.querySelector(".search-status"),
    card: root.querySelector(".game-card"),
    matches: [],
    activeIndex: -1,
    selectedGame: null
  };
}

async function loadGames() {
  try {
    const response = await fetch(encodeURI(dataPath));
    if (!response.ok) {
      throw new Error(`Dataset request failed (${response.status}).`);
    }

    const rows = parseCsv(await response.text());
    if (rows.length < 2) {
      throw new Error("The dataset contains no game records.");
    }

    const headers = rows[0].map(header => header.replace(/^\uFEFF/, "").trim());
    const columnIndexes = new Map(headers.map((header, index) => [header, index]));
    const requiredColumns = [
      "Name",
      "Platform",
      "Year_of_Release",
      "Genre",
      "Publisher",
      "Developer",
      "Rating",
      "Global_Sales",
      "NA_Sales",
      "EU_Sales",
      "JP_Sales",
      "Other_Sales",
      "Critic_Score",
      "Critic_Count",
      "User_Score",
      "User_Count"
    ];
    const missingColumns = requiredColumns.filter(
      column => !columnIndexes.has(column)
    );
    if (missingColumns.length > 0) {
      throw new Error(`Dataset is missing columns: ${missingColumns.join(", ")}.`);
    }

    games = rows
      .slice(1)
      .filter(row => row.some(value => value.trim() !== ""))
      .map((row, id) => gameFromRow(row, columnIndexes, id));
    gamesById = new Map(games.map(game => [String(game.id), game]));

    panels.forEach(updateSearch);
    if (gameMode) startQuizRound();
  } catch (error) {
    dataError = error;
    console.error("Could not load the game data:", error);
    panels.forEach(panel => {
      panel.status.textContent = "The game dataset could not be loaded.";
      renderMessage(panel.card, error.message);
    });
    document.getElementById("quiz-feedback").textContent =
      "The game dataset could not be loaded.";
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (insideQuotes) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        insideQuotes = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      insideQuotes = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (character === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
    } else {
      field += character;
    }
  }

  if (insideQuotes) {
    throw new Error("The dataset contains an unterminated quoted field.");
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function gameFromRow(row, columnIndexes, id) {
  const value = column => row[columnIndexes.get(column)] || "";
  const number = column => parseNumber(value(column));

  const game = {
    id,
    name: value("Name"),
    platform: value("Platform"),
    year: value("Year_of_Release"),
    genre: value("Genre"),
    publisher: value("Publisher"),
    developer: value("Developer"),
    rating: value("Rating"),
    globalSales: number("Global_Sales"),
    regionalSales: [
      { label: "North America", value: number("NA_Sales") },
      { label: "Europe", value: number("EU_Sales") },
      { label: "Japan", value: number("JP_Sales") },
      { label: "Other", value: number("Other_Sales") }
    ],
    criticScore: number("Critic_Score"),
    criticCount: number("Critic_Count"),
    userScore: number("User_Score"),
    userCount: number("User_Count"),
    NA_Sales: number("NA_Sales"),
    EU_Sales: number("EU_Sales"),
    JP_Sales: number("JP_Sales"),
    Other_Sales: number("Other_Sales")
  };
  game.searchableText = [
    game.name,
    game.platform,
    game.year,
    game.genre,
    game.publisher,
    game.developer,
    game.rating
  ]
    .map(normalize)
    .join("\n");

  return game;
}

function parseNumber(value) {
  const normalized = String(value).trim();
  if (!normalized) return null;

  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function normalize(value) {
  return String(value == null ? "" : value)
    .trim()
    .toLocaleLowerCase();
}

function gameLabel(game) {
  return [
    game.name || "Unknown title",
    game.platform || "Unknown platform",
    game.year || "Year unknown",
    game.genre || "Genre unknown"
  ].join(" · ");
}

function searchGames(query) {
  const searchText = normalize(query);
  if (!searchText) return [];

  return games.filter(game => game.searchableText.includes(searchText));
}

function setupSearch(panel) {
  panel.input.addEventListener("input", () => updateSearch(panel));

  panel.input.addEventListener("focus", () => {
    if (panel.matches.length === 0 && panel.input.value.trim() && games.length) {
      panel.matches = searchGames(panel.input.value);
    }
    if (panel.matches.length > 0) {
      renderSuggestions(panel);
    }
  });

  panel.input.addEventListener("keydown", event => {
    if (event.key === "ArrowDown" && panel.matches.length > 0) {
      event.preventDefault();
      panel.activeIndex = Math.min(
        panel.activeIndex + 1,
        panel.matches.length - 1
      );
      updateActiveSuggestion(panel);
    } else if (event.key === "ArrowUp" && panel.activeIndex >= 0) {
      event.preventDefault();
      panel.activeIndex = Math.max(panel.activeIndex - 1, 0);
      updateActiveSuggestion(panel);
    } else if (event.key === "Enter" && panel.activeIndex >= 0) {
      event.preventDefault();
      selectGame(panel, panel.matches[panel.activeIndex]);
    } else if (event.key === "Escape") {
      closeSuggestions(panel);
    }
  });

  panel.suggestions.addEventListener("pointerdown", event => {
    event.preventDefault();
  });

  panel.suggestions.addEventListener("click", event => {
    const option = event.target.closest("[data-game-id]");
    if (!option) return;

    const game = gamesById.get(option.dataset.gameId);
    if (game) selectGame(panel, game);
  });
}

function setupModeControls() {
  loadHighScore();

  document.querySelectorAll(".mode-button").forEach(button => {
    button.addEventListener("click", () => {
      gameMode = button.dataset.mode === "game";
      document.getElementById("compare-mode").hidden = gameMode;
      document.getElementById("game-mode").hidden = !gameMode;
      document.querySelectorAll(".mode-button").forEach(modeButton => {
        const active = modeButton === button;
        modeButton.classList.toggle("active", active);
        modeButton.setAttribute("aria-pressed", String(active));
      });

      if (gameMode && !quizRound && games.length) {
        startQuizRound();
      }
    });
  });

  document.getElementById("guess-higher").addEventListener("click", () => {
    submitGuess("higher");
  });
  document.getElementById("guess-lower").addEventListener("click", () => {
    submitGuess("lower");
  });
  document.getElementById("next-round").addEventListener("click", () => {
    if (quizRound && !quizRound.answered) return;
    if (quizRound && !quizRound.correctGuess) {
      quizScore = 0;
      document.getElementById("game-score").textContent = "0";
    }
    startQuizRound();
  });
}

function loadHighScore() {
  try {
    const storedScore = window.localStorage.getItem(highScoreStorageKey);
    if (storedScore === null) return;

    const parsedScore = Number(storedScore);
    if (!Number.isSafeInteger(parsedScore) || parsedScore < 0) {
      throw new Error("The saved high score is not a valid non-negative integer.");
    }

    quizHighScore = parsedScore;
    document.getElementById("high-score").textContent = String(quizHighScore);
  } catch (error) {
    console.error("Could not load the saved high score:", error);
    document.getElementById("score-storage-status").textContent =
      "The saved high score could not be loaded in this browser.";
  }
}

function saveHighScore(score) {
  const isNewHighScore = score > quizHighScore;
  if (isNewHighScore) {
    quizHighScore = score;
    document.getElementById("high-score").textContent = String(quizHighScore);
  }
  try {
    window.localStorage.setItem(highScoreStorageKey, String(quizHighScore));
    document.getElementById("score-storage-status").textContent = "";
  } catch (error) {
    console.error("Could not save the high score:", error);
    document.getElementById("score-storage-status").textContent =
      "The high score is updated for this visit but could not be saved in this browser.";
  }
  return isNewHighScore;
}

function startQuizRound() {
  const possibleRounds = quizMetrics.flatMap(metric => {
    const availableGames = games.filter(game =>
      Number.isFinite(game[metric.field])
    );
    const distinctValues = new Set(
      availableGames.map(game => game[metric.field])
    );
    if (availableGames.length < 2 || distinctValues.size < 2) return [];

    return [{ metric, availableGames }];
  });

  if (possibleRounds.length === 0) {
    document.getElementById("quiz-feedback").textContent =
      "How did you even get here? There are no available rounds for the current dataset. that's like over 10,000 games";
    setGuessButtonsEnabled(false);
    return;
  }

  const roundType = randomItem(possibleRounds);
  const firstGame = randomItem(roundType.availableGames);
  const comparisonGames = roundType.availableGames.filter(
    game => game.id !== firstGame.id && // Checks if the game is the same as the first or shares a score
      game[roundType.metric.field] !== firstGame[roundType.metric.field]
  );
  if (comparisonGames.length === 0) {
    document.getElementById("quiz-feedback").textContent =
      "A comparison round could not be generated. Try another round.";
    setGuessButtonsEnabled(false);
    return;
  }

  quizRound = {
    metric: roundType.metric,
    firstGame,
    secondGame: randomItem(comparisonGames),
    answered: false
  };
  renderQuizRound();
}

function renderQuizRound() {
  if (!quizRound) return;

  const { metric, firstGame, secondGame } = quizRound;
  document.getElementById("quiz-metric").textContent =
    `${metric.label} (${metric.unit})`;
  document.getElementById("quiz-first-title").textContent =
    firstGame.name || "Unknown title";
  document.getElementById("quiz-first-meta").textContent = gameLabel(firstGame);
  document.getElementById("quiz-first-value").textContent =
    metric.format(firstGame[metric.field]);
  document.getElementById("quiz-second-title").textContent =
    secondGame.name || "Unknown title";
  document.getElementById("quiz-second-meta").textContent = gameLabel(secondGame);
  document.getElementById("quiz-second-value").textContent = "?";
  document.getElementById("quiz-second-value").classList.remove("revealed");
  document.getElementById("quiz-prompt").textContent =
    "Higher or Lower?";
  document.getElementById("quiz-feedback").textContent = "Choose higher or lower.";
  document.getElementById("quiz-feedback").className = "quiz-feedback";
  document.getElementById("next-round").hidden = true;
  document.getElementById("next-round").textContent = "Next round";
  setGuessButtonsEnabled(true);
}

function submitGuess(guess) {
  if (!quizRound || quizRound.answered) return;

  const { metric, firstGame, secondGame } = quizRound;
  const isHigher = secondGame[metric.field] > firstGame[metric.field];
  const correctGuess = (guess === "higher") === isHigher;
  quizRound.answered = true;
  quizRound.correctGuess = correctGuess;
  if (correctGuess) {
    quizScore += 1;
    document.getElementById("game-score").textContent = String(quizScore);
  } else {
    const newHighScore = saveHighScore(quizScore);
    document.getElementById("next-round").textContent = "Play again";
    document.getElementById("quiz-feedback").textContent = newHighScore
      ? `Game over! Your run score of ${quizScore} is a new high score, good job.` 
      : `Game over. Your run score was ${quizScore}.`; 
  }

  document.getElementById("quiz-second-value").textContent =
    metric.format(secondGame[metric.field]);
  document.getElementById("quiz-second-value").classList.add("revealed");
  document.getElementById("quiz-prompt").textContent =
    `The second game's stat was ${isHigher ? "higher" : "lower"}.`;
  if (correctGuess) {
    document.getElementById("quiz-feedback").textContent =
      "+1 Point";
    document.getElementById("quiz-feedback").className = "quiz-feedback correct";
  } else {
    document.getElementById("quiz-feedback").className =
      "quiz-feedback incorrect";
  }
  setGuessButtonsEnabled(false);
  document.getElementById("next-round").hidden = false;
}

function setGuessButtonsEnabled(enabled) {
  document.getElementById("guess-higher").disabled = !enabled;
  document.getElementById("guess-lower").disabled = !enabled;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function updateSearch(panel) {
  panel.selectedGame = null;
  panel.activeIndex = -1;
  panel.matches = searchGames(panel.input.value);
  renderSuggestions(panel);
  renderComparison();

  const query = panel.input.value.trim();
  if (!games.length) {
    panel.status.textContent = dataError
      ? "The game dataset could not be loaded."
      : "Loading the full dataset...";
  } else if (!query) {
    panel.status.textContent = `Search all ${games.length.toLocaleString()} games.`;
  } else if (panel.matches.length === 0) {
    panel.status.textContent = "No matching games in the full dataset.";
  } else {
    panel.status.textContent =
      `${panel.matches.length.toLocaleString()} matching games. ` +
      "All matches are shown.";
  }
}

function renderSuggestions(panel) {
  panel.suggestions.replaceChildren();
  panel.input.removeAttribute("aria-activedescendant");

  if (panel.matches.length === 0) {
    closeSuggestions(panel);
    return;
  }

  const fragment = document.createDocumentFragment();
  panel.matches.forEach((game, index) => {
    const option = document.createElement("li");
    option.id = `${panel.root.dataset.panel}-suggestion-${index}`;
    option.className = "suggestion";
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");
    option.dataset.gameId = String(game.id);
    option.textContent = gameLabel(game);
    fragment.appendChild(option);
  });

  panel.suggestions.appendChild(fragment);
  panel.suggestions.hidden = false;
  panel.input.setAttribute("aria-expanded", "true");
}

function updateActiveSuggestion(panel) {
  const options = panel.suggestions.children;
  for (let index = 0; index < options.length; index += 1) {
    const active = index === panel.activeIndex;
    options[index].classList.toggle("active", active);
    options[index].setAttribute("aria-selected", String(active));
  }

  const activeOption = options[panel.activeIndex];
  if (activeOption) {
    panel.input.setAttribute("aria-activedescendant", activeOption.id);
    activeOption.scrollIntoView({ block: "nearest" });
  } else {
    panel.input.removeAttribute("aria-activedescendant");
  }
}

function closeSuggestions(panel) {
  panel.suggestions.hidden = true;
  panel.input.setAttribute("aria-expanded", "false");
  panel.input.removeAttribute("aria-activedescendant");
}

function selectGame(panel, game) {
  panel.selectedGame = game;
  panel.input.value = gameLabel(game);
  panel.status.textContent = `Selected: ${gameLabel(game)}.`;
  panel.matches = [];
  panel.activeIndex = -1;
  closeSuggestions(panel);
  renderComparison();
}

function renderComparison() {
  const selectedGames = panels
    .map(panel => panel.selectedGame)
    .filter(Boolean);
  const globalSalesMaximum = Math.max(
    0,
    ...selectedGames.map(game => game.globalSales || 0)
  );
  const regionalSalesMaximum = Math.max(
    0,
    ...selectedGames.flatMap(game =>
      game.regionalSales.map(region => region.value || 0)
    )
  );

  panels.forEach(panel => {
    renderGameCard(panel, panel.selectedGame, {
      globalSalesMaximum,
      regionalSalesMaximum
    });
  });
}

function renderGameCard(panel, game, scales = {}) {
  panel.card.replaceChildren();
  if (!game) {
    renderMessage(
      panel.card,
      dataError
        ? dataError.message
        : "Search by title, console, year, genre, publisher, or developer."
    );
    return;
  }

  const heading = createElement("header", "game-heading");
  heading.append(
    createElement("h3", "", game.name || "Unknown title"),
    createElement(
      "p",
      "game-meta",
      [game.platform, game.year, game.genre].filter(Boolean).join(" · ") ||
        "Game details unavailable"
    )
  );

  const sales = createElement("section", "metric-section");
  sales.appendChild(createElement("h4", "section-title", "Global sales"));
  const globalSalesValue = createElement(
    "strong",
    "global-sales-value",
    `${formatSales(game.globalSales)} M`
  );
  sales.appendChild(globalSalesValue);
  sales.appendChild(
    createMeter(
      "Global sales comparison",
      game.globalSales,
      scales.globalSalesMaximum
    )
  );
  sales.appendChild(createElement("p", "unit-note", "Millions of units"));

  const regions = createElement("section", "metric-section");
  regions.appendChild(createElement("h4", "section-title", "Sales by region"));
  game.regionalSales.forEach(region => {
    regions.appendChild(
      createValueMeter(
        region.label,
        region.value,
        scales.regionalSalesMaximum
      )
    );
  });

  const reviews = createElement("section", "metric-section");
  reviews.appendChild(createElement("h4", "section-title", "Reviews"));
  const reviewGrid = createElement("div", "review-grid");
  reviewGrid.append(
    createReview(
      "Critic score",
      game.criticScore,
      100,
      game.criticCount,
      "reviews"
    ),
    createReview("User score", game.userScore, 10, game.userCount, "ratings")
  );
  reviews.appendChild(reviewGrid);

  const details = createElement("dl", "details-grid");
  appendDetail(details, "Publisher", game.publisher);
  appendDetail(details, "Developer", game.developer);
  appendDetail(details, "ESRB rating", game.rating);

  panel.card.append(heading, sales, regions, reviews, details);
}

function createValueMeter(label, value, maximum) {
  const row = createElement("div", "value-meter");
  const labels = createElement("div", "value-meter-labels");
  labels.append(
    createElement("span", "", label),
    createElement("strong", "", `${formatSales(value)} M`)
  );
  row.append(labels, createMeter(`${label} sales`, value, maximum));
  return row;
}

function createReview(label, score, maximum, count, countLabel) {
  const review = createElement("div", "review");
  const value = Number.isFinite(score) ? formatScore(score) : "N/A";
  review.append(
    createElement("h5", "", label),
    createElement("strong", "review-score", `${value} / ${maximum}`)
  );
  review.appendChild(createMeter(`${label} comparison`, score, maximum));
  review.appendChild(
    createElement(
      "p",
      "unit-note",
      `${Number.isFinite(count) ? count.toLocaleString() : "N/A"} ${countLabel}`
    )
  );
  return review;
}

function createMeter(label, value, maximum) {
  const track = createElement("div", "meter");
  track.setAttribute("role", "img");
  track.setAttribute(
    "aria-label",
    `${label}: ${Number.isFinite(value) ? value : "not available"}`
  );
  const fill = createElement("span", "meter-fill");
  const width =
    Number.isFinite(value) && Number.isFinite(maximum) && maximum > 0
      ? Math.min((value / maximum) * 100, 100)
      : 0;
  fill.style.width = `${width}%`;
  track.appendChild(fill);
  return track;
}

function appendDetail(list, label, value) {
  list.append(
    createElement("dt", "", label),
    createElement("dd", "", value || "N/A")
  );
}

function renderMessage(container, message) {
  container.replaceChildren(createElement("p", "empty-state", message));
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function formatSales(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "N/A";
}

function formatScore(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatCount(value) {
  return value.toLocaleString();
}

panels.forEach(setupSearch);
setupModeControls();
loadGames();

document.addEventListener("pointerdown", event => {
  panels.forEach(panel => {
    if (!panel.root.contains(event.target)) {
      closeSuggestions(panel);
    }
  });
});
