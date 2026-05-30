'use client'

import { useUnread } from './UnreadContext'

export default function InboxHeading() {
  const { unreadCount } = useUnread()

  return (
    <h1 className="text-2xl font-bold text-orange-50">
      Recommendations Received
      {unreadCount > 0 && (
        <span className="text-flame-400"> ({unreadCount} unread)</span>
      )}
    </h1>
  )
}
