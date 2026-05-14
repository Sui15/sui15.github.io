/**
 * Play: four discover-style cards, one per difficulty band, ordered Easy → Challenging (left → right).
 * Uses global POSITIONS_DECK from positions-deck-data.js.
 */

/** @typedef {{ cardNo?: number; id: string; title: string; description?: string; image?: string; difficulty?: string; energy?: string; flexibility?: string; intimacy?: string }} Position */

/** Left-to-right: easiest → hardest (matches tier scale). */
const DIFFICULTY_ORDER = ["easy", "moderate", "advanced", "challenging"];

/**
 * @template T
 * @param {T[]} items
 * @returns {T[]}
 */
function shuffle(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = copy[i];
    copy[i] = copy[j];
    copy[j] = t;
  }
  return copy;
}

/**
 * @template T
 * @param {T[]} items
 * @param {number} n
 * @returns {T[]}
 */
function pickNUnique(items, n) {
  const count = Math.max(0, Math.floor(Number(n)) || 0);
  if (count === 0 || items.length === 0) {
    return [];
  }
  const k = Math.min(count, items.length);
  return shuffle(items).slice(0, k);
}

/** @param {string | undefined} v */
function normDiff(v) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

/**
 * Pick four cards: one random pick per difficulty bucket, ordered Easy → Challenging.
 * If a bucket has no cards, fills from the rest of the deck (still four slots when possible).
 * @param {Position[]} deck
 * @returns {Position[]}
 */
function pickFourOrderedByDifficulty(deck) {
  if (deck.length === 0) {
    return [];
  }

  /** @type {Record<string, Position[]>} */
  const groups = {};
  for (const p of deck) {
    const k = normDiff(p.difficulty);
    const key = DIFFICULTY_ORDER.includes(k) ? k : "other";
    (groups[key] ||= []).push(p);
  }

  const usedIds = new Set();
  /** @type {Position[]} */
  const result = [];

  for (const bucket of DIFFICULTY_ORDER) {
    const pool = (groups[bucket] || []).filter((p) => !usedIds.has(p.id));
    let card = null;
    if (pool.length) {
      card = pickNUnique(pool, 1)[0];
    } else {
      const rest = deck.filter((p) => !usedIds.has(p.id));
      if (rest.length) {
        card = pickNUnique(rest, 1)[0];
      }
    }
    if (card) {
      result.push(card);
      usedIds.add(card.id);
    }
  }

  return result;
}

