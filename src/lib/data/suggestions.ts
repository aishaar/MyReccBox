import { createClient } from '@/lib/supabase/server'
import type { NewSuggestion, ActionResult, Category, Suggestion, PaginatedResult } from '@/types'

const VALID_CATEGORIES: Category[] = ['Book', 'Movie', 'Show', 'Restaurant', 'Other']

/**
 * Validates suggestion data before insertion.
 * Returns an error message if validation fails, or null if valid.
 */
function validateSuggestion(data: NewSuggestion): string | null {
  if (!data.name || data.name.trim().length === 0) {
    return 'Name is required'
  }
  if (data.name.length > 100) {
    return 'Name must be 100 characters or less'
  }

  if (!VALID_CATEGORIES.includes(data.category)) {
    return 'Invalid category provided'
  }

  if (!data.title || data.title.trim().length === 0) {
    return 'Title is required'
  }
  if (data.title.length > 200) {
    return 'Title must be 200 characters or less'
  }

  if (data.notes !== undefined && data.notes !== null && data.notes.length > 500) {
    return 'Notes must be 500 characters or less'
  }

  return null
}

/**
 * Creates a new suggestion in the database after server-side validation.
 * Returns { success: true } on success, or { success: false, error: "..." } on failure.
 */
export async function createSuggestion(data: NewSuggestion): Promise<ActionResult> {
  const validationError = validateSuggestion(data)
  if (validationError) {
    return { success: false, error: validationError }
  }

  const supabase = createClient()

  const { error } = await supabase.from('suggestions').insert({
    user_id: data.user_id,
    name: data.name,
    category: data.category,
    title: data.title,
    notes: data.notes ?? null,
  })

  if (error) {
    return { success: false, error: 'Failed to save suggestion' }
  }

  return { success: true }
}

/**
 * Fetches paginated suggestions for a user, with optional category filter.
 * Results are ordered by created_at descending (newest first).
 */
export async function getSuggestions(params: {
  userId: string
  category?: Category
  page: number
  pageSize: number
}): Promise<PaginatedResult<Suggestion>> {
  const { userId, category, page, pageSize } = params
  const offset = (page - 1) * pageSize

  const supabase = createClient()

  let query = supabase
    .from('suggestions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (category) {
    query = query.eq('category', category)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) {
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const total = count ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: (data as Suggestion[]) ?? [],
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Counts how many of a user's suggestions are unread (seen = false).
 * Not filtered by category — represents the whole inbox.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('suggestions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('seen', false)

  if (error) {
    return 0
  }

  return count ?? 0
}

/**
 * Updates a suggestion's seen status to true, only if it is currently false.
 * This makes the operation idempotent at the database level — if the suggestion
 * is already seen, no update is performed and success is still returned.
 * The userId filter ensures only the owner can update their own suggestions.
 */
export async function updateSuggestionSeen(id: string, userId: string): Promise<ActionResult> {
  const supabase = createClient()

  const { error } = await supabase
    .from('suggestions')
    .update({ seen: true })
    .eq('id', id)
    .eq('user_id', userId)
    .eq('seen', false)

  if (error) {
    return { success: false, error: 'Failed to update suggestion' }
  }

  return { success: true }
}
