/*
  # Add source and generated_at columns to stars table

  1. Changes
    - Add `source` column to track star origin (static, ai, fallback)
    - Add `generated_at` column to track when AI stars were created
    - Update existing stars to have 'static' source
    - Add index on generated_at for performance

  2. Security
    - No RLS changes needed as existing policies cover new columns
*/

-- Add source column to track star origin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stars' AND column_name = 'source'
  ) THEN
    ALTER TABLE stars ADD COLUMN source text DEFAULT 'static';
  END IF;
END $$;

-- Add generated_at column for AI star tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stars' AND column_name = 'generated_at'
  ) THEN
    ALTER TABLE stars ADD COLUMN generated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add index on generated_at for performance
CREATE INDEX IF NOT EXISTS idx_stars_generated_at ON stars(generated_at DESC);

-- Add index on source for filtering
CREATE INDEX IF NOT EXISTS idx_stars_source ON stars(source);

-- Update existing stars to have 'static' source if not already set
UPDATE stars SET source = 'static' WHERE source IS NULL;