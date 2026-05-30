import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Supabase server client
const mockEq = vi.fn().mockReturnThis()
const mockUpdate = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ update: mockUpdate }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

import { updateSuggestionSeen } from '@/lib/data/suggestions'

describe('updateSuggestionSeen', () => {
  const suggestionId = '123e4567-e89b-12d3-a456-426614174000'
  const userId = '987fcdeb-51a2-43e7-b8c9-123456789abc'

  beforeEach(() => {
    vi.clearAllMocks()
    // Chain: .update({ seen: true }).eq('id', id).eq('user_id', userId).eq('seen', false)
    // Each .eq() returns an object with .eq() that eventually resolves
    const chainObj = {
      eq: vi.fn().mockImplementation(() => chainObj),
      then: undefined,
    }
    // Make the last .eq() resolve like a promise (Supabase returns a thenable)
    Object.defineProperty(chainObj, 'then', {
      value: undefined,
      writable: true,
    })

    // Reset with proper chaining
    mockEq.mockReset()
    mockUpdate.mockReset()
    mockFrom.mockReset()

    // Set up the chain: from().update().eq().eq().eq() -> { error: null }
    const thirdEq = vi.fn().mockResolvedValue({ error: null })
    const secondEq = vi.fn().mockReturnValue({ eq: thirdEq })
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq })
    mockUpdate.mockReturnValue({ eq: firstEq })
    mockFrom.mockReturnValue({ update: mockUpdate })
  })

  it('calls supabase with correct table and filters', async () => {
    const result = await updateSuggestionSeen(suggestionId, userId)

    expect(result).toEqual({ success: true })
    expect(mockFrom).toHaveBeenCalledWith('suggestions')
    expect(mockUpdate).toHaveBeenCalledWith({ seen: true })
  })

  it('filters by id, user_id, and seen=false for idempotency', async () => {
    await updateSuggestionSeen(suggestionId, userId)

    // Verify the chain: update -> eq('id', id) -> eq('user_id', userId) -> eq('seen', false)
    const firstEq = mockUpdate.mock.results[0].value.eq
    expect(firstEq).toHaveBeenCalledWith('id', suggestionId)

    const secondEq = firstEq.mock.results[0].value.eq
    expect(secondEq).toHaveBeenCalledWith('user_id', userId)

    const thirdEq = secondEq.mock.results[0].value.eq
    expect(thirdEq).toHaveBeenCalledWith('seen', false)
  })

  it('returns success when update succeeds', async () => {
    const result = await updateSuggestionSeen(suggestionId, userId)
    expect(result).toEqual({ success: true })
  })

  it('returns success when suggestion is already seen (no rows matched)', async () => {
    // When seen is already true, the .eq('seen', false) filter means no rows match,
    // but Supabase still returns no error — it just updates 0 rows
    const result = await updateSuggestionSeen(suggestionId, userId)
    expect(result).toEqual({ success: true })
  })

  it('returns error on database failure', async () => {
    // Override the last eq to return an error
    const thirdEq = vi.fn().mockResolvedValue({ error: { message: 'DB error' } })
    const secondEq = vi.fn().mockReturnValue({ eq: thirdEq })
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq })
    mockUpdate.mockReturnValue({ eq: firstEq })
    mockFrom.mockReturnValue({ update: mockUpdate })

    const result = await updateSuggestionSeen(suggestionId, userId)
    expect(result).toEqual({ success: false, error: 'Failed to update suggestion' })
  })
})
