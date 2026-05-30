import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSuggestions, getUnreadCount } from '@/lib/data/suggestions'
import { markSuggestionSeen } from './actions'
import type { Category } from '@/types'
import LogoutButton from '@/components/LogoutButton'
import ShareLinkButton from '@/components/ShareLinkButton'
import CategoryFilter from '@/components/CategoryFilter'
import InboxSuggestionList from '@/components/InboxSuggestionList'
import InboxHeading from '@/components/InboxHeading'
import Pagination from '@/components/Pagination'
import { UnreadProvider } from '@/components/UnreadContext'

const VALID_CATEGORIES: Category[] = ['Book', 'Movie', 'Show', 'Restaurant', 'Other']
const PAGE_SIZE = 20
const SHARE_URL = 'https://my-recc-box.vercel.app/recommend/aisha'

interface InboxPageProps {
  searchParams: { category?: string; page?: string }
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/user')
  }

  // Validate category param
  const categoryParam = searchParams.category
  const category: Category | undefined =
    categoryParam && VALID_CATEGORIES.includes(categoryParam as Category)
      ? (categoryParam as Category)
      : undefined

  // Validate page param
  const pageParam = parseInt(searchParams.page ?? '1', 10)
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1

  const activeFilter: Category | 'all' = category ?? 'all'

  const [{ data: suggestions, totalPages }, unreadCount] = await Promise.all([
    getSuggestions({
      userId: user.id,
      category,
      page,
      pageSize: PAGE_SIZE,
    }),
    getUnreadCount(user.id),
  ])

  return (
    <main className="min-h-screen bg-cocoa-950 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <UnreadProvider initialUnread={unreadCount}>
          <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <InboxHeading />
            <div className="flex items-center gap-3">
              <ShareLinkButton url={SHARE_URL} />
              <LogoutButton />
            </div>
          </header>

          <CategoryFilter
            categories={VALID_CATEGORIES}
            activeCategory={activeFilter}
          />

          {suggestions.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-orange-200/70">
                {category
                  ? `No suggestions found for "${category}".`
                  : 'No suggestions yet. Share your link with friends to start receiving recommendations!'}
              </p>
            </div>
          ) : (
            <>
              <InboxSuggestionList
                suggestions={suggestions}
                markSeen={markSuggestionSeen}
              />

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination currentPage={page} totalPages={totalPages} />
                </div>
              )}
            </>
          )}
        </UnreadProvider>
      </div>
    </main>
  )
}
