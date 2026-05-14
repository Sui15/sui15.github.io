/**
 * Fisher–Yates shuffle (copy; does not mutate input).
 * @template T
 * @param {T[]} items
 * @returns {T[]}
 */
export function shuffle(items) {
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
 * Pick up to n unique items from a shuffled copy (no replacement).
 * @template T
 * @param {T[]} items
 * @param {number} n
 * @returns {T[]}
 */
export function pickNUnique(items, n) {
  const count = Math.max(0, Math.floor(Number(n)) || 0);
  if (count === 0 || items.length === 0) {
    return [];
  }
  const k = Math.min(count, items.length);
  return shuffle(items).slice(0, k);
}
