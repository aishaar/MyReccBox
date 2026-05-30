'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateEmail } from '@/lib/utils/validateEmail'

function LoginFields() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setValidationError(null)
    setServerError(null)

    const emailError = validateEmail(email)
    if (emailError) {
      setValidationError(emailError)
      return
    }
    if (!password) {
      setValidationError('Please enter your password.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setServerError(error.message)
      } else {
        router.push('/inbox')
        router.refresh()
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-orange-50">Sign in to MyReccBox</h1>
        <p className="mt-2 text-orange-200/80">
          Enter your email and password to view your recommendations.
        </p>
      </div>

      {errorParam && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">
            An error occurred. Please sign in again.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-orange-200"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-cocoa-600 bg-cocoa-800 px-3 py-2 text-orange-50 shadow-sm transition-colors focus:border-flame-500 focus:outline-none focus:ring-1 focus:ring-flame-500 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-orange-200"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-cocoa-600 bg-cocoa-800 px-3 py-2 text-orange-50 shadow-sm transition-colors focus:border-flame-500 focus:outline-none focus:ring-1 focus:ring-flame-500 sm:text-sm"
            placeholder="••••••••"
          />
          {validationError && (
            <p className="mt-1 text-sm text-red-400">{validationError}</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-300">{serverError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center rounded-lg bg-flame-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-flame-600 focus:outline-none focus:ring-2 focus:ring-flame-500 focus:ring-offset-2 focus:ring-offset-cocoa-950 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

export default function LoginForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cocoa-900 to-cocoa-950 px-4">
      <Suspense fallback={
        <div className="w-full max-w-md text-center">
          <p className="text-orange-200/70">Loading...</p>
        </div>
      }>
        <LoginFields />
      </Suspense>
    </div>
  )
}
