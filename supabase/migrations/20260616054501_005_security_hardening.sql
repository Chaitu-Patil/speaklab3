-- Fix 1 & 3: Mutable search_path on handle_new_user (also fixes public RPC execute issue by redefining)
-- Use SET search_path = '' and fully-qualify all identifiers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      CASE WHEN new.raw_user_meta_data->>'role' IN ('student', 'teacher')
           THEN new.raw_user_meta_data->>'role'
      END,
      'student'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix 2: Revoke public/anon/authenticated execute on handle_new_user so it can't be called via RPC
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Fix 4: Mutable search_path on update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix 5: Replace broad public SELECT on storage.objects (allows listing all files)
-- Drop the permissive "Allow public read" policy
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;

-- Replace with a scoped policy: authenticated users can only SELECT their own folder
-- Videos are stored as {user_id}/{filename}, so folder[1] matches the owner
CREATE POLICY "Users read own videos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);
