'use client'

import type { Suggestion, ActionResult } from '@/types'
import SuggestionCard from './SuggestionCard'

interface InboxSuggestionListProps {
  suggestions: Suggestion[]
  markSeen: (id: string) => Promise<ActionResult>
}

export default function InboxSuggestionList({ suggestions, markSeen }: InboxSuggestionListProps) {
  async function handleMarkSeen(id: string): Promise<void> {
    const result = await markSeen(id)
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to mark as seen')
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {suggestions.map((suggestion) => (
        <SuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onMarkSeen={handleMarkSeen}
        />
      ))}
    </div>
  )
}
