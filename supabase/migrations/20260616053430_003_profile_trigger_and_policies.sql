-- Auto-create profile row when a new auth user is created
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS policies exist for profiles
DO $$
BEGIN
  -- SELECT own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'select_own_profile'
  ) THEN
    EXECUTE 'CREATE POLICY select_own_profile ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id)';
  END IF;

  -- INSERT own profile (belt-and-suspenders fallback)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'insert_own_profile'
  ) THEN
    EXECUTE 'CREATE POLICY insert_own_profile ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id)';
  END IF;

  -- UPDATE own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'update_own_profile'
  ) THEN
    EXECUTE 'CREATE POLICY update_own_profile ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id)';
  END IF;
END $$;
