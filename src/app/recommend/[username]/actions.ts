'use server'

import { createSuggestion } from '@/lib/data/suggestions'
import type { ActionResult, Category } from '@/types'

const VALID_CATEGORIES: Category[] = ['Book', 'Movie', 'Show', 'Restaurant', 'Other']

export async function submitSuggestion(formData: FormData): Promise<ActionResult> {
  const name = formData.get('name')?.toString().trim() ?? ''
  const category = formData.get('category')?.toString() ?? ''
  const title = formData.get('title')?.toString().trim() ?? ''
  const notes = formData.get('notes')?.toString().trim() ?? ''
  const userId = formData.get('user_id')?.toString() ?? ''

  // Validate name
  if (!name) {
    return { success: false, error: 'Name is required' }
  }
  if (name.length > 100) {
    return { success: false, error: 'Name must be 100 characters or less' }
  }

  // Validate category
  if (!VALID_CATEGORIES.includes(category as Category)) {
    return { success: false, error: 'Invalid category provided' }
  }

  // Validate title
  if (!title) {
    return { success: false, error: 'Title is required' }
  }
  if (title.length > 200) {
    return { success: false, error: 'Title must be 200 characters or less' }
  }

  // Validate notes (optional but max 500)
  if (notes.length > 500) {
    return { success: false, error: 'Notes must be 500 characters or less' }
  }

  // Validate user_id
  if (!userId) {
    return { success: false, error: 'Invalid submission target' }
  }

  return createSuggestion({
    user_id: userId,
    name,
    category: category as Category,
    title,
    notes: notes || undefined,
  })
}
