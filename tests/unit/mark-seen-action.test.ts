import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock updateSuggestionSeen
const mockUpdateSuggestionSeen = vi.fn()

vi.mock('@/lib/data/suggestions', () => ({
  updateSuggestionSeen: (...args: any[]) => mockUpdateSuggestionSeen(...args),
}))

// Mock Supabase server client with auth
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}))

import { markSuggestionSeen } from '@/app/inbox/actions'

describe('markSuggestionSeen Server Action', () => {
  const userId = '987fcdeb-51a2-43e7-b8c9-123456789abc'
  const suggestionId = '123e4567-e89b-12d3-a456-426614174000'

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: userId } } })
    mockUpdateSuggestionSeen.mockResolvedValue({ success: true })
  })

  describe('authentication', () => {
    it('returns error when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const result = await markSuggestionSeen(suggestionId)

      expect(result).toEqual({ success: false, error: 'Not authenticated' })
      expect(mockUpdateSuggestionSeen).not.toHaveBeenCalled()
    })
  })

  describe('successful mark as seen', () => {
    it('calls updateSuggestionSeen with suggestionId and authenticated userId', async () => {
      const result = await markSuggestionSeen(suggestionId)

      expect(result).toEqual({ success: true })
      expect(mockUpdateSuggestionSeen).toHaveBeenCalledWith(suggestionId, userId)
    })

    it('passes through the ActionResult from updateSuggestionSeen', async () => {
      mockUpdateSuggestionSeen.mockResolvedValue({ success: true })

      const result = await markSuggestionSeen(suggestionId)

      expect(result).toEqual({ success: true })
    })
  })

  describe('error propagation', () => {
    it('returns error from updateSuggestionSeen on database failure', async () => {
      mockUpdateSuggestionSeen.mockResolvedValue({ success: false, error: 'Failed to update suggestion' })

      const result = await markSuggestionSeen(suggestionId)

      expect(result).toEqual({ success: false, error: 'Failed to update suggestion' })
    })
  })
})
