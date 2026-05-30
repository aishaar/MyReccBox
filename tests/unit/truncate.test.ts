import { describe, it, expect } from 'vitest'
import { truncateNotes } from '@/lib/utils/truncate'

describe('truncateNotes', () => {
  it('returns full text when length is less than maxLength', () => {
    expect(truncateNotes('hello', 10)).toBe('hello')
  })

  it('returns full text when length equals maxLength', () => {
    expect(truncateNotes('hello', 5)).toBe('hello')
  })

  it('truncates and appends ellipsis when text exceeds maxLength', () => {
    expect(truncateNotes('hello world', 5)).toBe('hello\u2026')
  })

  it('handles empty string', () => {
    expect(truncateNotes('', 10)).toBe('')
  })

  it('truncates to zero characters plus ellipsis when maxLength is 0', () => {
    expect(truncateNotes('hello', 0)).toBe('\u2026')
  })
})
