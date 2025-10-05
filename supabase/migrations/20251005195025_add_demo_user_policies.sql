/*
  # Add Demo User Support

  ## Overview
  This migration adds policies to support anonymous demo users by allowing operations
  for users who are not authenticated through Supabase Auth but use a predefined demo user UUID.

  ## Changes
  1. Add permissive policies for demo user UUID '00000000-0000-0000-0000-000000000001'
  2. These policies work alongside existing authenticated user policies
  3. This enables the app to work without authentication for demo purposes

  ## Security Notes
  - Demo user data is isolated by user_id
  - In production, these policies should be removed and proper authentication implemented
  - Demo user cannot access other users' data
*/

-- Drinks policies for demo user
CREATE POLICY "Demo user can view demo drinks"
  ON drinks FOR SELECT
  TO anon
  USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Demo user can create demo drinks"
  ON drinks FOR INSERT
  TO anon
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Demo user can update demo drinks"
  ON drinks FOR UPDATE
  TO anon
  USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Demo user can delete demo drinks"
  ON drinks FOR DELETE
  TO anon
  USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Drink logs policies for demo user
CREATE POLICY "Demo user can view demo drink logs"
  ON drink_logs FOR SELECT
  TO anon
  USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Demo user can create demo drink logs"
  ON drink_logs FOR INSERT
  TO anon
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Demo user can update demo drink logs"
  ON drink_logs FOR UPDATE
  TO anon
  USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Demo user can delete demo drink logs"
  ON drink_logs FOR DELETE
  TO anon
  USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);