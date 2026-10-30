-- Create the chat-files storage bucket if it doesn't exist
-- Run this in Supabase SQL Editor if you get bucket errors

INSERT INTO storage.buckets (id, name, owner, public, file_size_limit, allowed_mime_types, created_at)
VALUES (
  'chat-files',
  'chat-files',
  'authenticated',
  true,
  10485760, -- 10MB in bytes
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mpeg',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip', 'application/x-rar-compressed'
  ],
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for the bucket
CREATE POLICY "Anyone can view files" ON storage.objects FOR SELECT USING (bucket_id = 'chat-files');

CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-files' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own files" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'chat-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'chat-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
