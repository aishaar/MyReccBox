'use client'

import { useState } from 'react'
import type { Suggestion } from '@/types'
import { truncateNotes } from '@/lib/utils/truncate'
import { relativeTime } from '@/lib/utils/time'
import { getCategoryBadgeClasses } from '@/lib/utils/categoryStyles'

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
      className={`cursor-pointer rounded-xl border border-cocoa-700 bg-cocoa-850 p-5 shadow-sm transition-all hover:bg-cocoa-800 hover:shadow-md ${
        optimisticSeen
          ? 'opacity-60'
          : 'border-l-4 border-l-flame-500 opacity-100'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${getCategoryBadgeClasses(
                category
              )}`}
            >
              {category}
            </span>
            <span className="text-xs text-orange-200/50">{relativeTime(created_at)}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-orange-50">{title}</h3>
          <p className="mt-0.5 text-sm text-orange-200/60">
            from <span className="font-semibold text-orange-100">{name}</span>
          </p>
          {notes && (
            <p className="mt-2 text-sm leading-relaxed text-orange-200/80">
              {truncateNotes(notes, 200)}
            </p>
          )}
        </div>
      </div>
      {error && (
        <div className="mt-2 rounded border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-300" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
