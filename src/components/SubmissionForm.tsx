'use client'

import { useState, useRef } from 'react'
import { submitSuggestion } from '@/app/recommend/[username]/actions'
import type { Category } from '@/types'

interface SubmissionFormProps {
  username: string
  userId: string
}

interface ValidationErrors {
  name?: string
  category?: string
  title?: string
  notes?: string
}

const CATEGORIES: Category[] = ['Book', 'Movie', 'Show', 'Restaurant', 'Other']

export default function SubmissionForm({ username, userId }: SubmissionFormProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [category, setCategory] = useState<Category | ''>('')
  const formRef = useRef<HTMLFormElement>(null)

  function validate(formData: FormData): ValidationErrors {
    const validationErrors: ValidationErrors = {}

    const name = formData.get('name')?.toString().trim() ?? ''
    const category = formData.get('category')?.toString() ?? ''
    const title = formData.get('title')?.toString().trim() ?? ''
    const notes = formData.get('notes')?.toString().trim() ?? ''

    if (!name) {
      validationErrors.name = 'Your Name is required'
    } else if (name.length > 100) {
      validationErrors.name = 'Name must be 100 characters or less'
    }

    if (!category) {
      validationErrors.category = 'Category is required'
    }

    if (!title) {
      validationErrors.title = 'Title is required'
    } else if (title.length > 200) {
      validationErrors.title = 'Title must be 200 characters or less'
    }

    if (notes.length > 500) {
      validationErrors.notes = 'Notes must be 500 characters or less'
    }

    return validationErrors
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setServerError(null)

    const formData = new FormData(event.currentTarget)
    const validationErrors = validate(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const result = await submitSuggestion(formData)

      if (result.success) {
        setServerError(null)
        formRef.current?.reset()
        setCategory('')
        setSubmitted(true)
      } else {
        setServerError(result.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center gap-4 rounded-2xl border border-cocoa-700 bg-cocoa-850 p-8 text-center shadow-xl shadow-black/40"
        role="status"
      >
        <span className="text-6xl" aria-hidden="true">🎉</span>
        <h2 className="text-xl font-semibold text-orange-50">Recommendation sent!</h2>
        <p className="text-sm text-orange-200/80">
          Thanks — {username} will see your recommendation in their inbox.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false)
            setErrors({})
            setServerError(null)
          }}
          className="mt-2 rounded-lg bg-flame-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-flame-600 focus:outline-none focus:ring-2 focus:ring-flame-500 focus:ring-offset-2 focus:ring-offset-cocoa-850"
        >
          Send another one
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-cocoa-700 bg-cocoa-850 p-6 shadow-xl shadow-black/40 sm:p-8" noValidate>
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="category" value={category} />

      {serverError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300" role="alert">
          {serverError}
        </div>
      )}

      {/* Your Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-orange-200">
          Your Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          maxLength={100}
          className="mt-1.5 block w-full rounded-lg border border-cocoa-600 bg-cocoa-800 px-3 py-2 text-orange-50 shadow-sm transition-colors focus:border-flame-500 focus:outline-none focus:ring-1 focus:ring-flame-500"
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={errors.name ? 'true' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-400" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <span className="block text-sm font-medium text-orange-200">Category</span>
        <div
          className="mt-2 flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Category"
          aria-describedby={errors.category ? 'category-error' : undefined}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat
            return (
              <button
                key={cat}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => {
                  setCategory(cat)
                  if (errors.category) {
                    setErrors((prev) => ({ ...prev, category: undefined }))
                  }
                }}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-flame-500 focus:ring-offset-1 focus:ring-offset-cocoa-850 ${
                  isSelected
                    ? 'border-flame-500 bg-flame-500 text-white shadow-sm'
                    : 'border-cocoa-600 bg-cocoa-800 text-orange-200 hover:border-flame-400 hover:text-flame-300'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
        {errors.category && (
          <p id="category-error" className="mt-1.5 text-sm text-red-400" role="alert">
            {errors.category}
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-orange-200">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          maxLength={200}
          className="mt-1.5 block w-full rounded-lg border border-cocoa-600 bg-cocoa-800 px-3 py-2 text-orange-50 shadow-sm transition-colors focus:border-flame-500 focus:outline-none focus:ring-1 focus:ring-flame-500"
          aria-describedby={errors.title ? 'title-error' : undefined}
          aria-invalid={errors.title ? 'true' : undefined}
        />
        {errors.title && (
          <p id="title-error" className="mt-1 text-sm text-red-400" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-orange-200">
          Notes <span className="text-orange-200/50">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          maxLength={500}
          rows={3}
          className="mt-1.5 block w-full rounded-lg border border-cocoa-600 bg-cocoa-800 px-3 py-2 text-orange-50 shadow-sm transition-colors focus:border-flame-500 focus:outline-none focus:ring-1 focus:ring-flame-500"
          aria-describedby={errors.notes ? 'notes-error' : undefined}
          aria-invalid={errors.notes ? 'true' : undefined}
        />
        {errors.notes && (
          <p id="notes-error" className="mt-1 text-sm text-red-400" role="alert">
            {errors.notes}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-flame-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-flame-600 focus:outline-none focus:ring-2 focus:ring-flame-500 focus:ring-offset-2 focus:ring-offset-cocoa-850 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send Recommendation'}
      </button>
    </form>
  )
}
