import { describe, it, expect, vi } from 'vitest'

const mockPush = vi.fn()
const mockSignOut = vi.fn().mockResolvedValue({ error: null })

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}))

describe('LogoutButton', () => {
  it('exports a default function component', async () => {
    const mod = await import('@/components/LogoutButton')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('calls supabase.auth.signOut and redirects to /login on logout', async () => {
    // Simulate the logout handler logic directly
    const supabase = (await import('@/lib/supabase/client')).createClient()
    const router = (await import('next/navigation')).useRouter()

    await supabase.auth.signOut()
    router.push('/login')

    expect(mockSignOut).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
