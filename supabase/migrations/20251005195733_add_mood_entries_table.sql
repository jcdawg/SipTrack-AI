/*
  # Add mood_entries table

  1. New Tables
    - `mood_entries`
      - `id` (uuid, primary key) - Unique identifier for each mood entry
      - `user_id` (text) - ID of the user who created the mood entry
      - `mood` (integer) - Mood rating from 1-5
      - `notes` (text, optional) - Additional notes about the mood
      - `tags` (text array, optional) - Tags associated with the mood entry
      - `date` (timestamptz) - When the mood was recorded
      - `created_at` (timestamptz) - When the record was created
      
  2. Security
    - Enable RLS on `mood_entries` table
    - Add policy for users to read their own mood entries
    - Add policy for users to insert their own mood entries
    - Add policy for users to update their own mood entries
    - Add policy for users to delete their own mood entries
    
  3. Indexes
    - Add index on user_id for faster queries
    - Add index on date for chronological sorting
*/

CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  mood integer NOT NULL CHECK (mood >= 1 AND mood <= 5),
  notes text,
  tags text[] DEFAULT '{}',
  date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mood entries"
  ON mood_entries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Demo user can view own mood entries"
  ON mood_entries FOR SELECT
  TO anon
  USING (user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can insert own mood entries"
  ON mood_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Demo user can insert own mood entries"
  ON mood_entries FOR INSERT
  TO anon
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update own mood entries"
  ON mood_entries FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Demo user can update own mood entries"
  ON mood_entries FOR UPDATE
  TO anon
  USING (user_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can delete own mood entries"
  ON mood_entries FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Demo user can delete own mood entries"
  ON mood_entries FOR DELETE
  TO anon
  USING (user_id = '00000000-0000-0000-0000-000000000001');

CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(date DESC);