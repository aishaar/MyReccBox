import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Supabase server client
const mockSingle = vi.fn()
const mockEq = vi.fn(() => ({ single: mockSingle }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

import { resolveUsername } from '@/lib/data/profiles'

describe('resolveUsername', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
  })

  it('returns the user id when username exists', async () => {
    const mockId = '123e4567-e89b-12d3-a456-426614174000'
    mockSingle.mockResolvedValue({ data: { id: mockId }, error: null })

    const result = await resolveUsername('aisha')

    expect(result).toBe(mockId)
    expect(mockFrom).toHaveBeenCalledWith('profiles')
    expect(mockSelect).toHaveBeenCalledWith('id')
    expect(mockEq).toHaveBeenCalledWith('username', 'aisha')
  })

  it('returns null when username does not exist', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'No rows found' } })

    const result = await resolveUsername('nonexistent')

    expect(result).toBeNull()
  })

  it('returns null when a database error occurs', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Connection error' } })

    const result = await resolveUsername('aisha')

    expect(result).toBeNull()
  })

  it('returns null when data is null even without error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null })

    const result = await resolveUsername('unknown')

    expect(result).toBeNull()
  })
})
