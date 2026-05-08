import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, X, Trophy, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/quizzes/$id")({
  component: QuizPlay,
});

function QuizPlay() {
  const { id } = useParams({ from: "/quizzes/$id" });
  const { lang } = useI18n();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: q } = await supabase.from("quizzes").select("*").eq("id", id).maybeSingle();
      const { data: qs } = await supabase.from("quiz_questions").select("*").eq("quiz_id", id).order("order_index");
      setQuiz(q);
      setQuestions(qs || []);
      setLoading(false);
    })();
  }, [id]);

  const totalPoints = questions.reduce((s, q) => s + (q.points || 1), 0);
  const score = questions.reduce((s, q, i) => s + (answers[i] === q.correct_index ? (q.points || 1) : 0), 0);

  const pick = (idx: number) => {
    const next = [...answers]; next[step] = idx; setAnswers(next);
    setTimeout(() => {
      if (step + 1 < questions.length) setStep(step + 1);
      else finish(next);
    }, 350);
  };

  const finish = async (final: number[]) => {
    const finalScore = questions.reduce((s, q, i) => s + (final[i] === q.correct_index ? (q.points || 1) : 0), 0);
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("quiz_attempts").insert({ quiz_id: id, user_id: user?.id || null, display_name: name || (lang === "ru" ? "Аноним" : "Anonim"), score: finalScore, total: totalPoints });
    setSubmitting(false);
    setDone(true);
  };

  if (loading) return <Layout><div className="container mx-auto p-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div></Layout>;
  if (!quiz) return <Layout><div className="container mx-auto p-10 text-center">Topilmadi</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/quizzes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4" />{lang === "ru" ? "Назад" : "Orqaga"}</Link>

        {!started && !done && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-elegant">
            <Trophy className="h-14 w-14 mx-auto text-primary mb-3" />
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">{pickLang(quiz, lang, "title")}</h1>
            <p className="text-muted-foreground mb-5">{pickLang(quiz, lang, "description")}</p>
            <p className="text-sm mb-5">{questions.length} {lang === "ru" ? "вопросов" : "savol"} · {totalPoints} {lang === "ru" ? "баллов" : "ball"}</p>
            <div className="max-w-sm mx-auto space-y-3">
              <Input placeholder={lang === "ru" ? "Ваше имя (необязательно)" : "Ismingiz (ixtiyoriy)"} value={name} onChange={(e) => setName(e.target.value)} />
              <Button className="w-full" size="lg" onClick={() => setStarted(true)} disabled={questions.length === 0}>{lang === "ru" ? "Начать" : "Boshlash"}</Button>
            </div>
          </div>
        )}

        {started && !done && questions[step] && (
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-elegant">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
              <span>{step + 1} / {questions.length}</span>
              <span>{questions[step].points || 1} {lang === "ru" ? "балл" : "ball"}</span>
            </div>
            <Progress value={((step) / questions.length) * 100} className="mb-6" />
            <h2 className="text-xl md:text-2xl font-bold mb-6">{pickLang(questions[step], lang, "question")}</h2>
            <div className="space-y-3">
              {(questions[step].options as string[]).map((opt, i) => {
                const picked = answers[step] === i;
                const correct = questions[step].correct_index === i;
                const showResult = answers[step] !== undefined;
                return (
                  <button
                    key={i}
                    disabled={showResult}
                    onClick={() => pick(i)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      showResult
                        ? correct ? "border-green-500 bg-green-500/10" : picked ? "border-destructive bg-destructive/10" : "border-border opacity-60"
                        : "border-border hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    <span className="font-medium">{opt}</span>
                    {showResult && correct && <Check className="h-5 w-5 text-green-600" />}
                    {showResult && picked && !correct && <X className="h-5 w-5 text-destructive" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {done && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-elegant">
            <Trophy className="h-16 w-16 mx-auto text-primary mb-3" />
            <h2 className="text-2xl font-display font-bold mb-2">{lang === "ru" ? "Готово!" : "Tugadi!"}</h2>
            <p className="text-muted-foreground mb-4">{lang === "ru" ? "Ваш результат" : "Sizning natijangiz"}</p>
            <div className="text-5xl font-bold text-primary mb-2">{score} / {totalPoints}</div>
            <p className="text-muted-foreground mb-6">{Math.round((score / totalPoints) * 100)}%</p>
            {submitting && <Loader2 className="h-4 w-4 animate-spin mx-auto mb-3" />}
            <div className="flex gap-2 justify-center">
              <Button onClick={() => { setStep(0); setAnswers([]); setDone(false); setStarted(false); }}>{lang === "ru" ? "Ещё раз" : "Yana"}</Button>
              <Button variant="outline" asChild><Link to="/quizzes">{lang === "ru" ? "К списку" : "Ro'yxatga"}</Link></Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
