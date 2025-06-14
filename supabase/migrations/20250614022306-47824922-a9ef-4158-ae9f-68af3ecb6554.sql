
-- Create a table for experiment note attachments
CREATE TABLE public.experiment_note_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID NOT NULL,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.experiment_note_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for experiment note attachments
CREATE POLICY "Users can view attachments for their notes" 
  ON public.experiment_note_attachments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create attachments for their notes" 
  ON public.experiment_note_attachments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their note attachments" 
  ON public.experiment_note_attachments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create storage bucket for experiment note attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('experiment-note-attachments', 'experiment-note-attachments', false);

-- Create storage policies
CREATE POLICY "Users can upload their own note attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'experiment-note-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own note attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'experiment-note-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own note attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'experiment-note-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
