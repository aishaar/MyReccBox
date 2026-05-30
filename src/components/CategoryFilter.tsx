'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Category } from '@/types'

interface CategoryFilterProps {
  categories: Category[]
  activeCategory: Category | 'all'
}

export default function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const options: (Category | 'all')[] = ['all', ...categories]

  function handleFilterChange(category: Category | 'all') {
    const params = new URLSearchParams(searchParams.toString())

    if (category === 'all') {
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
      {options.map((category) => {
        const isActive = category === activeCategory
        return (
          <button
            key={category}
            onClick={() => handleFilterChange(category)}
            aria-pressed={isActive}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-flame-500 text-white'
                : 'bg-cocoa-800 text-orange-200 hover:bg-cocoa-700'
            }`}
          >
            {category === 'all' ? 'All' : category}
          </button>
        )
      })}
    </nav>
  )
}
