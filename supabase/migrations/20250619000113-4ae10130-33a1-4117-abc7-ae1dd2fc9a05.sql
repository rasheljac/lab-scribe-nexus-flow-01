
-- Add order column to experiment_ideas table
ALTER TABLE public.experiment_ideas 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Create index for better performance when ordering
CREATE INDEX idx_experiment_ideas_user_order ON public.experiment_ideas(user_id, display_order);

-- Update existing records to have sequential order based on creation date using a CTE
WITH numbered_ideas AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.experiment_ideas
  WHERE display_order = 0
)
UPDATE public.experiment_ideas 
SET display_order = numbered_ideas.rn
FROM numbered_ideas
WHERE public.experiment_ideas.id = numbered_ideas.id;
