import type { Category } from '@/types'

/**
 * Tailwind classes for a category badge (soft background + readable text).
 * Used by inbox cards and anywhere a category needs a colored chip.
 */
export const categoryBadgeClasses: Record<Category, string> = {
  Book: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/25',
  Movie: 'bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-500/25',
  Show: 'bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/25',
  Restaurant: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/25',
  Other: 'bg-orange-500/15 text-orange-300 ring-1 ring-inset ring-orange-500/25',
}

export function getCategoryBadgeClasses(category: Category): string {
  return categoryBadgeClasses[category] ?? categoryBadgeClasses.Other
}
