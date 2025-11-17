-- Add visibility fields to subjects table
ALTER TABLE subjects
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

COMMENT ON COLUMN subjects.is_visible IS 'Whether this subject is visible to users in UI';
COMMENT ON COLUMN subjects.display_order IS 'Order for displaying subjects in dropdowns';

-- Add visibility fields to topics table
ALTER TABLE topics
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN topics.is_visible IS 'Whether this topic is visible to users';
COMMENT ON COLUMN topics.is_published IS 'Whether this topic content is ready for use';

-- Update existing records to be visible by default
UPDATE subjects SET is_visible = TRUE WHERE is_visible IS NULL;
UPDATE topics SET is_visible = TRUE WHERE is_visible IS NULL;
UPDATE topics SET is_published = FALSE WHERE is_published IS NULL;

-- Set display order for existing subjects (alphabetically for now)
UPDATE subjects SET display_order =
  CASE code
    WHEN 'matematika' THEN 1
    WHEN 'onatili' THEN 2
    WHEN 'ingliz_tili' THEN 3
    WHEN 'fizika' THEN 4
    WHEN 'kimyo' THEN 5
    WHEN 'biologiya' THEN 6
    WHEN 'tarix' THEN 7
    WHEN 'geografiya' THEN 8
    WHEN 'informatika' THEN 9
    ELSE 99
  END;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subjects_visible ON subjects(is_visible) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_topics_visible ON topics(is_visible) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_topics_published ON topics(is_published) WHERE is_published = TRUE;
