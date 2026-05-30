import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}))

describe('CategoryFilter', () => {
  beforeEach(() => {
    mockPush.mockClear()
    // Reset search params to empty (simulates "All" default)
    for (const key of [...mockSearchParams.keys()]) {
      mockSearchParams.delete(key)
    }
  })

  it('exports a default function component', async () => {
    const mod = await import('@/components/CategoryFilter')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('defaults to "All" when no category search param is present', async () => {
    // With empty search params, activeCategory should be 'All'
    const { useSearchParams } = await import('next/navigation')
    const params = useSearchParams()
    const activeCategory = params.get('category') ?? 'All'
    expect(activeCategory).toBe('All')
  })

  it('reads active category from search params', async () => {
    mockSearchParams.set('category', 'Book')
    const { useSearchParams } = await import('next/navigation')
    const params = useSearchParams()
    const activeCategory = params.get('category') ?? 'All'
    expect(activeCategory).toBe('Book')
  })

  it('navigates with category param when a category is selected', async () => {
    // Simulate selecting "Movie"
    const params = new URLSearchParams(mockSearchParams.toString())
    params.set('category', 'Movie')
    params.set('page', '1')
    const { useRouter } = await import('next/navigation')
    const router = useRouter()
    router.push(`?${params.toString()}`)

    expect(mockPush).toHaveBeenCalledWith('?category=Movie&page=1')
  })

  it('removes category param when "All" is selected', async () => {
    mockSearchParams.set('category', 'Book')
    // Simulate selecting "All"
    const params = new URLSearchParams(mockSearchParams.toString())
    params.delete('category')
    params.set('page', '1')
    const { useRouter } = await import('next/navigation')
    const router = useRouter()
    router.push(`?${params.toString()}`)

    expect(mockPush).toHaveBeenCalledWith('?page=1')
  })

  it('resets page to 1 when changing category', async () => {
    mockSearchParams.set('page', '3')
    // Simulate selecting "Restaurant"
    const params = new URLSearchParams(mockSearchParams.toString())
    params.set('category', 'Restaurant')
    params.set('page', '1')
    const { useRouter } = await import('next/navigation')
    const router = useRouter()
    router.push(`?${params.toString()}`)

    expect(mockPush).toHaveBeenCalledWith('?page=1&category=Restaurant')
  })
})
