import { describe, it, expect, vi, afterEach } from 'vitest'
import { relativeTime } from '@/lib/utils/time'

describe('relativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for timestamps less than 1 minute ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:30Z'))
    expect(relativeTime('2024-01-15T12:00:00Z')).toBe('just now')
  })

  it('returns "1 minute ago" for exactly 1 minute ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:01:00Z'))
    expect(relativeTime('2024-01-15T12:00:00Z')).toBe('1 minute ago')
  })

  it('returns "X minutes ago" for timestamps minutes ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:45:00Z'))
    expect(relativeTime('2024-01-15T12:00:00Z')).toBe('45 minutes ago')
  })

  it('returns "1 hour ago" for exactly 1 hour ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T13:00:00Z'))
    expect(relativeTime('2024-01-15T12:00:00Z')).toBe('1 hour ago')
  })

  it('returns "X hours ago" for timestamps hours ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T15:00:00Z'))
    expect(relativeTime('2024-01-15T12:00:00Z')).toBe('3 hours ago')
  })

  it('returns "1 day ago" for exactly 1 day ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-16T12:00:00Z'))
    expect(relativeTime('2024-01-15T12:00:00Z')).toBe('1 day ago')
  })

  it('returns "X days ago" for timestamps days ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-20T12:00:00Z'))
    expect(relativeTime('2024-01-15T12:00:00Z')).toBe('5 days ago')
  })

  it('returns "1 week ago" for exactly 1 week ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-22T12:00:00Z'))
    expect(relativeTime('2024-01-15T12:00:00Z')).toBe('1 week ago')
  })

  it('returns "X weeks ago" for timestamps weeks ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-02-05T12:00:00Z'))
    expect(relativeTime('2024-01-15T12:00:00Z')).toBe('3 weeks ago')
  })

  it('returns "1 month ago" for approximately 1 month ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-02-15T12:00:00Z'))
    expect(relativeTime('2024-01-15T12:00:00Z')).toBe('1 month ago')
  })

  it('returns "X months ago" for timestamps months ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'))
    expect(relativeTime('2024-01-15T12:00:00Z')).toBe('5 months ago')
  })

  it('returns "1 year ago" for approximately 1 year ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
    expect(relativeTime('2024-01-15T12:00:00Z')).toBe('1 year ago')
  })

  it('returns "X years ago" for timestamps years ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2027-01-15T12:00:00Z'))
    expect(relativeTime('2024-01-15T12:00:00Z')).toBe('3 years ago')
  })
})
