'use client'

import { useState, useRef, useEffect } from 'react'

interface ShareLinkButtonProps {
  url: string
}

export default function ShareLinkButton({ url }: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  // Clear any pending timer if the component unmounts mid-countdown.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fall back.
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    setCopied(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className="rounded-lg bg-flame-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-flame-600 focus:outline-none focus:ring-2 focus:ring-flame-500 focus:ring-offset-2 focus:ring-offset-cocoa-950"
    >
      {copied ? 'Copied!' : 'Share your link'}
    </button>
  )
}
