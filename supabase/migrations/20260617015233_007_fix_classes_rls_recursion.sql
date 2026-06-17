-- Drop the recursive select_classes policy (subquery on class_memberships causes infinite recursion)
DROP POLICY IF EXISTS "select_classes" ON public.classes;

-- Replace with a simple policy: all authenticated users can read all classes
-- (needed so students can see classes when joining by code, and for joins from class_memberships)
CREATE POLICY "select_classes" ON public.classes
  FOR SELECT TO authenticated
  USING (true);

-- Clean up duplicate policies left from earlier migrations
DROP POLICY IF EXISTS "insert_classes" ON public.classes;
DROP POLICY IF EXISTS "update_classes" ON public.classes;
DROP POLICY IF EXISTS "delete_classes" ON public.classes;
