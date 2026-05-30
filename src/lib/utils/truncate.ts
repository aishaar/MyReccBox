/**
 * Truncates a notes string to a maximum length.
 * Returns the full text if it's within the limit,
 * otherwise returns the first maxLength characters followed by "…" (U+2026).
 */
export function truncateNotes(notes: string, maxLength: number): string {
  if (notes.length <= maxLength) {
    return notes
  }
  return notes.slice(0, maxLength) + '\u2026'
}
