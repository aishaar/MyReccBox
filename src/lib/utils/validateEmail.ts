/**
 * Validates an email address string.
 * Returns an error message if invalid, or null if valid.
 *
 * Rejects:
 * - Empty strings
 * - Whitespace-only strings
 * - Missing @ symbol
 * - Missing domain (no dot after @)
 */
export function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) {
    return 'Please enter a valid email address.'
  }
  // Basic email format: must have @, domain with at least one dot
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address.'
  }
  return null
}
