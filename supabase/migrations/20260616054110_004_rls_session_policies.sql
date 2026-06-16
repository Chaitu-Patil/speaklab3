-- RLS policies for speaking_sessions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='speaking_sessions' AND policyname='select_own_sessions') THEN
    EXECUTE 'CREATE POLICY select_own_sessions ON public.speaking_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='speaking_sessions' AND policyname='insert_own_sessions') THEN
    EXECUTE 'CREATE POLICY insert_own_sessions ON public.speaking_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='speaking_sessions' AND policyname='update_own_sessions') THEN
    EXECUTE 'CREATE POLICY update_own_sessions ON public.speaking_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='speaking_sessions' AND policyname='delete_own_sessions') THEN
    EXECUTE 'CREATE POLICY delete_own_sessions ON public.speaking_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- RLS policies for progress_scores
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='progress_scores' AND policyname='select_own_scores') THEN
    EXECUTE 'CREATE POLICY select_own_scores ON public.progress_scores FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='progress_scores' AND policyname='insert_own_scores') THEN
    EXECUTE 'CREATE POLICY insert_own_scores ON public.progress_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='progress_scores' AND policyname='update_own_scores') THEN
    EXECUTE 'CREATE POLICY update_own_scores ON public.progress_scores FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

-- RLS policies for classes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='classes' AND policyname='select_classes') THEN
    EXECUTE 'CREATE POLICY select_classes ON public.classes FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='classes' AND policyname='insert_own_classes') THEN
    EXECUTE 'CREATE POLICY insert_own_classes ON public.classes FOR INSERT TO authenticated WITH CHECK (auth.uid() = teacher_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='classes' AND policyname='update_own_classes') THEN
    EXECUTE 'CREATE POLICY update_own_classes ON public.classes FOR UPDATE TO authenticated USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='classes' AND policyname='delete_own_classes') THEN
    EXECUTE 'CREATE POLICY delete_own_classes ON public.classes FOR DELETE TO authenticated USING (auth.uid() = teacher_id)';
  END IF;
END $$;

-- RLS policies for class_memberships
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='class_memberships' AND policyname='select_own_memberships') THEN
    EXECUTE 'CREATE POLICY select_own_memberships ON public.class_memberships FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='class_memberships' AND policyname='insert_own_memberships') THEN
    EXECUTE 'CREATE POLICY insert_own_memberships ON public.class_memberships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='class_memberships' AND policyname='delete_own_memberships') THEN
    EXECUTE 'CREATE POLICY delete_own_memberships ON public.class_memberships FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;
