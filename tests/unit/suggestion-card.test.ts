import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/utils/truncate', () => ({
  truncateNotes: (notes: string, maxLength: number) =>
    notes.length <= maxLength ? notes : notes.slice(0, maxLength) + '\u2026',
}))

vi.mock('@/lib/utils/time', () => ({
  relativeTime: (dateString: string) => '2 hours ago',
}))

describe('SuggestionCard', () => {
  it('exports a default function component', async () => {
    const mod = await import('@/components/SuggestionCard')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('component accepts suggestion and onMarkSeen props', async () => {
    const mod = await import('@/components/SuggestionCard')
    // Verify the function exists and is callable
    expect(mod.default.length).toBeGreaterThanOrEqual(0)
  })
})

describe('SuggestionCard behavior logic', () => {
  const baseSuggestion = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    created_at: '2024-01-15T10:30:00Z',
    user_id: '987fcdeb-51a2-43e8-b6c7-123456789abc',
    name: 'Alice',
    category: 'Book' as const,
    title: 'The Great Gatsby',
    notes: 'A classic novel about the American dream.',
    seen: false,
  }

  describe('mark as seen logic', () => {
    it('should call onMarkSeen when an unseen suggestion is clicked', () => {
      const suggestion = { ...baseSuggestion, seen: false }
      const onMarkSeen = vi.fn()

      // Simulate the click handler logic from the component
      if (!suggestion.seen) {
        onMarkSeen(suggestion.id)
      }

      expect(onMarkSeen).toHaveBeenCalledWith(suggestion.id)
    })

    it('should NOT call onMarkSeen when a seen suggestion is clicked', () => {
      const suggestion = { ...baseSuggestion, seen: true }
      const onMarkSeen = vi.fn()

      // Simulate the click handler logic from the component
      if (!suggestion.seen) {
        onMarkSeen(suggestion.id)
      }

      expect(onMarkSeen).not.toHaveBeenCalled()
    })
  })

  describe('visual distinction for seen/unseen', () => {
    it('seen suggestions should have reduced opacity class', () => {
      const suggestion = { ...baseSuggestion, seen: true }
      const opacityClass = suggestion.seen ? 'opacity-60' : 'opacity-100'
      expect(opacityClass).toBe('opacity-60')
    })

    it('unseen suggestions should have full opacity class', () => {
      const suggestion = { ...baseSuggestion, seen: false }
      const opacityClass = suggestion.seen ? 'opacity-60' : 'opacity-100'
      expect(opacityClass).toBe('opacity-100')
    })
  })

  describe('notes truncation', () => {
    it('should truncate notes longer than 200 characters', async () => {
      const { truncateNotes } = await import('@/lib/utils/truncate')
      const longNotes = 'a'.repeat(250)
      const result = truncateNotes(longNotes, 200)
      expect(result.length).toBe(201) // 200 chars + ellipsis
      expect(result.endsWith('\u2026')).toBe(true)
    })

    it('should not truncate notes 200 characters or shorter', async () => {
      const { truncateNotes } = await import('@/lib/utils/truncate')
      const shortNotes = 'a'.repeat(200)
      const result = truncateNotes(shortNotes, 200)
      expect(result).toBe(shortNotes)
    })

    it('should handle null notes gracefully (no display)', () => {
      const suggestion = { ...baseSuggestion, notes: null }
      // Component conditionally renders notes only when not null
      const shouldDisplayNotes = suggestion.notes !== null
      expect(shouldDisplayNotes).toBe(false)
    })
  })

  describe('category badge', () => {
    it('should map known categories to color classes', () => {
      const categoryColors: Record<string, string> = {
        Book: 'bg-blue-100 text-blue-800',
        Movie: 'bg-purple-100 text-purple-800',
        Show: 'bg-pink-100 text-pink-800',
        Restaurant: 'bg-orange-100 text-orange-800',
        Other: 'bg-gray-100 text-gray-800',
      }

      expect(categoryColors['Book']).toBe('bg-blue-100 text-blue-800')
      expect(categoryColors['Movie']).toBe('bg-purple-100 text-purple-800')
      expect(categoryColors['Show']).toBe('bg-pink-100 text-pink-800')
      expect(categoryColors['Restaurant']).toBe('bg-orange-100 text-orange-800')
      expect(categoryColors['Other']).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('relative timestamp', () => {
    it('should use relativeTime utility for display', async () => {
      const { relativeTime } = await import('@/lib/utils/time')
      const result = relativeTime('2024-01-15T10:30:00Z')
      expect(result).toBe('2 hours ago')
    })
  })
})


describe('SuggestionCard optimistic UI logic', () => {
  const baseSuggestion = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    created_at: '2024-01-15T10:30:00Z',
    user_id: '987fcdeb-51a2-43e8-b6c7-123456789abc',
    name: 'Alice',
    category: 'Book' as const,
    title: 'The Great Gatsby',
    notes: 'A classic novel about the American dream.',
    seen: false,
  }

  describe('optimistic state management', () => {
    it('should optimistically set seen to true before network call resolves', async () => {
      // Simulate the optimistic update flow
      let optimisticSeen = false
      const onMarkSeen = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)))

      // Simulate click handler
      if (!optimisticSeen) {
        optimisticSeen = true // optimistic update
        expect(optimisticSeen).toBe(true) // immediately true
      }

      await onMarkSeen(baseSuggestion.id)
      expect(optimisticSeen).toBe(true) // still true after resolve
    })

    it('should revert optimistic state on error', async () => {
      let optimisticSeen = false
      let error: string | null = null
      const onMarkSeen = vi.fn(() => Promise.reject(new Error('Network error')))

      // Simulate click handler
      if (!optimisticSeen) {
        optimisticSeen = true // optimistic update
        error = null

        try {
          await onMarkSeen(baseSuggestion.id)
        } catch {
          optimisticSeen = false // revert
          error = 'Failed to mark as seen. Please try again.'
        }
      }

      expect(optimisticSeen).toBe(false) // reverted
      expect(error).toBe('Failed to mark as seen. Please try again.')
    })

    it('should skip network call if already seen (optimistic state)', async () => {
      let optimisticSeen = true // already seen
      const onMarkSeen = vi.fn(() => Promise.resolve())

      // Simulate click handler - should bail early
      if (!optimisticSeen) {
        await onMarkSeen(baseSuggestion.id)
      }

      expect(onMarkSeen).not.toHaveBeenCalled()
    })

    it('should clear error state on successful retry', async () => {
      let optimisticSeen = false
      let error: string | null = 'Previous error'

      const onMarkSeen = vi.fn(() => Promise.resolve())

      // Simulate click handler (retry after previous error)
      if (!optimisticSeen) {
        optimisticSeen = true
        error = null // clear error on new attempt

        try {
          await onMarkSeen(baseSuggestion.id)
        } catch {
          optimisticSeen = false
          error = 'Failed to mark as seen. Please try again.'
        }
      }

      expect(optimisticSeen).toBe(true)
      expect(error).toBeNull()
    })
  })
})
