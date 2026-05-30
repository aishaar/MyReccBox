import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock createSuggestion
const mockCreateSuggestion = vi.fn()

vi.mock('@/lib/data/suggestions', () => ({
  createSuggestion: (...args: any[]) => mockCreateSuggestion(...args),
}))

import { submitSuggestion } from '@/app/recommend/[username]/actions'

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value)
  }
  return fd
}

describe('submitSuggestion Server Action', () => {
  const validFields = {
    name: 'Alice',
    category: 'Book',
    title: 'The Great Gatsby',
    notes: 'A classic novel',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateSuggestion.mockResolvedValue({ success: true })
  })

  describe('validation', () => {
    it('rejects empty name', async () => {
      const result = await submitSuggestion(makeFormData({ ...validFields, name: '' }))
      expect(result).toEqual({ success: false, error: 'Name is required' })
      expect(mockCreateSuggestion).not.toHaveBeenCalled()
    })

    it('rejects whitespace-only name', async () => {
      const result = await submitSuggestion(makeFormData({ ...validFields, name: '   ' }))
      expect(result).toEqual({ success: false, error: 'Name is required' })
      expect(mockCreateSuggestion).not.toHaveBeenCalled()
    })

    it('rejects name over 100 characters', async () => {
      const result = await submitSuggestion(makeFormData({ ...validFields, name: 'a'.repeat(101) }))
      expect(result).toEqual({ success: false, error: 'Name must be 100 characters or less' })
      expect(mockCreateSuggestion).not.toHaveBeenCalled()
    })

    it('rejects invalid category', async () => {
      const result = await submitSuggestion(makeFormData({ ...validFields, category: 'Invalid' }))
      expect(result).toEqual({ success: false, error: 'Invalid category provided' })
      expect(mockCreateSuggestion).not.toHaveBeenCalled()
    })

    it('rejects empty category', async () => {
      const result = await submitSuggestion(makeFormData({ ...validFields, category: '' }))
      expect(result).toEqual({ success: false, error: 'Invalid category provided' })
      expect(mockCreateSuggestion).not.toHaveBeenCalled()
    })

    it('rejects empty title', async () => {
      const result = await submitSuggestion(makeFormData({ ...validFields, title: '' }))
      expect(result).toEqual({ success: false, error: 'Title is required' })
      expect(mockCreateSuggestion).not.toHaveBeenCalled()
    })

    it('rejects whitespace-only title', async () => {
      const result = await submitSuggestion(makeFormData({ ...validFields, title: '   ' }))
      expect(result).toEqual({ success: false, error: 'Title is required' })
      expect(mockCreateSuggestion).not.toHaveBeenCalled()
    })

    it('rejects title over 200 characters', async () => {
      const result = await submitSuggestion(makeFormData({ ...validFields, title: 'a'.repeat(201) }))
      expect(result).toEqual({ success: false, error: 'Title must be 200 characters or less' })
      expect(mockCreateSuggestion).not.toHaveBeenCalled()
    })

    it('rejects notes over 500 characters', async () => {
      const result = await submitSuggestion(makeFormData({ ...validFields, notes: 'a'.repeat(501) }))
      expect(result).toEqual({ success: false, error: 'Notes must be 500 characters or less' })
      expect(mockCreateSuggestion).not.toHaveBeenCalled()
    })

    it('rejects missing user_id', async () => {
      const { user_id, ...noUserId } = validFields
      const result = await submitSuggestion(makeFormData(noUserId))
      expect(result).toEqual({ success: false, error: 'Invalid submission target' })
      expect(mockCreateSuggestion).not.toHaveBeenCalled()
    })
  })

  describe('successful submission', () => {
    it('calls createSuggestion with validated data', async () => {
      const result = await submitSuggestion(makeFormData(validFields))

      expect(result).toEqual({ success: true })
      expect(mockCreateSuggestion).toHaveBeenCalledWith({
        user_id: validFields.user_id,
        name: 'Alice',
        category: 'Book',
        title: 'The Great Gatsby',
        notes: 'A classic novel',
      })
    })

    it('passes undefined notes when notes field is empty', async () => {
      const result = await submitSuggestion(makeFormData({ ...validFields, notes: '' }))

      expect(result).toEqual({ success: true })
      expect(mockCreateSuggestion).toHaveBeenCalledWith(
        expect.objectContaining({ notes: undefined })
      )
    })

    it('accepts all valid categories', async () => {
      for (const category of ['Book', 'Movie', 'Show', 'Restaurant', 'Other']) {
        mockCreateSuggestion.mockResolvedValue({ success: true })
        const result = await submitSuggestion(makeFormData({ ...validFields, category }))
        expect(result).toEqual({ success: true })
      }
    })

    it('accepts name at exactly 100 characters', async () => {
      const result = await submitSuggestion(makeFormData({ ...validFields, name: 'a'.repeat(100) }))
      expect(result).toEqual({ success: true })
    })

    it('accepts title at exactly 200 characters', async () => {
      const result = await submitSuggestion(makeFormData({ ...validFields, title: 'a'.repeat(200) }))
      expect(result).toEqual({ success: true })
    })

    it('accepts notes at exactly 500 characters', async () => {
      const result = await submitSuggestion(makeFormData({ ...validFields, notes: 'a'.repeat(500) }))
      expect(result).toEqual({ success: true })
    })
  })

  describe('error propagation', () => {
    it('returns error from createSuggestion', async () => {
      mockCreateSuggestion.mockResolvedValue({ success: false, error: 'Failed to save suggestion' })

      const result = await submitSuggestion(makeFormData(validFields))
      expect(result).toEqual({ success: false, error: 'Failed to save suggestion' })
    })
  })
})
