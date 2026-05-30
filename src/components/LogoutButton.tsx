'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/user')
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-cocoa-700 bg-cocoa-800 px-4 py-2 text-sm font-medium text-orange-200 transition-colors hover:bg-cocoa-700"
    >
      Logout
    </button>
  )
}
