-- Add row column to form_fields table
-- This column indicates which row the field belongs to (for multi-row layouts)

ALTER TABLE form_fields
ADD COLUMN IF NOT EXISTS row INTEGER NOT NULL DEFAULT 1;

-- Create index for efficient row-based queries
CREATE INDEX IF NOT EXISTS idx_form_fields_row ON form_fields(form_id, row, order_index);

-- Update existing records to have row = 1 by default (they're all in the first row)
UPDATE form_fields SET row = 1 WHERE row IS NULL;

-- Add comment to column
COMMENT ON COLUMN form_fields.row IS 'Row number for organizing fields in multi-row layouts. Fields with the same row number appear on the same row.';

