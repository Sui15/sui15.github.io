import { loadDeck, sortByCardNo, resolveImageUrl } from "./deck.js";
import { difficultyClass, energyFlexClass, intimacyClass } from "./tiers.js";

function main() {
  const grid = document.getElementById("browse-grid");
  const status = document.getElementById("browse-status");

  if (!(grid instanceof HTMLElement) || !(status instanceof HTMLElement)) {
    return;
  }

  /**
   * @param {import("./deck.js").Position} pos
   */
  function buildRow(pos) {
    const wrap = document.createElement("div");
    wrap.className = "browse-item";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "browse-tile";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute(
      "aria-label",
      `Card ${pos.cardNo ?? ""}: ${pos.title}. Expand for details.`,
    );

    const thumb = document.createElement("img");
    thumb.className = "browse-tile-thumb";
    thumb.src = resolveImageUrl(pos.image);
    thumb.alt = "";
    thumb.width = 120;
    thumb.height = 120;
    thumb.loading = "lazy";

    const meta = document.createElement("div");
    meta.className = "browse-tile-meta";
    const no = document.createElement("span");
    no.className = "browse-tile-no";
    no.textContent = pos.cardNo != null ? String(pos.cardNo) : "";
    const title = document.createElement("span");
    title.className = "browse-tile-title";
    title.textContent = pos.title;
    meta.append(no, title);

    const chev = document.createElement("span");
    chev.className = "browse-tile-chev";
    chev.setAttribute("aria-hidden", "true");
    chev.textContent = "▸";

    btn.append(thumb, meta, chev);

    const panel = document.createElement("div");
    panel.className = "browse-panel";
    panel.hidden = true;

    const diff = document.createElement("p");
    diff.className = `browse-panel-diff ${difficultyClass(pos.difficulty)}`;
    diff.textContent = pos.difficulty ?? "—";

    const desc = document.createElement("p");
    desc.className = "browse-panel-desc";
    desc.textContent = pos.description ?? "";

    const foot = document.createElement("div");
    foot.className = "browse-panel-foot";

    function footCol(label, value, tierFn) {
      const col = document.createElement("div");
      col.className = "browse-foot-col";
      const lbl = document.createElement("span");
      lbl.className = "browse-foot-lbl";
      lbl.textContent = label;
      const val = document.createElement("span");
      val.className = tierFn(value);
      val.textContent = value ?? "—";
      col.append(lbl, val);
      return col;
    }

    foot.append(
      footCol("Energy", pos.energy, energyFlexClass),
      footCol("Flexibility", pos.flexibility, energyFlexClass),
      footCol("Intimacy", pos.intimacy, intimacyClass),
    );

    panel.append(diff, desc, foot);
    wrap.append(btn, panel);

    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      wrap.classList.toggle("is-expanded", !open);
      panel.hidden = open;
    });

    return wrap;
  }

  void (async () => {
    status.textContent = "Loading…";
    let deck;
    try {
      deck = sortByCardNo(await loadDeck());
    } catch (err) {
      console.error(err);
      status.textContent =
        "Could not load positions.json. Open this site over HTTP (not file://)—e.g. GitHub Pages, or any static server from the project folder (Python: py -m http.server). No build or Node.js is needed.";
      return;
    }
    status.textContent = `${deck.length} cards`;
    grid.textContent = "";
    for (const pos of deck) {
      grid.appendChild(buildRow(pos));
    }
  })();
}

main();
