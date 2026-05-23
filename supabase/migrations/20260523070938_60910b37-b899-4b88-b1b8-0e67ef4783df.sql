
-- 1) profiles: add WITH CHECK on UPDATE
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2) quiz_questions: hide correct_index from public reads (admins only direct table access)
DROP POLICY IF EXISTS "Anyone can view questions" ON public.quiz_questions;
CREATE POLICY "Admins can view questions" ON public.quiz_questions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RPC: public-safe question fetch (no correct_index)
CREATE OR REPLACE FUNCTION public.get_quiz_questions_public(p_quiz_id uuid)
RETURNS TABLE (
  id uuid,
  quiz_id uuid,
  question_uz text,
  question_ru text,
  options jsonb,
  points integer,
  order_index integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, quiz_id, question_uz, question_ru, options, points, order_index
  FROM public.quiz_questions
  WHERE quiz_id = p_quiz_id
  ORDER BY order_index;
$$;

-- RPC: counts per quiz
CREATE OR REPLACE FUNCTION public.get_quiz_question_counts()
RETURNS TABLE (quiz_id uuid, cnt bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT quiz_id, COUNT(*)::bigint AS cnt
  FROM public.quiz_questions
  GROUP BY quiz_id;
$$;

-- 3) quiz_attempts: lock down SELECT and INSERT
DROP POLICY IF EXISTS "Anyone can view attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Anyone can insert attempts" ON public.quiz_attempts;

CREATE POLICY "Users can view own attempts" ON public.quiz_attempts
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts" ON public.quiz_attempts
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RPC: submit attempt, server-side scoring
CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  p_quiz_id uuid,
  p_display_name text,
  p_answers jsonb
)
RETURNS TABLE (score integer, total integer, correct_indexes jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score integer := 0;
  v_total integer := 0;
  v_correct jsonb := '[]'::jsonb;
  v_user uuid := auth.uid();
  r record;
  v_ans integer;
  v_name text;
BEGIN
  -- Validate inputs
  IF p_quiz_id IS NULL THEN
    RAISE EXCEPTION 'quiz_id required';
  END IF;
  IF jsonb_typeof(p_answers) <> 'array' THEN
    RAISE EXCEPTION 'answers must be an array';
  END IF;
  v_name := NULLIF(trim(coalesce(p_display_name, '')), '');
  IF v_name IS NULL THEN v_name := 'Anonim'; END IF;
  IF length(v_name) > 80 THEN v_name := substr(v_name, 1, 80); END IF;

  FOR r IN
    SELECT id, correct_index, points, order_index
    FROM public.quiz_questions
    WHERE quiz_id = p_quiz_id
    ORDER BY order_index
  LOOP
    v_total := v_total + COALESCE(r.points, 1);
    v_ans := NULLIF((p_answers ->> r.order_index), '')::int;
    IF v_ans IS NOT NULL AND v_ans = r.correct_index THEN
      v_score := v_score + COALESCE(r.points, 1);
    END IF;
    v_correct := v_correct || to_jsonb(r.correct_index);
  END LOOP;

  INSERT INTO public.quiz_attempts (quiz_id, user_id, display_name, score, total)
  VALUES (p_quiz_id, v_user, v_name, v_score, v_total);

  RETURN QUERY SELECT v_score, v_total, v_correct;
END;
$$;

-- 4) Lock down direct execution of has_role (still usable inside RLS via definer chain)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;

-- Grant execution on new helper RPCs to public roles
GRANT EXECUTE ON FUNCTION public.get_quiz_questions_public(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_quiz_question_counts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(uuid, text, jsonb) TO anon, authenticated;
