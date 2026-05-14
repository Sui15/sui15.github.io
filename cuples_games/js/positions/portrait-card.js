import { resolveImageUrl } from "./deck.js";
import { difficultyClass, energyFlexClass, intimacyClass } from "./tiers.js";

/**
 * Build the 9:16 position card in the DOM (no HTML template element required).
 * Layout: full-bleed background image; title + card number over the image; bottom
 * stack: centered difficulty, description, then a 3-column footer (energy, flexibility, intimacy).
 *
 * @param {import("./deck.js").Position} pos
 * @param {{ compact?: boolean }} [opts]
 * @returns {HTMLElement}
 */
export function createPortraitCard(pos, opts = {}) {
  const compact = Boolean(opts.compact);

  const article = document.createElement("article");
  article.className = compact ? "portrait-card portrait-card--compact" : "portrait-card";

  const img = document.createElement("img");
  img.className = "portrait-card-bg";
  img.src = resolveImageUrl(pos.image);
  img.alt = pos.title ? `${pos.title} — illustration` : "Position illustration";
  img.width = 720;
  img.height = 1280;
  img.loading = "lazy";
  img.decoding = "async";

  const noEl = document.createElement("span");
  noEl.className = "portrait-card-no";
  noEl.setAttribute("aria-label", "Card number");
  noEl.textContent = pos.cardNo != null ? String(pos.cardNo) : "";

  const titleEl = document.createElement("h2");
  titleEl.className = "portrait-card-title";
  titleEl.textContent = pos.title;

  const bottom = document.createElement("div");
  bottom.className = "portrait-card-bottom";

  const diffEl = document.createElement("p");
  diffEl.className = `portrait-card-difficulty ${difficultyClass(pos.difficulty)}`;
  diffEl.textContent = pos.difficulty ?? "—";

  const descEl = document.createElement("p");
  descEl.className = "portrait-card-desc";
  descEl.textContent = pos.description ?? "";

  const footer = document.createElement("div");
  footer.className = "portrait-card-footer";
  footer.setAttribute("role", "group");
  footer.setAttribute("aria-label", "Energy, flexibility, intimacy");

  /**
   * @param {string} label
   * @param {string | undefined} value
   * @param {(v: string | undefined) => string} tierFn
   */
  function footCol(label, value, tierFn) {
    const col = document.createElement("div");
    col.className = "portrait-foot-col";
    const lbl = document.createElement("span");
    lbl.className = "portrait-foot-label";
    lbl.textContent = label;
    const val = document.createElement("span");
    val.className = `portrait-card-stat-value ${tierFn(value)}`;
    val.textContent = value ?? "—";
    col.append(lbl, val);
    return col;
  }

  footer.append(
    footCol("Energy", pos.energy, energyFlexClass),
    footCol("Flexibility", pos.flexibility, energyFlexClass),
    footCol("Intimacy", pos.intimacy, intimacyClass),
  );

  bottom.append(diffEl, descEl, footer);
  article.append(img, noEl, titleEl, bottom);

  return article;
}
