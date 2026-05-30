import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSuggestions } from '@/lib/data/suggestions'
import { markSuggestionSeen } from './actions'
import type { Category } from '@/types'
import LogoutButton from '@/components/LogoutButton'
import CategoryFilter from '@/components/CategoryFilter'
import InboxSuggestionList from '@/components/InboxSuggestionList'
import Pagination from '@/components/Pagination'

const VALID_CATEGORIES: Category[] = ['Book', 'Movie', 'Show', 'Restaurant', 'Other']
const PAGE_SIZE = 20

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

  const { data: suggestions, total, totalPages } = await getSuggestions({
    userId: user.id,
    category,
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Recommendations Received</h1>
          <LogoutButton />
        </header>

        <CategoryFilter
          categories={VALID_CATEGORIES}
          activeCategory={activeFilter}
        />

        {suggestions.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-gray-500">
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
      </div>
    </main>
  )
}
