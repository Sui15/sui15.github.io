export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

export function pickNUnique<T>(items: readonly T[], n: number): T[] {
  if (n <= 0 || items.length === 0) return [];
  const k = Math.min(n, items.length);
  return shuffle(items).slice(0, k);
}
