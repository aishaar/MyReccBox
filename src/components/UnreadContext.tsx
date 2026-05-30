'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface UnreadContextValue {
  unreadCount: number
  decrementUnread: () => void
  incrementUnread: () => void
}

const UnreadContext = createContext<UnreadContextValue | null>(null)

interface UnreadProviderProps {
  initialUnread: number
  children: React.ReactNode
}

export function UnreadProvider({ initialUnread, children }: UnreadProviderProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnread)

  // Re-sync to the server truth whenever the page re-fetches (navigation,
  // filtering, pagination). Optimistic deltas between fetches are preserved.
  useEffect(() => {
    setUnreadCount(initialUnread)
  }, [initialUnread])

  const decrementUnread = () => setUnreadCount((c) => Math.max(0, c - 1))
  const incrementUnread = () => setUnreadCount((c) => c + 1)

  return (
    <UnreadContext.Provider value={{ unreadCount, decrementUnread, incrementUnread }}>
      {children}
    </UnreadContext.Provider>
  )
}

export function useUnread(): UnreadContextValue {
  const context = useContext(UnreadContext)
  if (!context) {
    throw new Error('useUnread must be used within an UnreadProvider')
  }
  return context
}
