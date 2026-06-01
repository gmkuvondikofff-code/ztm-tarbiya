
-- Clean data
TRUNCATE TABLE public.quiz_attempts CASCADE;
TRUNCATE TABLE public.quiz_questions CASCADE;
TRUNCATE TABLE public.quizzes CASCADE;
TRUNCATE TABLE public.news CASCADE;
TRUNCATE TABLE public.resources CASCADE;
TRUNCATE TABLE public.documents CASCADE;

-- Remove old admin role for kuvondikofff@gmail.com
DELETE FROM public.user_roles
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'kuvondikofff@gmail.com');
DELETE FROM auth.users WHERE email = 'kuvondikofff@gmail.com';

-- Grant execute on has_role (fix "permission denied for function has_role")
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;

-- Since admin login is hardcoded client-side (no Supabase session), allow public writes on content tables.
-- News
DROP POLICY IF EXISTS "Admins can insert news" ON public.news;
DROP POLICY IF EXISTS "Admins can update news" ON public.news;
DROP POLICY IF EXISTS "Admins can delete news" ON public.news;
CREATE POLICY "Public can insert news" ON public.news FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update news" ON public.news FOR UPDATE USING (true);
CREATE POLICY "Public can delete news" ON public.news FOR DELETE USING (true);
GRANT INSERT, UPDATE, DELETE ON public.news TO anon, authenticated;

-- Resources
DROP POLICY IF EXISTS "Admins can insert resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can update resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can delete resources" ON public.resources;
CREATE POLICY "Public can insert resources" ON public.resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update resources" ON public.resources FOR UPDATE USING (true);
CREATE POLICY "Public can delete resources" ON public.resources FOR DELETE USING (true);
GRANT INSERT, UPDATE, DELETE ON public.resources TO anon, authenticated;

-- Documents
DROP POLICY IF EXISTS "Admins can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can update documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON public.documents;
CREATE POLICY "Public can insert documents" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update documents" ON public.documents FOR UPDATE USING (true);
CREATE POLICY "Public can delete documents" ON public.documents FOR DELETE USING (true);
GRANT INSERT, UPDATE, DELETE ON public.documents TO anon, authenticated;

-- Quizzes
DROP POLICY IF EXISTS "Admins can insert quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can update quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can delete quizzes" ON public.quizzes;
CREATE POLICY "Public can insert quizzes" ON public.quizzes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update quizzes" ON public.quizzes FOR UPDATE USING (true);
CREATE POLICY "Public can delete quizzes" ON public.quizzes FOR DELETE USING (true);
GRANT INSERT, UPDATE, DELETE ON public.quizzes TO anon, authenticated;

-- Quiz questions
DROP POLICY IF EXISTS "Admins can insert questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins can update questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins can view questions" ON public.quiz_questions;
CREATE POLICY "Public can view questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Public can insert questions" ON public.quiz_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update questions" ON public.quiz_questions FOR UPDATE USING (true);
CREATE POLICY "Public can delete questions" ON public.quiz_questions FOR DELETE USING (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_questions TO anon, authenticated;

-- Quiz attempts: allow public delete for admin cleanup
DROP POLICY IF EXISTS "Admins can delete attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Admins can view all attempts" ON public.quiz_attempts;
CREATE POLICY "Public can view attempts" ON public.quiz_attempts FOR SELECT USING (true);
CREATE POLICY "Public can delete attempts" ON public.quiz_attempts FOR DELETE USING (true);
GRANT SELECT, DELETE ON public.quiz_attempts TO anon, authenticated;
