# Implementation Plan: MyReccBox

## Overview

This plan implements MyReccBox as a Next.js 14 App Router application with Supabase backend. Tasks are ordered to build foundational layers first (types, database, auth), then implement features incrementally (submission, inbox, filtering), and wire everything together with the landing page.

## Tasks

- [x] 1. Set up project structure, types, and Supabase configuration
  - [x] 1.1 Initialize Next.js 14 project with TypeScript, Tailwind CSS, and Supabase dependencies
    - Run `create-next-app` with TypeScript and Tailwind CSS enabled
    - Install `@supabase/supabase-js`, `@supabase/ssr`, and `fast-check` (dev)
    - Configure `tsconfig.json` path aliases
    - Create directory structure: `src/app/`, `src/lib/`, `src/components/`, `src/types/`, `tests/`
    - _Requirements: 7.1_

  - [x] 1.2 Define core TypeScript types and interfaces
    - Create `src/types/index.ts` with `Category`, `Suggestion`, `NewSuggestion`, `PaginatedResult`, `ActionResult`, and `Profile` types
    - Ensure `Category` is a union type constrained to `'Book' | 'Movie' | 'Show' | 'Restaurant' | 'Other'`
    - _Requirements: 7.1, 7.3_

  - [x] 1.3 Configure Supabase client utilities
    - Create `src/lib/supabase/client.ts` for browser-side Supabase client
    - Create `src/lib/supabase/server.ts` for server-side Supabase client using `@supabase/ssr`
    - Create `src/lib/supabase/middleware.ts` for auth session refresh in middleware
    - Set up environment variables in `.env.local.example` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
    - _Requirements: 5.1, 5.4, 7.1_

  - [x] 1.4 Create database migration SQL file
    - Create `supabase/migrations/001_initial_schema.sql` with `profiles` table, `suggestions` table, indexes, and RLS policies as defined in the design
    - Include CHECK constraints for field lengths and category values
    - Include indexes for `(user_id, created_at DESC)` and `(user_id, category, created_at DESC)`
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 2. Implement authentication and middleware
  - [ ] 2.1 Create auth middleware for protected routes
    - Create `src/middleware.ts` that intercepts requests to `/inbox`
    - Verify Supabase session; redirect unauthenticated users to `/login`
    - Allow all other routes to pass through
    - _Requirements: 2.4, 5.1_

  - [ ] 2.2 Implement login page with magic link form
    - Create `src/app/login/page.tsx` as a Client Component
    - Render email input field and submit button
    - Validate email format on client side before submission
    - Call `supabase.auth.signInWithOtp({ email })` on valid submission
    - Display confirmation message on success, error message on failure
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 2.3 Implement auth callback route
    - Create `src/app/auth/callback/route.ts` as a Route Handler
    - Exchange the magic link code for a session using `supabase.auth.exchangeCodeForSession`
    - Redirect to `/inbox` on success
    - Redirect to `/login` with error query param on expired/invalid link
    - _Requirements: 5.4, 5.5_

  - [ ] 2.4 Implement logout functionality
    - Create a `LogoutButton` Client Component in `src/components/LogoutButton.tsx`
    - Call `supabase.auth.signOut()` and redirect to `/login`
    - _Requirements: 5.6_

  - [ ]* 2.5 Write property test for email validation
    - **Property 8: Email validation rejects malformed addresses**
    - Generate random malformed email strings (missing @, missing domain, empty, whitespace-only) using `fast-check`
    - Verify the validation function rejects all of them
    - Create `tests/properties/email-validation.property.test.ts`
    - **Validates: Requirements 5.3**

