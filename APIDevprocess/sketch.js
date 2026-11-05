const dataPath =
  "Introcsv common set values/Video_Games_Sales_as_at_22_Dec_2016.csv";
const panels = ["left", "right"].map(createPanel);
let games = [];
let gamesById = new Map();
let dataError = null;

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
  } catch (error) {
    dataError = error;
    console.error("Could not load the game data:", error);
    panels.forEach(panel => {
      panel.status.textContent = "The game dataset could not be loaded.";
      renderMessage(panel.card, error.message);
    });
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
    userCount: number("User_Count")
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

panels.forEach(setupSearch);
loadGames();

document.addEventListener("pointerdown", event => {
  panels.forEach(panel => {
    if (!panel.root.contains(event.target)) {
      closeSuggestions(panel);
    }
  });
});
