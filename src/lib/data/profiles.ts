import { createClient } from '@/lib/supabase/server'

/**
 * Resolve a username to a user ID by querying the profiles table.
 * Returns the user's UUID if found, or null if the username doesn't exist or an error occurs.
 */
export async function resolveUsername(username: string): Promise<string | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (error || !data) {
    return null
  }

  return data.id
}
