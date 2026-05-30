import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Suggestion } from '@/types'

// Mock the Supabase server client with chainable query builder
const mockRange = vi.fn()
const mockOrder = vi.fn(() => ({ range: mockRange }))
const mockEqCategory = vi.fn(() => ({ order: mockOrder, eq: mockEqCategory }))
const mockEqUserId = vi.fn(() => ({
  order: mockOrder,
  eq: mockEqCategory,
}))
const mockSelect = vi.fn(() => ({ eq: mockEqUserId }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

import { getSuggestions } from '@/lib/data/suggestions'

const makeSuggestion = (overrides: Partial<Suggestion> = {}): Suggestion => ({
  id: 'uuid-1',
  created_at: '2024-01-15T10:00:00Z',
  user_id: 'user-123',
  name: 'Alice',
  category: 'Book',
  title: 'The Great Gatsby',
  notes: null,
  seen: false,
  ...overrides,
})

describe('getSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: successful query returning empty results
    mockRange.mockResolvedValue({ data: [], count: 0, error: null })
    // Re-wire the chain so category filter works
    mockEqCategory.mockReturnValue({ order: mockOrder, eq: mockEqCategory })
    mockEqUserId.mockReturnValue({ order: mockOrder, eq: mockEqCategory })
  })

  it('queries the suggestions table with userId filter', async () => {
    await getSuggestions({ userId: 'user-123', page: 1, pageSize: 20 })

    expect(mockFrom).toHaveBeenCalledWith('suggestions')
    expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' })
    expect(mockEqUserId).toHaveBeenCalledWith('user_id', 'user-123')
  })

  it('orders results by created_at descending', async () => {
    await getSuggestions({ userId: 'user-123', page: 1, pageSize: 20 })

    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('applies correct pagination range for page 1', async () => {
    await getSuggestions({ userId: 'user-123', page: 1, pageSize: 20 })

    expect(mockRange).toHaveBeenCalledWith(0, 19)
  })

  it('applies correct pagination range for page 3 with pageSize 10', async () => {
    await getSuggestions({ userId: 'user-123', page: 3, pageSize: 10 })

    expect(mockRange).toHaveBeenCalledWith(20, 29)
  })

  it('applies category filter when provided', async () => {
    await getSuggestions({ userId: 'user-123', category: 'Movie', page: 1, pageSize: 20 })

    expect(mockEqCategory).toHaveBeenCalledWith('category', 'Movie')
  })

  it('returns paginated result with correct metadata', async () => {
    const suggestions = [makeSuggestion(), makeSuggestion({ id: 'uuid-2' })]
    mockRange.mockResolvedValue({ data: suggestions, count: 45, error: null })

    const result = await getSuggestions({ userId: 'user-123', page: 2, pageSize: 20 })

    expect(result).toEqual({
      data: suggestions,
      total: 45,
      page: 2,
      pageSize: 20,
      totalPages: 3,
    })
  })

  it('calculates totalPages correctly (ceiling division)', async () => {
    mockRange.mockResolvedValue({ data: [], count: 21, error: null })

    const result = await getSuggestions({ userId: 'user-123', page: 1, pageSize: 20 })

    expect(result.totalPages).toBe(2)
  })

  it('returns empty result on database error', async () => {
    mockRange.mockResolvedValue({ data: null, count: null, error: { message: 'DB error' } })

    const result = await getSuggestions({ userId: 'user-123', page: 1, pageSize: 20 })

    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    })
  })

  it('handles null count gracefully', async () => {
    mockRange.mockResolvedValue({ data: [makeSuggestion()], count: null, error: null })

    const result = await getSuggestions({ userId: 'user-123', page: 1, pageSize: 20 })

    expect(result.total).toBe(0)
    expect(result.totalPages).toBe(0)
  })
})
