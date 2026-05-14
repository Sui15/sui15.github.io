/**
 * Discover: random card from global POSITIONS_DECK (positions-deck-data.js).
 * Regenerate positions-deck-data.js when data/positions.json changes.
 */

/** @typedef {{ cardNo?: number; id?: string; title: string; description?: string; image?: string; difficulty?: string; energy?: string; flexibility?: string; intimacy?: string }} Position */

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
 * @template T
 * @param {readonly T[]} arr
 * @returns {T | null}
 */
function pickRandom(arr) {
  if (!arr.length) {
    return null;
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

function main() {
  const status = document.getElementById("discover-status");
  const btn = document.getElementById("btn-shuffle");
  const noEl = document.getElementById("discover-card-no");
  const titleEl = document.getElementById("discover-card-title");
  const subEl = document.getElementById("discover-card-sub");

  if (!status || !btn || !noEl || !titleEl || !subEl) {
    return;
  }

  function bindDiscoverImage(p) {
    const imgEl = document.getElementById("discover-card-img");
    const visualEl = document.getElementById("discover-card-visual");
    const imgHref = resolveImageUrl(p.image);

    if (visualEl instanceof HTMLElement) {
      visualEl.classList.toggle("discover-card-visual--empty", !imgHref);
    }

    if (!(imgEl instanceof HTMLImageElement)) {
      return;
    }

    if (imgHref) {
      const alt = p.title ? `${p.title} illustration` : "Position illustration";
      imgEl.alt = alt;
      imgEl.src = imgHref;
    } else {
      imgEl.removeAttribute("src");
      imgEl.alt = "";
    }
  }

  function applyPosition(/** @type {Position} */ p) {
    noEl.textContent = p.cardNo != null ? `#${p.cardNo}` : "";
    titleEl.textContent = p.title || "-";
    bindDiscoverImage(p);

    const parts = [];
    if (p.description) {
      parts.push(`<p class="discover-card-desc">${escapeHtml(p.description)}</p>`);
    }

    parts.push(discoverStatTableHtml(p));

    subEl.innerHTML = parts.join("") || `<p class="discover-card-desc">No extra details.</p>`;
  }

  function showRandom() {
    const imgEl = document.getElementById("discover-card-img");
    const visualEl = document.getElementById("discover-card-visual");
    if (typeof POSITIONS_DECK === "undefined" || !Array.isArray(POSITIONS_DECK) || !POSITIONS_DECK.length) {
      status.textContent = "Deck not loaded. Ensure positions-deck-data.js is included before discover.js.";
      titleEl.textContent = "-";
      subEl.innerHTML = "";
      noEl.textContent = "";
      if (imgEl instanceof HTMLImageElement) {
        imgEl.removeAttribute("src");
        imgEl.alt = "";
      }
      if (visualEl instanceof HTMLElement) {
        visualEl.classList.add("discover-card-visual--empty");
      }
      return;
    }
    const p = pickRandom(POSITIONS_DECK);
    if (!p) {
      status.textContent = "No positions to show.";
      titleEl.textContent = "-";
      subEl.innerHTML = "";
      noEl.textContent = "";
      if (imgEl instanceof HTMLImageElement) {
        imgEl.removeAttribute("src");
        imgEl.alt = "";
      }
      if (visualEl instanceof HTMLElement) {
        visualEl.classList.add("discover-card-visual--empty");
      }
      return;
    }
    status.textContent = "";
    applyPosition(p);
  }

  btn.addEventListener("click", () => {
    showRandom();
  });

  showRandom();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}