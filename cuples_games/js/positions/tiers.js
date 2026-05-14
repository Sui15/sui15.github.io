/** @param {string | undefined} v */
function norm(v) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Difficulty: Easy blue, Moderate green, Advanced yellow, Challenging red.
 * @param {string | undefined} difficulty
 */
export function difficultyClass(difficulty) {
  switch (norm(difficulty)) {
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

/**
 * Energy / flexibility: Low green, Moderate yellow, High red, Very high purple.
 * @param {string | undefined} value
 */
export function energyFlexClass(value) {
  switch (norm(value)) {
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

/**
 * Intimacy: Low red, Moderate yellow, High green, Very high blue.
 * @param {string | undefined} value
 */
export function intimacyClass(value) {
  switch (norm(value)) {
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
