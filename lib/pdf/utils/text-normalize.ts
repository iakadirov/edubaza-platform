/**
 * Helper to normalize quotes and Uzbek characters for PDF
 * Fixes encoding issues from database where apostrophes get corrupted
 * Uses regular apostrophe (U+0027) instead of U+02BB for better PDF font compatibility
 */
export function normalizeUzbText(text: string): string {
  return text
    // Fix corrupted apostrophes (encoding issues from database) - use regular apostrophe for PDF
    .replace(/»/g, "'")  // Guillemet right → '
    .replace(/«/g, "'")  // Guillemet left → '
    .replace(/¼/g, "'")  // Quarter symbol (encoding corruption) → '
    .replace(/½/g, "'")  // Half symbol (encoding corruption) → '
    .replace(/¾/g, "'")  // Three quarters symbol (encoding corruption) → '
    .replace(/ʻ/g, "'")  // U+02BB → U+0027 (for PDF font compatibility)
    .replace(/'/g, "'")  // U+2019 → U+0027
    // Replace typographic quotes with regular quotes
    .replace(/[„""]/g, '"')
    .replace(/[‚]/g, "'");
}
