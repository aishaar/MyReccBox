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
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    setSuccessMessage(null)
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
        setSuccessMessage('Your recommendation has been sent!')
        setServerError(null)
        formRef.current?.reset()
      } else {
        setServerError(result.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 rounded-lg bg-white p-6 shadow-md" noValidate>
      <input type="hidden" name="user_id" value={userId} />

      {successMessage && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800" role="status">
          {successMessage}
        </div>
      )}

      {serverError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800" role="alert">
          {serverError}
        </div>
      )}

      {/* Your Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Your Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          maxLength={100}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={errors.name ? 'true' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue=""
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          aria-describedby={errors.category ? 'category-error' : undefined}
          aria-invalid={errors.category ? 'true' : undefined}
        >
          <option value="" disabled>
            Select a category
          </option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p id="category-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.category}
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          maxLength={200}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          aria-describedby={errors.title ? 'title-error' : undefined}
          aria-invalid={errors.title ? 'true' : undefined}
        />
        {errors.title && (
          <p id="title-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          maxLength={500}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          aria-describedby={errors.notes ? 'notes-error' : undefined}
          aria-invalid={errors.notes ? 'true' : undefined}
        />
        {errors.notes && (
          <p id="notes-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.notes}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send Recommendation'}
      </button>
    </form>
  )
}
