'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Category } from '@/types'

const CATEGORIES: (Category | 'All')[] = ['All', 'Book', 'Movie', 'Show', 'Restaurant', 'Other']

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get('category') ?? 'All'

  function handleFilterChange(category: Category | 'All') {
    const params = new URLSearchParams(searchParams.toString())

    if (category === 'All') {
      params.delete('category')
    } else {
      params.set('category', category)
    }

    // Reset to page 1 when changing category
    params.set('page', '1')

    router.push(`?${params.toString()}`)
  }

  return (
    <nav aria-label="Category filter" className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => {
        const isActive = category === activeCategory
        return (
          <button
            key={category}
            onClick={() => handleFilterChange(category)}
            aria-pressed={isActive}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        )
      })}
    </nav>
  )
}
