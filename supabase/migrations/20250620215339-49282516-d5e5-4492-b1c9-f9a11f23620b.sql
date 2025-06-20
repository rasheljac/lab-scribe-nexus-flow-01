
-- Add order column to protocols table
ALTER TABLE public.protocols 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Create index for better performance when ordering
CREATE INDEX idx_protocols_user_order ON public.protocols(user_id, display_order);

-- Update existing records to have sequential order based on creation date using a CTE
WITH numbered_protocols AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.protocols
  WHERE display_order = 0
)
UPDATE public.protocols 
SET display_order = numbered_protocols.rn
FROM numbered_protocols
WHERE public.protocols.id = numbered_protocols.id;
