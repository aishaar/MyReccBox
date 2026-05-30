import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the supabase middleware utility
vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn(),
}))

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

import { middleware } from '@/middleware'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

describe('Auth Middleware', () => {
  const mockUpdateSession = vi.mocked(updateSession)
  const mockCreateServerClient = vi.mocked(createServerClient)

  beforeEach(() => {
    vi.clearAllMocks()
    // Default: updateSession returns a NextResponse.next()
    mockUpdateSession.mockResolvedValue(NextResponse.next())
  })

  function createRequest(path: string): NextRequest {
    return new NextRequest(new URL(path, 'http://localhost:3000'))
  }

  it('allows non-protected routes to pass through without auth check', async () => {
    const request = createRequest('/')
    const response = await middleware(request)

    expect(mockUpdateSession).toHaveBeenCalledWith(request)
    expect(mockCreateServerClient).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
  })

  it('allows /recommend routes to pass through without auth check', async () => {
    const request = createRequest('/recommend/aisha')
    const response = await middleware(request)

    expect(mockUpdateSession).toHaveBeenCalledWith(request)
    expect(mockCreateServerClient).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
  })

  it('allows /login route to pass through without auth check', async () => {
    const request = createRequest('/login')
    const response = await middleware(request)

    expect(mockUpdateSession).toHaveBeenCalledWith(request)
    expect(mockCreateServerClient).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
  })

  it('redirects unauthenticated users from /inbox to /login', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } })
    mockCreateServerClient.mockReturnValue({
      auth: { getUser: mockGetUser },
    } as any)

    const request = createRequest('/inbox')
    const response = await middleware(request)

    expect(mockUpdateSession).toHaveBeenCalledWith(request)
    expect(mockCreateServerClient).toHaveBeenCalled()
    expect(mockGetUser).toHaveBeenCalled()
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/login')
  })

  it('allows authenticated users to access /inbox', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })
    mockCreateServerClient.mockReturnValue({
      auth: { getUser: mockGetUser },
    } as any)

    const request = createRequest('/inbox')
    const response = await middleware(request)

    expect(mockUpdateSession).toHaveBeenCalledWith(request)
    expect(mockCreateServerClient).toHaveBeenCalled()
    expect(mockGetUser).toHaveBeenCalled()
    expect(response.status).toBe(200)
  })

  it('protects /inbox sub-paths', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } })
    mockCreateServerClient.mockReturnValue({
      auth: { getUser: mockGetUser },
    } as any)

    const request = createRequest('/inbox?page=2&category=Book')
    const response = await middleware(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/login')
  })
})