/** @param {unknown} s */
function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** @param {string | undefined} imagePath */
function resolveImageUrl(imagePath) {
  if (!imagePath || typeof window === "undefined") {
    return "";
  }
  const trimmed = String(imagePath).replace(/^\//, "");
  try {
    return new URL("../" + trimmed, window.location.href).href;
  } catch {
    return "";
  }
}

/** @param {string | undefined} v */
function normTier(v) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** @param {string | undefined} difficulty */
function difficultyClass(difficulty) {
  switch (normTier(difficulty)) {
    case "easy":
      return "tier tier-diff tier-diff--easy";
    case "moderate":
      return "tier tier-diff tier-diff--moderate";
    case "advanced":
      return "tier tier-diff tier-diff--advanced";
    case "challenging":
      return "tier tier-diff tier-diff--challenging";
    default:
      return "tier tier-diff tier-diff--unknown";
  }
}

/** @param {string | undefined} value */
function energyFlexClass(value) {
  switch (normTier(value)) {
    case "low":
      return "tier tier-ef tier-ef--low";
    case "moderate":
      return "tier tier-ef tier-ef--moderate";
    case "high":
      return "tier tier-ef tier-ef--high";
    case "very high":
      return "tier tier-ef tier-ef--very-high";
    default:
      return "tier tier-ef tier-ef--unknown";
  }
}

/** @param {string | undefined} value */
function intimacyClass(value) {
  switch (normTier(value)) {
    case "low":
      return "tier tier-in tier-in--low";
    case "moderate":
      return "tier tier-in tier-in--moderate";
    case "high":
      return "tier tier-in tier-in--high";
    case "very high":
      return "tier tier-in tier-in--very-high";
    default:
      return "tier tier-in tier-in--unknown";
  }
}

/**
 * @param {string} label
 * @param {string | undefined} value
 * @param {(v: string | undefined) => string} classFn
 */
function discoverStatCell(label, value, classFn) {
  const raw = value != null ? String(value).trim() : "";
  const has = raw.length > 0;
  const v = has ? escapeHtml(raw) : escapeHtml("—");
  const cls = has ? classFn(value) : "tier tier-diff tier-diff--unknown";
  return (
    `<td class="discover-card-cell" role="group" aria-label="${escapeHtml(label)}">` +
    `<span class="discover-card-cell-lbl">${escapeHtml(label)}</span>` +
    `<span class="discover-card-cell-val"><span class="${cls}"><strong>${v}</strong></span></span>` +
    `</td>`
  );
}

/**
 * @param {Position} p
 */
function discoverStatTableHtml(p) {
  const a = discoverStatCell("Difficulty", p.difficulty, difficultyClass);
  const b = discoverStatCell("Energy", p.energy, energyFlexClass);
  const c = discoverStatCell("Flexibility", p.flexibility, energyFlexClass);
  const d = discoverStatCell("Intimacy", p.intimacy, intimacyClass);
  return (
    `<table class="discover-card-stat-grid" role="group" aria-label="Ratings">` +
    `<tbody><tr>${a}${b}</tr><tr>${c}${d}</tr></tbody></table>`
  );
}

/**
 * @param {Position} p
 * @returns {HTMLElement}
 */
function createPlayDiscoverCard(p) {
  const article = document.createElement("article");
  article.className = "play-card-item";

  const shell = document.createElement("div");
  shell.className = "positions-hub-card positions-hub-card--static discover-card";
  shell.setAttribute("role", "region");

  const titleId = `play-card-title-${p.id || String(p.cardNo ?? "x")}`;
  shell.setAttribute("aria-labelledby", titleId);

  const body = document.createElement("div");
  body.className = "discover-card-body";

  const noEl = document.createElement("span");
  noEl.className = "positions-hub-card-no";
  noEl.textContent = p.cardNo != null ? `#${p.cardNo}` : "";

  const titleEl = document.createElement("span");
  titleEl.className = "positions-hub-title";
  titleEl.id = titleId;
  titleEl.textContent = p.title || "-";

  const visual = document.createElement("div");
  visual.className = "discover-card-visual";
  const img = document.createElement("img");
  img.className = "discover-card-img";
  img.decoding = "async";

  const imgHref = resolveImageUrl(p.image);
  if (imgHref) {
    img.alt = p.title ? `${p.title} illustration` : "Position illustration";
    img.src = imgHref;
  } else {
    visual.classList.add("discover-card-visual--empty");
    img.alt = "";
  }

  const bottom = document.createElement("div");
  bottom.className = "discover-card-bottom";
  const parts = [];
  if (p.description) {
    parts.push(`<p class="discover-card-desc">${escapeHtml(p.description)}</p>`);
  }
  parts.push(discoverStatTableHtml(p));
  bottom.innerHTML = parts.join("") || `<p class="discover-card-desc">No extra details.</p>`;

  visual.appendChild(img);
  body.append(noEl, titleEl, visual, bottom);
  shell.appendChild(body);
  article.appendChild(shell);
  return article;
}

function main() {
  const strip = document.getElementById("play-strip");
  const status = document.getElementById("play-status");
  const btn = document.getElementById("btn-shuffle");

  if (!(strip instanceof HTMLElement) || !(status instanceof HTMLElement) || !(btn instanceof HTMLButtonElement)) {
    return;
  }

  function deal() {
    strip.replaceChildren();
    const deck =
      typeof POSITIONS_DECK !== "undefined" && Array.isArray(POSITIONS_DECK) ? POSITIONS_DECK : [];
    if (!deck.length) {
      status.textContent = "Deck not loaded. Ensure positions-deck-data.js is included before play.js.";
      return;
    }

    const picked = pickFourOrderedByDifficulty(deck);
    if (picked.length === 0) {
      status.textContent = "No cards in the deck.";
      return;
    }

    status.textContent = `${picked.length} cards — Easy on the left, harder to the right. Scroll sideways to see each.`;
    for (const card of picked) {
      strip.appendChild(createPlayDiscoverCard(card));
    }
  }

  btn.addEventListener("click", () => {
    deal();
  });

  deal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
