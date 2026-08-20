// Combining diacritical marks (U+0300-U+036F) left behind by NFD normalization,
// e.g. "á" ("a" with acute) -> "a" + U+0301.
const DIACRITICS = /[̀-ͯ]/g;

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function deriveUsername(
  email: string,
  takenUsernames: readonly string[],
): string {
  const base = slugify(email.split('@')[0]);
  if (!takenUsernames.includes(base)) {
    return base;
  }

  let suffix = 2;
  while (takenUsernames.includes(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}
