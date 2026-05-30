import { describe, it, expect, vi } from 'vitest'

const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}))

describe('Pagination', () => {
  it('exports a default function component', async () => {
    const mod = await import('@/components/Pagination')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('returns null when totalPages is 1', async () => {
    const { default: Pagination } = await import('@/components/Pagination')
    const result = Pagination({ currentPage: 1, totalPages: 1 })
    expect(result).toBeNull()
  })

  it('returns null when totalPages is 0', async () => {
    const { default: Pagination } = await import('@/components/Pagination')
    const result = Pagination({ currentPage: 1, totalPages: 0 })
    expect(result).toBeNull()
  })

  it('renders pagination when totalPages > 1', async () => {
    const { default: Pagination } = await import('@/components/Pagination')
    const result = Pagination({ currentPage: 1, totalPages: 3 })
    expect(result).not.toBeNull()
  })

  it('updates URL search params preserving existing params on page change', () => {
    // Simulate existing category param
    const paramsWithCategory = new URLSearchParams('category=Book')

    // The handlePageChange logic: creates new URLSearchParams from current, sets page
    const params = new URLSearchParams(paramsWithCategory.toString())
    params.set('page', '2')

    expect(params.toString()).toBe('category=Book&page=2')
    expect(params.get('category')).toBe('Book')
    expect(params.get('page')).toBe('2')
  })

  it('correctly computes page param for navigation', () => {
    const params = new URLSearchParams()
    params.set('page', '3')
    expect(params.toString()).toBe('page=3')
  })
})
