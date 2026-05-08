
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_uz TEXT NOT NULL,
  title_ru TEXT,
  description_uz TEXT,
  description_ru TEXT,
  kind TEXT NOT NULL DEFAULT 'quiz',
  cover_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_uz TEXT NOT NULL,
  question_ru TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_index INT NOT NULL DEFAULT 0,
  points INT NOT NULL DEFAULT 1,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID,
  display_name TEXT,
  score INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quizzes" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Admins can insert quizzes" ON public.quizzes FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update quizzes" ON public.quizzes FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete quizzes" ON public.quizzes FOR DELETE USING (has_role(auth.uid(),'admin'));

CREATE POLICY "Anyone can view questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Admins can insert questions" ON public.quiz_questions FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update questions" ON public.quiz_questions FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete questions" ON public.quiz_questions FOR DELETE USING (has_role(auth.uid(),'admin'));

CREATE POLICY "Anyone can insert attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view attempts" ON public.quiz_attempts FOR SELECT USING (true);
CREATE POLICY "Admins can delete attempts" ON public.quiz_attempts FOR DELETE USING (has_role(auth.uid(),'admin'));

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions(quiz_id, order_index);
CREATE INDEX idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id, created_at DESC);
