import { describe, it, expect } from 'vitest'
import { validateEmail } from '@/lib/utils/validateEmail'

describe('validateEmail', () => {
  it('returns null for a valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull()
  })

  it('returns null for a valid email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toBeNull()
  })

  it('returns error for empty string', () => {
    expect(validateEmail('')).toBe('Please enter a valid email address.')
  })

  it('returns error for whitespace-only string', () => {
    expect(validateEmail('   ')).toBe('Please enter a valid email address.')
  })

  it('returns error for missing @ symbol', () => {
    expect(validateEmail('userexample.com')).toBe('Please enter a valid email address.')
  })

  it('returns error for missing domain', () => {
    expect(validateEmail('user@')).toBe('Please enter a valid email address.')
  })

  it('returns error for missing dot in domain', () => {
    expect(validateEmail('user@example')).toBe('Please enter a valid email address.')
  })

  it('returns error for missing local part', () => {
    expect(validateEmail('@example.com')).toBe('Please enter a valid email address.')
  })

  it('trims whitespace before validating', () => {
    expect(validateEmail('  user@example.com  ')).toBeNull()
  })

  it('returns error for email with spaces in local part', () => {
    expect(validateEmail('us er@example.com')).toBe('Please enter a valid email address.')
  })
})
