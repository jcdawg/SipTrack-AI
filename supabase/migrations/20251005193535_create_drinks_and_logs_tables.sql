/*
  # Create drinks tracking system

  ## Overview
  This migration sets up a complete drink tracking system with saved drinks and drink logs.

  ## New Tables

  ### 1. `drinks`
  Stores unique drink definitions that users have previously added.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for the drink
  - `user_id` (uuid) - Reference to the user who created this drink
  - `name` (text) - Name of the drink
  - `type` (text) - Type of drink (beer, wine, cocktail, etc.)
  - `volume_ml` (integer) - Standard volume in milliliters
  - `alcohol_percentage` (numeric) - Alcohol content percentage
  - `calories` (integer) - Calorie content
  - `cost` (numeric) - Typical cost of the drink
  - `image_url` (text, optional) - URL to drink image if available
  - `created_at` (timestamptz) - When the drink was first saved
  - `last_used_at` (timestamptz) - When the drink was last logged

  ### 2. `drink_logs`
  Stores individual drink consumption logs.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for the log entry
  - `user_id` (uuid) - Reference to the user who logged the drink
  - `drink_id` (uuid, optional) - Reference to saved drink if applicable
  - `name` (text) - Name of the drink (denormalized for historical accuracy)
  - `type` (text) - Type of drink
  - `volume_ml` (integer) - Volume consumed in milliliters
  - `alcohol_percentage` (numeric) - Alcohol content percentage
  - `calories` (integer) - Calorie content
  - `cost` (numeric) - Cost of this specific drink
  - `mood_before` (text, optional) - User's mood before drinking
  - `mood_after` (text, optional) - User's mood after drinking
  - `notes` (text, optional) - Additional notes about this drink
  - `logged_at` (timestamptz) - When the drink was consumed
  - `created_at` (timestamptz) - When the log entry was created

  ## Security

  ### Row Level Security (RLS)
  - RLS is enabled on both tables
  - Users can only access their own drinks and logs
  - Authenticated users required for all operations

  ### Policies

  **drinks table:**
  - SELECT: Users can view their own saved drinks
  - INSERT: Users can create new saved drinks
  - UPDATE: Users can update their own saved drinks
  - DELETE: Users can delete their own saved drinks

  **drink_logs table:**
  - SELECT: Users can view their own drink logs
  - INSERT: Users can create new drink logs
  - UPDATE: Users can update their own drink logs
  - DELETE: Users can delete their own drink logs

  ## Indexes
  - Index on `drinks.user_id` for fast user-specific queries
  - Index on `drinks.last_used_at` for sorting by recent usage
  - Index on `drink_logs.user_id` for fast user-specific queries
  - Index on `drink_logs.logged_at` for chronological sorting

  ## Important Notes
  1. The `drink_logs` table denormalizes drink data to preserve historical accuracy even if the saved drink is modified later
  2. Foreign key relationship between `drink_logs.drink_id` and `drinks.id` is optional to support ad-hoc drink logging
  3. The `last_used_at` field on drinks is updated when a drink is logged to show most recently used drinks first
*/

-- Create drinks table
CREATE TABLE IF NOT EXISTS drinks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  volume_ml integer NOT NULL,
  alcohol_percentage numeric(4,2) NOT NULL,
  calories integer NOT NULL DEFAULT 0,
  cost numeric(10,2) NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz DEFAULT now()
);

-- Create drink_logs table
CREATE TABLE IF NOT EXISTS drink_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  drink_id uuid,
  name text NOT NULL,
  type text NOT NULL,
  volume_ml integer NOT NULL,
  alcohol_percentage numeric(4,2) NOT NULL,
  calories integer NOT NULL DEFAULT 0,
  cost numeric(10,2) NOT NULL DEFAULT 0,
  mood_before text,
  mood_after text,
  notes text,
  logged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (drink_id) REFERENCES drinks(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_logs ENABLE ROW LEVEL SECURITY;

-- Drinks policies
CREATE POLICY "Users can view own drinks"
  ON drinks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own drinks"
  ON drinks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drinks"
  ON drinks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own drinks"
  ON drinks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drink logs policies
CREATE POLICY "Users can view own drink logs"
  ON drink_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own drink logs"
  ON drink_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drink logs"
  ON drink_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own drink logs"
  ON drink_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_drinks_user_id ON drinks(user_id);
CREATE INDEX IF NOT EXISTS idx_drinks_last_used_at ON drinks(last_used_at DESC);
CREATE INDEX IF NOT EXISTS idx_drink_logs_user_id ON drink_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_drink_logs_logged_at ON drink_logs(logged_at DESC);