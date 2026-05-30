'use client'

import { useState } from 'react'
import type { Suggestion } from '@/types'
import { truncateNotes } from '@/lib/utils/truncate'
import { relativeTime } from '@/lib/utils/time'

interface SuggestionCardProps {
  suggestion: Suggestion
  onMarkSeen?: (id: string) => Promise<void>
}

export default function SuggestionCard({ suggestion, onMarkSeen }: SuggestionCardProps) {
  const { id, name, category, title, notes, seen, created_at } = suggestion

  const [optimisticSeen, setOptimisticSeen] = useState(seen)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    // Req 3.3: Skip network call if already seen
    if (optimisticSeen) {
      return
    }

    // Optimistically set seen to true
    setOptimisticSeen(true)
    setError(null)

    try {
      if (onMarkSeen) {
        await onMarkSeen(id)
      }
    } catch {
      // Req 3.4: Revert visual state and show error on failure
      setOptimisticSeen(false)
      setError('Failed to mark as seen. Please try again.')
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      className={`cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-opacity ${
        optimisticSeen ? 'opacity-60' : 'opacity-100'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
              {category}
            </span>
            <span className="text-xs text-gray-500">{relativeTime(created_at)}</span>
          </div>
          <h3 className="mt-1 text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-0.5 text-sm text-gray-600">from {name}</p>
          {notes && (
            <p className="mt-2 text-sm text-gray-700">
              {truncateNotes(notes, 200)}
            </p>
          )}
        </div>
      </div>
      {error && (
        <div className="mt-2 rounded bg-red-50 px-3 py-1.5 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
