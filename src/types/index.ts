/**
 * Core types for MyReccBox application.
 */

/** Valid recommendation categories */
export type Category = 'Book' | 'Movie' | 'Show' | 'Restaurant' | 'Other';

/** A suggestion record as stored in the database */
export interface Suggestion {
  id: string;           // UUID
  created_at: string;   // ISO timestamp
  user_id: string;      // UUID - owner of the suggestion
  name: string;         // Sender name, max 100 chars
  category: Category;
  title: string;        // Suggestion title, max 200 chars
  notes: string | null; // Optional notes, max 500 chars
  seen: boolean;        // Default false
}

/** Data required to create a new suggestion */
export interface NewSuggestion {
  user_id: string;
  name: string;
  category: Category;
  title: string;
  notes?: string;
}

/** Paginated query result */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Result of a server action */
export interface ActionResult {
  success: boolean;
  error?: string;
}

/** User profile mapping username to auth user */
export interface Profile {
  id: string;           // UUID, matches auth.users.id
  username: string;     // Unique, used in URL
}
