import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/LoginForm'

export default async function UserPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Already signed in? Go straight to the recommendations inbox.
  if (user) {
    redirect('/inbox')
  }

  // Not signed in: show the email + password login page.
  return <LoginForm />
}
