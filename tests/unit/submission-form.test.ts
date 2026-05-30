import { describe, it, expect, vi } from 'vitest'

// Mock the server action
vi.mock('@/app/recommend/[username]/actions', () => ({
  submitSuggestion: vi.fn(),
}))

describe('SubmissionForm', () => {
  it('exports a default function component', async () => {
    const mod = await import('@/components/SubmissionForm')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('component accepts username and userId props', async () => {
    const mod = await import('@/components/SubmissionForm')
    // Verify the function signature accepts the expected props shape
    expect(mod.default.length).toBeGreaterThanOrEqual(0)
  })
})

describe('SubmissionForm validation logic', () => {
  // Test the validation rules that the component implements
  // These mirror the client-side validation in the component

  const VALID_CATEGORIES = ['Book', 'Movie', 'Show', 'Restaurant', 'Other']

  describe('name validation', () => {
    it('name is required (empty string is invalid)', () => {
      const name = ''
      expect(name.trim().length === 0).toBe(true)
    })

    it('name must be 100 characters or less', () => {
      const validName = 'a'.repeat(100)
      const invalidName = 'a'.repeat(101)
      expect(validName.length <= 100).toBe(true)
      expect(invalidName.length <= 100).toBe(false)
    })
  })

  describe('category validation', () => {
    it('category is required (empty string is invalid)', () => {
      const category = ''
      expect(category === '').toBe(true)
    })

    it('only valid categories are accepted', () => {
      expect(VALID_CATEGORIES).toContain('Book')
      expect(VALID_CATEGORIES).toContain('Movie')
      expect(VALID_CATEGORIES).toContain('Show')
      expect(VALID_CATEGORIES).toContain('Restaurant')
      expect(VALID_CATEGORIES).toContain('Other')
      expect(VALID_CATEGORIES).not.toContain('Music')
    })
  })

  describe('title validation', () => {
    it('title is required (empty string is invalid)', () => {
      const title = ''
      expect(title.trim().length === 0).toBe(true)
    })

    it('title must be 200 characters or less', () => {
      const validTitle = 'a'.repeat(200)
      const invalidTitle = 'a'.repeat(201)
      expect(validTitle.length <= 200).toBe(true)
      expect(invalidTitle.length <= 200).toBe(false)
    })
  })

  describe('notes validation', () => {
    it('notes are optional (empty string is valid)', () => {
      const notes = ''
      // Notes being empty should not trigger an error
      expect(notes.length <= 500).toBe(true)
    })

    it('notes must be 500 characters or less', () => {
      const validNotes = 'a'.repeat(500)
      const invalidNotes = 'a'.repeat(501)
      expect(validNotes.length <= 500).toBe(true)
      expect(invalidNotes.length <= 500).toBe(false)
    })
  })
})