- [ ] 3. Implement suggestion submission
  - [ ] 3.1 Create data access function for username resolution
    - Create `src/lib/data/profiles.ts` with `resolveUsername(username: string): Promise<string | null>`
    - Query `profiles` table for matching username, return `id` or null
    - _Requirements: 1.7_

  - [ ] 3.2 Create data access function for suggestion creation
    - Create `src/lib/data/suggestions.ts` with `createSuggestion(data: NewSuggestion): Promise<ActionResult>`
    - Insert into `suggestions` table with server-side validation of field constraints
    - Return success/error result
    - _Requirements: 1.2, 7.2, 7.3_

  - [ ] 3.3 Implement submission Server Action
    - Create `src/app/recommend/[username]/actions.ts` with `submitSuggestion` Server Action
    - Parse and validate FormData (name required ≤100, category in valid set, title required ≤200, notes optional ≤500)
    - Call `createSuggestion` on valid input
    - Return `ActionResult` with success or field-level errors
    - _Requirements: 1.2, 1.4, 7.3_

  - [ ] 3.4 Implement submission page Server Component
    - Create `src/app/recommend/[username]/page.tsx`
    - Resolve username via `resolveUsername`; render not-found message if null
    - Pass `username` and `userId` to the Client Component form
    - _Requirements: 1.5, 1.7_

  - [ ] 3.5 Implement submission form Client Component
    - Create `src/components/SubmissionForm.tsx`
    - Render form with fields: Your Name (text, required), Category (select), Title (text, required), Notes (textarea, optional)
    - Client-side validation for required fields and max lengths
    - Call Server Action on submit; show success message and reset form on success
    - Preserve form data and show error message on failure
    - _Requirements: 1.1, 1.3, 1.4, 1.6_

  - [ ]* 3.6 Write property test for submission round-trip
    - **Property 1: Submission round-trip preserves data and generates defaults**
    - Generate random valid suggestions (name ≤100, valid category, title ≤200, notes ≤500 or null) using `fast-check`
    - Verify submitted data matches read-back data, id is UUID, created_at is recent, seen is false
    - Create `tests/properties/submission.property.test.ts`
    - **Validates: Requirements 1.2, 7.2**

  - [ ]* 3.7 Write property test for validation rejection
    - **Property 2: Validation rejects invalid suggestion data**
    - Generate random invalid suggestions (empty/long name, bad category, empty/long title, long notes) using `fast-check`
    - Verify all are rejected with errors and no record persisted
    - Create `tests/properties/submission-validation.property.test.ts`
    - **Validates: Requirements 1.4, 7.1, 7.3**

- [ ] 4. Checkpoint - Ensure submission flow works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement inbox with suggestion display and pagination
  - [ ] 5.1 Create data access function for fetching suggestions
    - Add `getSuggestions` to `src/lib/data/suggestions.ts`
    - Accept `userId`, optional `category`, `page`, `pageSize` parameters
    - Query suggestions with filters, order by `created_at DESC`, apply pagination
    - Return `PaginatedResult<Suggestion>`
    - _Requirements: 2.1, 2.5, 4.2, 4.3_

  - [ ] 5.2 Implement inbox page Server Component
    - Create `src/app/inbox/page.tsx`
    - Get authenticated user from Supabase session
    - Accept `category` and `page` search params
    - Fetch suggestions via `getSuggestions`
    - Render suggestion cards, filter bar, pagination, and logout button
    - Show empty state message when no suggestions exist
    - _Requirements: 2.1, 2.3, 2.4, 2.5_

  - [ ] 5.3 Implement SuggestionCard Client Component
    - Create `src/components/SuggestionCard.tsx`
    - Display sender name, category badge, title, truncated notes (200 chars with indicator), relative timestamp
    - Apply reduced opacity for seen suggestions
    - Handle click to mark as seen
    - _Requirements: 2.2, 3.2_

  - [ ] 5.4 Implement notes truncation utility
    - Create `src/lib/utils/truncate.ts` with a `truncateNotes(notes: string, maxLength: number): string` function
    - Return full text if ≤ maxLength, otherwise first maxLength chars + "…"
    - _Requirements: 2.2_

  - [ ] 5.5 Implement relative timestamp utility
    - Create `src/lib/utils/time.ts` with a `relativeTime(dateString: string): string` function
    - Return human-readable relative time (e.g., "2 hours ago", "3 days ago")
    - _Requirements: 2.2_

  - [ ] 5.6 Implement CategoryFilter Client Component
    - Create `src/components/CategoryFilter.tsx`
    - Render filter bar with "All", "Book", "Movie", "Show", "Restaurant", "Other" options
    - Highlight active filter; default to "All"
    - On filter change, update URL search params to trigger server re-fetch
    - Show message when no suggestions match selected category
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 5.7 Implement Pagination Client Component
    - Create `src/components/Pagination.tsx`
    - Display page navigation when totalPages > 1
    - Update URL search params on page change
    - _Requirements: 2.5_

  - [ ]* 5.8 Write property test for inbox sorting
    - **Property 3: Inbox suggestions are sorted by newest first**
    - Generate random sets of suggestions, verify fetched results are in strictly descending `created_at` order
    - Create `tests/properties/inbox-sorting.property.test.ts`
    - **Validates: Requirements 2.1**

  - [ ]* 5.9 Write property test for notes truncation
    - **Property 4: Notes truncation preserves content up to 200 characters**
    - Generate random strings of varying length, verify truncation behavior
    - Create `tests/properties/truncation.property.test.ts`
    - **Validates: Requirements 2.2**

  - [ ]* 5.10 Write property test for pagination
    - **Property 5: Pagination returns at most pageSize items with correct metadata**
    - Generate random total counts, verify pagination math (totalPages = ceil(total/20), each page ≤ 20 items)
    - Create `tests/properties/pagination.property.test.ts`
    - **Validates: Requirements 2.5**

