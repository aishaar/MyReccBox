'use server'

import { createClient } from '@/lib/supabase/server'
import { updateSuggestionSeen } from '@/lib/data/suggestions'
import type { ActionResult } from '@/types'

export async function markSuggestionSeen(suggestionId: string): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  return updateSuggestionSeen(suggestionId, user.id)
}
