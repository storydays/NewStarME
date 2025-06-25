-- OPTIONAL: Drop tables if they exist and you are re-running this entire migration from scratch
-- This is necessary if you've already run parts of this SQL and hit the error.
-- If this is the very first time running this file, you can skip these DROP TABLE lines.
DROP TABLE IF EXISTS dedications CASCADE; -- CASCADE drops foreign key dependents too
DROP TABLE IF EXISTS stars CASCADE;
DROP TABLE IF EXISTS emotions CASCADE;

/*
  # StarMe Initial Schema

  1. New Tables
    - `emotions`
      - `id` (text, primary key)
      - `name` (text, unique)
      - `color` (text)
      - `description` (text)
      - `created_at` (timestamp)

    - `stars`
      - `id` (uuid, primary key)
      - `scientific_name` (text)
      - `poetic_description` (text)
      - `coordinates` (text)
      - `visual_data` (jsonb)
      - `emotion_id` (text, foreign key)
      - `created_at` (timestamp)

    - `dedications`
      - `id` (uuid, primary key)
      - `star_id` (uuid, foreign key)
      - `custom_name` (text)
      - `message` (text)
      - `gift_tier` (text)
      - `email` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated insert on dedications
*/

-- Create emotions table
CREATE TABLE IF NOT EXISTS emotions (
  id text PRIMARY KEY, -- Changed from uuid, removed DEFAULT gen_random_uuid()
  name text UNIQUE NOT NULL,
  color text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create stars table
CREATE TABLE IF NOT EXISTS stars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scientific_name text NOT NULL,
  poetic_description text NOT NULL,
  coordinates text NOT NULL,
  visual_data jsonb DEFAULT '{}',
  emotion_id text REFERENCES emotions(id) ON DELETE CASCADE, -- Foreign key changed to TEXT to match emotions.id
  created_at timestamptz DEFAULT now()
);

-- Create dedications table
CREATE TABLE IF NOT EXISTS dedications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  star_id uuid REFERENCES stars(id) ON DELETE CASCADE,
  custom_name text NOT NULL,
  message text NOT NULL,
  gift_tier text DEFAULT 'basic' CHECK (gift_tier IN ('basic', 'premium', 'deluxe')),
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stars_emotion_id ON stars(emotion_id);
CREATE INDEX IF NOT EXISTS idx_dedications_star_id ON dedications(star_id);
CREATE INDEX IF NOT EXISTS idx_dedications_created_at ON dedications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE dedications ENABLE ROW LEVEL SECURITY;

-- Create policies for emotions (public read)
CREATE POLICY "Anyone can read emotions"
  ON emotions
  FOR SELECT
  TO public
  USING (true);

-- Create policies for stars (public read and insert)
CREATE POLICY "Anyone can read stars"
  ON stars
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create stars" -- <<<< NEW POLICY ADDED FOR INSERTS
  ON stars
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for dedications (public read, anyone can insert)
CREATE POLICY "Anyone can read dedications"
  ON dedications
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create dedications"
  ON dedications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert initial emotions data
INSERT INTO emotions (id, name, color, description) VALUES
  ('love', 'Love', '#FF6B9D', 'Dedicate a star to express deep romantic love and eternal commitment'),
  ('friendship', 'Friendship', '#4ECDC4', 'Celebrate the bonds of friendship that illuminate your life'),
  ('family', 'Family', '#45B7D1', 'Honor family connections that provide strength and guidance'),
  ('milestones', 'Milestones', '#96CEB4', 'Mark significant achievements and life-changing moments'),
  ('memorial', 'Memorial', '#FECA57', 'Create lasting tributes to cherished memories and loved ones'),
  ('healing', 'Healing', '#A8E6CF', 'Find peace and renewal through celestial connection'),
  ('adventure', 'Adventure', '#FF8B94', 'Commemorate journeys and the spirit of exploration'),
  ('creativity', 'Creativity', '#B4A7D6', 'Inspire artistic expression and innovative thinking')
ON CONFLICT (id) DO NOTHING;