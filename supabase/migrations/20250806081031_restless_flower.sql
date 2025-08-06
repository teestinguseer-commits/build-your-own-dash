/*
  # Add favorites and recent views functionality

  1. New Tables
    - `user_favorites` - stores user favorite use cases
    - `user_recent_views` - tracks recently viewed use cases
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  use_case_id uuid REFERENCES use_cases(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, use_case_id)
);

-- Create user_recent_views table
CREATE TABLE IF NOT EXISTS user_recent_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  use_case_id uuid REFERENCES use_cases(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, use_case_id)
);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recent_views ENABLE ROW LEVEL SECURITY;

-- Policies for user_favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add own favorites"
  ON user_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites"
  ON user_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for user_recent_views
CREATE POLICY "Users can view own recent views"
  ON user_recent_views
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add own recent views"
  ON user_recent_views
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recent views"
  ON user_recent_views
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update recent views (upsert with new timestamp)
CREATE OR REPLACE FUNCTION update_recent_view(p_user_id uuid, p_use_case_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO user_recent_views (user_id, use_case_id, viewed_at)
  VALUES (p_user_id, p_use_case_id, now())
  ON CONFLICT (user_id, use_case_id)
  DO UPDATE SET viewed_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;