-- MyReccBox Initial Schema Migration
-- Creates profiles and suggestions tables with indexes and RLS policies

-- Profiles table (maps usernames to auth users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL
);

-- Suggestions table
CREATE TABLE suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  category TEXT NOT NULL CHECK (category IN ('Book', 'Movie', 'Show', 'Restaurant', 'Other')),
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 500),
  seen BOOLEAN NOT NULL DEFAULT false
);

-- Index for inbox queries (owner's suggestions, sorted by date)
CREATE INDEX idx_suggestions_user_created ON suggestions(user_id, created_at DESC);

-- Index for category filtering
CREATE INDEX idx_suggestions_user_category ON suggestions(user_id, category, created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Public can read profiles (for username resolution)
CREATE POLICY "Public can read profiles"
  ON profiles FOR SELECT
  USING (true);

-- Anyone can insert suggestions (public submission)
CREATE POLICY "Public can insert suggestions"
  ON suggestions FOR INSERT
  WITH CHECK (true);

-- Only the owner can read their own suggestions
CREATE POLICY "Owner can read own suggestions"
  ON suggestions FOR SELECT
  USING (auth.uid() = user_id);

-- Only the owner can update their own suggestions
CREATE POLICY "Owner can update own suggestions"
  ON suggestions FOR UPDATE
  USING (auth.uid() = user_id);
