import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NewSuggestion } from '@/types'

// Mock the Supabase server client
const mockInsert = vi.fn()
const mockFrom = vi.fn(() => ({ insert: mockInsert }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

import { createSuggestion } from '@/lib/data/suggestions'

describe('createSuggestion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
  })

  const validSuggestion: NewSuggestion = {
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Alice',
    category: 'Book',
    title: 'The Great Gatsby',
    notes: 'A classic novel',
  }

  describe('validation', () => {
    it('rejects empty name', async () => {
      const result = await createSuggestion({ ...validSuggestion, name: '' })
      expect(result).toEqual({ success: false, error: 'Name is required' })
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('rejects whitespace-only name', async () => {
      const result = await createSuggestion({ ...validSuggestion, name: '   ' })
      expect(result).toEqual({ success: false, error: 'Name is required' })
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('rejects name over 100 characters', async () => {
      const result = await createSuggestion({ ...validSuggestion, name: 'a'.repeat(101) })
      expect(result).toEqual({ success: false, error: 'Name must be 100 characters or less' })
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('rejects invalid category', async () => {
      const result = await createSuggestion({ ...validSuggestion, category: 'Invalid' as any })
      expect(result).toEqual({ success: false, error: 'Invalid category provided' })
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('rejects empty title', async () => {
      const result = await createSuggestion({ ...validSuggestion, title: '' })
      expect(result).toEqual({ success: false, error: 'Title is required' })
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('rejects whitespace-only title', async () => {
      const result = await createSuggestion({ ...validSuggestion, title: '   ' })
      expect(result).toEqual({ success: false, error: 'Title is required' })
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('rejects title over 200 characters', async () => {
      const result = await createSuggestion({ ...validSuggestion, title: 'a'.repeat(201) })
      expect(result).toEqual({ success: false, error: 'Title must be 200 characters or less' })
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('rejects notes over 500 characters', async () => {
      const result = await createSuggestion({ ...validSuggestion, notes: 'a'.repeat(501) })
      expect(result).toEqual({ success: false, error: 'Notes must be 500 characters or less' })
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('accepts name at exactly 100 characters', async () => {
      const result = await createSuggestion({ ...validSuggestion, name: 'a'.repeat(100) })
      expect(result).toEqual({ success: true })
    })

    it('accepts title at exactly 200 characters', async () => {
      const result = await createSuggestion({ ...validSuggestion, title: 'a'.repeat(200) })
      expect(result).toEqual({ success: true })
    })

    it('accepts notes at exactly 500 characters', async () => {
      const result = await createSuggestion({ ...validSuggestion, notes: 'a'.repeat(500) })
      expect(result).toEqual({ success: true })
    })

    it('accepts undefined notes', async () => {
      const { notes, ...withoutNotes } = validSuggestion
      const result = await createSuggestion(withoutNotes as NewSuggestion)
      expect(result).toEqual({ success: true })
    })
  })

  describe('database insertion', () => {
    it('inserts valid suggestion into suggestions table', async () => {
      const result = await createSuggestion(validSuggestion)

      expect(result).toEqual({ success: true })
      expect(mockFrom).toHaveBeenCalledWith('suggestions')
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: validSuggestion.user_id,
        name: validSuggestion.name,
        category: validSuggestion.category,
        title: validSuggestion.title,
        notes: validSuggestion.notes,
      })
    })

    it('passes null for undefined notes', async () => {
      const { notes, ...withoutNotes } = validSuggestion
      await createSuggestion(withoutNotes as NewSuggestion)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ notes: null })
      )
    })

    it('returns error on database failure', async () => {
      mockInsert.mockResolvedValue({ error: { message: 'DB error' } })

      const result = await createSuggestion(validSuggestion)
      expect(result).toEqual({ success: false, error: 'Failed to save suggestion' })
    })
  })
})
