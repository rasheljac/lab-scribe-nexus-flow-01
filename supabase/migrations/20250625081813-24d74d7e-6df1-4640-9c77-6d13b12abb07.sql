
-- Create a table for custom label templates
CREATE TABLE public.label_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size TEXT NOT NULL,
  width_mm DECIMAL(5,2) NOT NULL DEFAULT 60.0,
  height_mm DECIMAL(5,2) NOT NULL DEFAULT 40.0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.label_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for label templates
CREATE POLICY "Users can view their own templates" 
  ON public.label_templates 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates" 
  ON public.label_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
  ON public.label_templates 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
  ON public.label_templates 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_label_templates_updated_at
  BEFORE UPDATE ON public.label_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates for all users
INSERT INTO public.label_templates (user_id, name, type, size, width_mm, height_mm, is_default)
SELECT 
  auth.uid(),
  'Sample Label',
  'sample',
  '2x1 inch',
  50.8,
  25.4,
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.label_templates (user_id, name, type, size, width_mm, height_mm, is_default)
SELECT 
  auth.uid(),
  'Equipment Tag',
  'equipment',
  '1.5x1 inch',
  38.1,
  25.4,
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.label_templates (user_id, name, type, size, width_mm, height_mm, is_default)
SELECT 
  auth.uid(),
  'Chemical Bottle',
  'chemical',
  '3x2 inch',
  76.2,
  50.8,
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.label_templates (user_id, name, type, size, width_mm, height_mm, is_default)
SELECT 
  auth.uid(),
  'Storage Box',
  'storage',
  '4x2 inch',
  101.6,
  50.8,
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;
