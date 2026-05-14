/**
 * Browse: title rows sorted by card number; expand for full discover-style card.
 * Uses global POSITIONS_DECK from positions-deck-data.js.
 */

/** @typedef {{ cardNo?: number; id: string; title: string; description?: string; image?: string; difficulty?: string; energy?: string; flexibility?: string; intimacy?: string }} Position */

/**
 * @param {Position[]} deck
 * @returns {Position[]}
 */
function sortByCardNo(deck) {
  return deck.slice().sort((a, b) => (a.cardNo ?? 0) - (b.cardNo ?? 0));
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
 * Full discover-style card (same layout as Discover / Play).
 * @param {Position} p
 * @returns {HTMLElement}
 */
function createBrowseFullCard(p) {
  const shell = document.createElement("div");
  shell.className =
    "positions-hub-card positions-hub-card--static discover-card browse-detail-card";
  shell.setAttribute("role", "region");

  const titleId = `browse-full-title-${p.id || String(p.cardNo ?? "x")}`;
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
  return shell;
}

/**
 * @param {Position} pos
 */
function buildRow(pos) {
  const wrap = document.createElement("div");
  wrap.className = "browse-item";

  const panelId = `browse-detail-${pos.id || String(pos.cardNo ?? "row")}`;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "browse-title-card";
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", panelId);
  btn.setAttribute(
    "aria-label",
    `Card ${pos.cardNo ?? ""}: ${pos.title}. Show full card.`,
  );

  const no = document.createElement("span");
  no.className = "browse-title-card-no";
  no.textContent = pos.cardNo != null ? String(pos.cardNo) : "—";

  const title = document.createElement("span");
  title.className = "browse-title-card-title";
  title.textContent = pos.title;

  const chev = document.createElement("span");
  chev.className = "browse-title-card-chev";
  chev.setAttribute("aria-hidden", "true");
  chev.textContent = "▸";

  btn.append(no, title, chev);

  const detail = document.createElement("div");
  detail.className = "browse-detail";
  detail.id = panelId;
  detail.hidden = true;
  detail.setAttribute("role", "region");
  detail.setAttribute("aria-label", `Full card: ${pos.title}`);
  detail.appendChild(createBrowseFullCard(pos));

  wrap.append(btn, detail);

  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", open ? "false" : "true");
    wrap.classList.toggle("is-expanded", !open);
    detail.hidden = open;
  });

  return wrap;
}

function main() {
  const grid = document.getElementById("browse-grid");
  const status = document.getElementById("browse-status");

  if (!(grid instanceof HTMLElement) || !(status instanceof HTMLElement)) {
    return;
  }

  const deck =
    typeof POSITIONS_DECK !== "undefined" && Array.isArray(POSITIONS_DECK) ? POSITIONS_DECK : [];
  if (!deck.length) {
    status.textContent = "Deck not loaded. Ensure positions-deck-data.js is included before browse.js.";
    return;
  }

  const sorted = sortByCardNo(deck);
  status.textContent = `${sorted.length} cards — tap a row to open the full card.`;
  grid.replaceChildren();
  for (const pos of sorted) {
    grid.appendChild(buildRow(pos));
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
