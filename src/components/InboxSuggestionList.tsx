'use client'

import type { Suggestion, ActionResult } from '@/types'
import SuggestionCard from './SuggestionCard'
import { useUnread } from './UnreadContext'

interface InboxSuggestionListProps {
  suggestions: Suggestion[]
  markSeen: (id: string) => Promise<ActionResult>
}

export default function InboxSuggestionList({ suggestions, markSeen }: InboxSuggestionListProps) {
  const { decrementUnread, incrementUnread } = useUnread()

  async function handleMarkSeen(id: string): Promise<void> {
    // The card only calls this for previously-unread suggestions, so each
    // call corresponds to exactly one unread -> seen transition.
    decrementUnread()
    try {
      const result = await markSeen(id)
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to mark as seen')
      }
    } catch (err) {
      incrementUnread()
      throw err
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
