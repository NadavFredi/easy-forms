-- Create storage bucket for form file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('form-files', 'form-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for form-files bucket
CREATE POLICY "Anyone can upload files to form-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'form-files');

CREATE POLICY "Anyone can read files from form-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'form-files');

