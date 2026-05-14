import { pickNUnique, shuffle } from "../core/random.js";

/**
 * After a successful fetch, this is the exact URL of `positions.json`. Image paths
 * in JSON are resolved relative to the site root using this URL.
 * @type {string | null}
 */
let deckJsonResolvedUrl = null;

/**
 * Every URL we try, in order, until one returns HTTP 200 JSON.
 */
function candidateDeckUrls() {
  /** @type {string[]} */
  const list = [];
  const push = (/** @type {string} */ href) => {
    if (!list.includes(href)) {
      list.push(href);
    }
  };

  const locHref = typeof window !== "undefined" && window.location?.href;
  const baseURI = typeof document !== "undefined" && document?.baseURI;

  if (locHref) {
    try {
      push(new URL("../data/positions.json", locHref).href);
    } catch {
      /* */
    }
  }
  if (baseURI && baseURI !== locHref) {
    try {
      push(new URL("../data/positions.json", baseURI).href);
    } catch {
      /* */
    }
  }

  if (typeof window !== "undefined") {
    const { pathname, origin } = window.location;
    const idx = pathname.indexOf("/positions/");
    if (idx >= 0) {
      const basePath = idx === 0 ? "" : pathname.slice(0, idx);
      const pathPart = basePath ? `${basePath}/data/positions.json` : `/data/positions.json`;
      try {
        push(new URL(pathPart, origin).href);
      } catch {
        /* */
      }
    }
  }

  try {
    push(new URL("../../data/positions.json", import.meta.url).href);
  } catch {
    /* */
  }

  return list;
}

/**
 * @typedef {{
 *   cardNo: number;
 *   id: string;
 *   title: string;
 *   description: string;
 *   image: string;
 *   difficulty?: string;
 *   energy?: string;
 *   flexibility?: string;
 *   intimacy?: string;
 *   tags?: string[];
 * }} Position
 */

export async function loadDeck() {
  deckJsonResolvedUrl = null;
  const urls = candidateDeckUrls();
  let lastStatus = "no URL tried";

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        lastStatus = String(res.status);
        continue;
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        lastStatus = "invalid JSON shape";
        continue;
      }
      deckJsonResolvedUrl = url;
      return data;
    } catch (err) {
      lastStatus = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(`Failed to load positions.json (last: ${lastStatus}). Tried: ${urls.join(" | ")}`);
}

/**
 * @param {string} imagePath
 * @returns {string}
 */
export function resolveImageUrl(imagePath) {
  if (!imagePath) {
    return "";
  }
  if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith("data:")) {
    return imagePath;
  }
  const trimmed = imagePath.replace(/^\//, "");

  if (deckJsonResolvedUrl) {
    try {
      return new URL(`../${trimmed}`, deckJsonResolvedUrl).href;
    } catch {
      /* fall through */
    }
  }

  if (typeof window !== "undefined" && window.location?.href) {
    try {
      return new URL(`../${trimmed}`, window.location.href).href;
    } catch {
      /* fall through */
    }
  }

  return new URL(`../../${trimmed}`, import.meta.url).href;
}

/** @param {string | undefined} v */
function normDiff(v) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

/**
 * Pick up to three cards so each uses a different difficulty bucket when the deck allows it.
 * @param {Position[]} deck
 * @returns {Position[]}
 */
export function pickThreeDistinctDifficulties(deck) {
  if (deck.length === 0) {
    return [];
  }
  if (deck.length <= 3) {
    return pickNUnique(deck, deck.length);
  }

  /** @type {Record<string, Position[]>} */
  const groups = {};
  for (const p of deck) {
    const k = normDiff(p.difficulty) || "unknown";
    (groups[k] ||= []).push(p);
  }

  const keys = shuffle(Object.keys(groups));
  if (keys.length >= 3) {
    const chosen = keys.slice(0, 3);
    return chosen.map((k) => pickNUnique(groups[k], 1)[0]);
  }

  if (keys.length === 2) {
    const a = pickNUnique(groups[keys[0]], 1)[0];
    const b = pickNUnique(groups[keys[1]], 1)[0];
    const pool = deck.filter((p) => p.id !== a.id && p.id !== b.id);
    const c = pickNUnique(pool, 1)[0];
    return shuffle([a, b, c]);
  }

  return pickNUnique(deck, 3);
}

/**
 * @param {Position[]} deck
 * @returns {Position | null}
 */
export function pickRandom(deck) {
  if (deck.length === 0) {
    return null;
  }
  return pickNUnique(deck, 1)[0];
}

/**
 * @param {Position[]} deck
 */
export function sortByCardNo(deck) {
  return deck.slice().sort((a, b) => (a.cardNo ?? 0) - (b.cardNo ?? 0));
}
