-- Migration: Add status_id column to outcomes table
-- Run this SQL in your database

-- 1. Add the status_id column (nullable first, then populate data)
ALTER TABLE outcomes ADD COLUMN IF NOT EXISTS status_id INTEGER;

-- 2. Add foreign key constraint (optional but recommended)
ALTER TABLE outcomes 
ADD CONSTRAINT fk_outcomes_status 
FOREIGN KEY (status_id) 
REFERENCES status(id) 
ON DELETE SET NULL;

-- 3. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_outcomes_status_id ON outcomes(status_id);

-- 4. Example: Update existing outcomes to link to a status
-- Run this for each outcome that should be linked:
-- UPDATE outcomes SET status_id = <status_id> WHERE id = <outcome_id>;

-- Example data (adjust based on your existing data):
-- UPDATE outcomes SET status_id = 1 WHERE name LIKE '%Procedente%';
-- UPDATE outcomes SET status_id = 2 WHERE name LIKE '%Improcedente%';
-- UPDATE outcomes SET status_id = 3 WHERE name LIKE '%Acordo%';