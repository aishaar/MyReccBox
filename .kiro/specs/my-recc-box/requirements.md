# Requirements Document

## Introduction

MyReccBox is a web application that gives users a single place to collect recommendations from friends. Friends recommend books, movies, shows, restaurants, and other things across texts, DMs, and conversations — and those recommendations get lost. MyReccBox solves this by providing a public submission page anyone can use (no login required) and a private inbox where the owner can review, filter, and track all suggestions.

## Glossary

- **App**: The MyReccBox web application built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Supabase
- **Suggestion**: A recommendation submitted by a friend, containing a sender name, category, title, and optional notes
- **Submission_Page**: The public page at `/recommend/[username]` where anyone can submit a suggestion without authentication
- **Inbox**: The private page at `/inbox` where the authenticated owner views and manages received suggestions
- **Landing_Page**: The public page at `/` that introduces the app and links to a demo submission page
- **Owner**: The authenticated user who owns the inbox and views suggestions
- **Sender**: Any person who submits a suggestion via the public submission page
- **Category**: One of the predefined suggestion types: Book, Movie, Show, Restaurant, or Other
- **Supabase**: The backend-as-a-service platform used for database storage and authentication
- **Magic_Link**: An email-based passwordless authentication method provided by Supabase

## Requirements

### Requirement 1: Submit a Suggestion

**User Story:** As a sender, I want to submit a recommendation via a public link, so that my friend can find it later in one place.

#### Acceptance Criteria

1. THE Submission_Page SHALL display a form with the following fields: Your Name (text input, required, maximum 100 characters), Category (select input with options Book, Movie, Show, Restaurant, Other, required), Title (text input, required, maximum 200 characters), and Notes (textarea, optional, maximum 500 characters)
2. WHEN the sender submits the form with all required fields populated, THE App SHALL save the suggestion to the Supabase suggestions table with the provided name, category, title, notes, and a server-generated timestamp
3. WHEN the suggestion is saved successfully, THE Submission_Page SHALL display a success message confirming the suggestion was received and reset the form fields to their default empty state
4. WHEN the sender submits the form with one or more required fields empty, THE Submission_Page SHALL display a validation error indicating which fields are missing
5. THE Submission_Page SHALL be accessible without authentication
6. IF the suggestion fails to save due to a server or database error, THEN THE Submission_Page SHALL display an error message indicating the suggestion could not be saved and SHALL preserve the entered form data
7. IF the username in the URL does not correspond to an existing user, THEN THE Submission_Page SHALL display a message indicating that the page was not found

### Requirement 2: View Suggestions in Inbox

**User Story:** As the owner, I want to see all suggestions in my inbox sorted by newest first, so that I can review what my friends have recommended.

#### Acceptance Criteria

1. THE Inbox SHALL display all suggestions sorted by creation timestamp in descending order (newest first)
2. THE Inbox SHALL display each suggestion as a card showing: sender name, category badge, title, notes (truncated to 200 characters with a visual indicator if longer), a relative timestamp (e.g., "2 hours ago", "3 days ago"), and a visual distinction between seen and unseen suggestions
3. WHEN no suggestions exist, THE Inbox SHALL display an empty state message indicating no suggestions have been received
4. IF a user is not authenticated, THEN THE Inbox SHALL redirect the user to the login page
5. THE Inbox SHALL display a maximum of 20 suggestions per page and provide navigation to view additional suggestions when more than 20 exist

### Requirement 3: Mark Suggestion as Seen

**User Story:** As the owner, I want to mark a suggestion as seen by clicking on it, so that I can track which recommendations I have already reviewed.

#### Acceptance Criteria

1. WHEN the owner clicks an unseen suggestion card in the Inbox, THE App SHALL set the seen field to true for that suggestion record in the Supabase suggestions table within 2 seconds
2. WHEN a suggestion has its seen field set to true, THE Inbox SHALL display that suggestion card at reduced opacity compared to unseen suggestion cards to visually indicate it has been reviewed
3. IF the owner clicks a suggestion card that is already marked as seen, THEN THE App SHALL not re-submit the update and the suggestion SHALL remain displayed in its seen state
4. IF the update to mark a suggestion as seen fails due to a network or server error, THEN THE App SHALL display an error message indicating the suggestion could not be marked as seen and SHALL retain the suggestion in its unseen visual state

### Requirement 4: Filter Suggestions by Category

**User Story:** As the owner, I want to filter suggestions by category, so that I can focus on one type of recommendation at a time.

#### Acceptance Criteria

1. THE Inbox SHALL display a filter bar at the top of the page with options for each category (Book, Movie, Show, Restaurant, Other) and an "All" option, with the "All" option selected by default on page load
2. WHEN the owner selects a category filter, THE Inbox SHALL display only suggestions matching the selected category and visually indicate the selected filter as active
3. WHEN the owner selects the "All" filter, THE Inbox SHALL display all suggestions regardless of category and visually indicate the "All" filter as active
4. IF the owner selects a category filter and no suggestions match the selected category, THEN THE Inbox SHALL display a message indicating that no suggestions exist for that category

### Requirement 5: Authenticate via Magic Link

**User Story:** As the owner, I want to log in using a magic link sent to my email, so that I can securely access my inbox without managing a password.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to the Inbox, THE App SHALL redirect the user to a login page that displays an email input field and a submit button to request a magic link
2. WHEN the owner enters a valid email address and requests a magic link, THE App SHALL send a magic link email via Supabase authentication and display a confirmation message indicating the email has been sent
3. IF the owner submits the login form with an empty or malformed email address, THEN THE App SHALL display a validation error indicating a valid email address is required
4. WHEN the owner clicks a valid magic link in the email, THE App SHALL authenticate the owner and redirect to the Inbox
5. IF the magic link is expired or invalid when clicked, THEN THE App SHALL redirect the user to the login page and display an error message indicating the link is no longer valid
6. WHEN the authenticated owner clicks a logout control in the Inbox, THE App SHALL end the session and redirect the user to the login page

### Requirement 6: Landing Page

**User Story:** As a visitor, I want to see a landing page that explains what MyReccBox does, so that I can understand the app and try the demo.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a headline and a description that communicates MyReccBox's purpose of collecting recommendations from friends in one place
2. THE Landing_Page SHALL display a button labeled "Try the Demo" that is visible without scrolling on viewports 768px wide or larger
3. WHEN the visitor clicks the "Try the Demo" button, THE Landing_Page SHALL navigate to `/recommend/aisha`
4. THE Landing_Page SHALL be accessible without authentication

### Requirement 7: Suggestion Data Model

**User Story:** As a developer, I want a well-defined data model for suggestions, so that the app stores and retrieves recommendation data consistently.

#### Acceptance Criteria

1. THE App SHALL store each suggestion in a Supabase `suggestions` table with the following columns: id (UUID, auto-generated primary key), created_at (timestamp, auto-generated by the server at insertion time), name (text, not null, maximum 100 characters), category (text, not null, constrained to one of: Book, Movie, Show, Restaurant, Other), title (text, not null, maximum 200 characters), notes (text, nullable, maximum 500 characters), and seen (boolean, not null, defaulting to false)
2. WHEN a new suggestion is submitted, THE App SHALL auto-generate the id and created_at fields and set the seen field to false
3. IF a suggestion is submitted with a category value not in the set (Book, Movie, Show, Restaurant, Other), THEN THE App SHALL reject the submission and return an error indicating an invalid category was provided
