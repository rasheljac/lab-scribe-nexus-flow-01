
-- Add order column to experiments table
ALTER TABLE public.experiments 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Add order column to projects table  
ALTER TABLE public.projects 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Create indexes for better performance when ordering
CREATE INDEX idx_experiments_user_order ON public.experiments(user_id, display_order);
CREATE INDEX idx_projects_user_order ON public.projects(user_id, display_order);

-- Update existing records to have sequential order based on creation date using a CTE
WITH numbered_experiments AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.experiments
  WHERE display_order = 0
)
UPDATE public.experiments 
SET display_order = numbered_experiments.rn
FROM numbered_experiments
WHERE public.experiments.id = numbered_experiments.id;

WITH numbered_projects AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.projects
  WHERE display_order = 0
)
UPDATE public.projects 
SET display_order = numbered_projects.rn
FROM numbered_projects
WHERE public.projects.id = numbered_projects.id;
