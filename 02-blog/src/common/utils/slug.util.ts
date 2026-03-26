/**
 * Generate a URL-friendly slug from a string.
 * Removes special chars, replaces spaces with hyphens, lowercases.
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generate a unique slug by appending a suffix if needed.
 */
export function generateUniqueSlug(text: string, suffix?: string | number): string {
  const base = generateSlug(text);
  return suffix ? `${base}-${suffix}` : base;
}
