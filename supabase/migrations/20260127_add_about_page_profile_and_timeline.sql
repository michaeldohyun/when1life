-- Add profile_image_url and timeline columns to AboutPage
ALTER TABLE clipper."AboutPage"
ADD COLUMN profile_image_url TEXT,
ADD COLUMN timeline JSONB DEFAULT '[]'::jsonb;

-- Update existing row with empty timeline
UPDATE clipper."AboutPage"
SET timeline = '[]'::jsonb
WHERE timeline IS NULL;