- [ ] 6. Implement mark-as-seen functionality
  - [ ] 6.1 Create data access function for updating seen status
    - Add `updateSuggestionSeen` to `src/lib/data/suggestions.ts`
    - Accept `id` and `userId`, update `seen` to true only if currently false
    - Return success/error result
    - _Requirements: 3.1, 3.3_

  - [ ] 6.2 Implement markSeen Server Action
    - Create `src/app/inbox/actions.ts` with `markSuggestionSeen` Server Action
    - Verify authenticated user owns the suggestion
    - Call `updateSuggestionSeen`
    - Return `ActionResult`
    - _Requirements: 3.1, 3.3, 3.4_

  - [ ] 6.3 Add optimistic UI update to SuggestionCard
    - Update `SuggestionCard` to use `useOptimistic` or local state for immediate visual feedback
    - On click of unseen card: optimistically set seen, call Server Action, roll back on error
    - Skip network call if suggestion is already seen
    - Display error toast on failure and revert visual state
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 6.4 Write property test for mark-as-seen idempotence
    - **Property 6: Marking an unseen suggestion as seen is idempotent**
    - Generate random unseen suggestions, mark seen, verify idempotence and field preservation
    - Create `tests/properties/mark-seen.property.test.ts`
    - **Validates: Requirements 3.1, 3.3**

  - [ ]* 6.5 Write property test for category filter correctness
    - **Property 7: Category filter returns only matching suggestions**
    - Generate random suggestion sets and random category selections, verify filter returns exactly matching items
    - Create `tests/properties/category-filter.property.test.ts`
    - **Validates: Requirements 4.2, 4.3**

- [ ] 7. Checkpoint - Ensure inbox features work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement landing page and final wiring
  - [ ] 8.1 Implement landing page
    - Create `src/app/page.tsx` as a Server Component
    - Render headline and description communicating MyReccBox's purpose
    - Render "Try the Demo" button linking to `/recommend/aisha`
    - Ensure button is visible without scrolling on viewports ≥ 768px
    - Style with Tailwind CSS
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 8.2 Create global layout and styling
    - Update `src/app/layout.tsx` with app-wide metadata, font, and Tailwind setup
    - Create shared UI components (error toast, loading states) as needed
    - Ensure consistent styling across all pages
    - _Requirements: 6.1_

- [ ] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using `fast-check`
- Unit tests validate specific examples and edge cases
- The application uses TypeScript throughout with Next.js 14 App Router conventions
- Supabase RLS policies handle authorization at the database level

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3", "2.4"] },
    { "id": 3, "tasks": ["2.5", "3.1", "3.2"] },
    { "id": 4, "tasks": ["3.3", "3.4"] },
    { "id": 5, "tasks": ["3.5", "3.6", "3.7"] },
    { "id": 6, "tasks": ["5.1", "5.4", "5.5"] },
    { "id": 7, "tasks": ["5.2", "5.3", "5.6", "5.7"] },
    { "id": 8, "tasks": ["5.8", "5.9", "5.10"] },
    { "id": 9, "tasks": ["6.1"] },
    { "id": 10, "tasks": ["6.2", "6.3"] },
    { "id": 11, "tasks": ["6.4", "6.5"] },
    { "id": 12, "tasks": ["8.1", "8.2"] }
  ]
}
```
