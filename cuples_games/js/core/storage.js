/**
 * Minimal localStorage wrapper with JSON encode/decode.
 * @param {string} key
 * @returns {unknown | null}
 */
export function loadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 * @returns {boolean}
 */
export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} key
 */
export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
