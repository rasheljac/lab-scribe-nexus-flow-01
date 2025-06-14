
-- Update the experiment_note_attachments table to use file_content instead of file_path
ALTER TABLE public.experiment_note_attachments 
DROP COLUMN file_path,
ADD COLUMN file_content TEXT NOT NULL DEFAULT '';
