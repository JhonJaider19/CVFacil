-- Adds RLS policies on storage.objects so authenticated users can upload to
-- the avatars / resume-photos buckets. Without these, every INSERT/SELECT/
-- UPDATE/DELETE on storage.objects is denied to authenticated users because
-- only the project_admin_policy exists.

-- Public read on both buckets (avatars + resume-photos are public).
CREATE POLICY "Public can read avatars objects" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket IN ('avatars', 'resume-photos'));

-- Authenticated users can upload to either bucket.
-- uploaded_by is text but auth.uid() returns uuid; cast explicitly.
CREATE POLICY "Authenticated can upload to avatars" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket IN ('avatars', 'resume-photos')
    AND uploaded_by = auth.uid()::text
  );

-- Users can update their own uploads.
CREATE POLICY "Users can update own avatar objects" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid()::text)
  WITH CHECK (uploaded_by = auth.uid()::text);

-- Users can delete their own uploads.
CREATE POLICY "Users can delete own avatar objects" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid()::text);

-- Ensure RLS is enabled (it is by default in InsForge).
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;