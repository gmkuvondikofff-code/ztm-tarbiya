import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, X, Trophy, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";

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
  const [result, setResult] = useState<{ score: number; total: number; correct: number[] } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: q } = await supabase.from("quizzes").select("*").eq("id", id).maybeSingle();
      const { data: qs } = await supabase.rpc("get_quiz_questions_public", { p_quiz_id: id });
      setQuiz(q);
      setQuestions((qs as any[]) || []);
      setLoading(false);
    })();
  }, [id]);

  const totalPoints = questions.reduce((s, q) => s + (q.points || 1), 0);

  const pick = (idx: number) => {
    const next = [...answers]; next[step] = idx; setAnswers(next);
    setTimeout(() => {
      if (step + 1 < questions.length) setStep(step + 1);
      else finish(next);
    }, 250);
  };

  const finish = async (final: number[]) => {
    setSubmitting(true);
    const { data, error } = await supabase.rpc("submit_quiz_attempt", {
      p_quiz_id: id,
      p_display_name: name || (lang === "ru" ? "Аноним" : "Anonim"),
      p_answers: final,
    });
    setSubmitting(false);
    if (error || !data || !data[0]) {
      setResult({ score: 0, total: totalPoints, correct: [] });
    } else {
      const row: any = data[0];
      setResult({ score: row.score, total: row.total, correct: (row.correct_indexes as number[]) || [] });
    }
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
              <Input placeholder={lang === "ru" ? "Ваше имя (необязательно)" : "Ismingiz (ixtiyoriy)"} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
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
                const showResult = answers[step] !== undefined;
                return (
                  <button
                    key={i}
                    disabled={showResult}
                    onClick={() => pick(i)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      showResult
                        ? picked ? "border-primary bg-primary/10" : "border-border opacity-60"
                        : "border-border hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    <span className="font-medium">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {done && result && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-elegant">
            <Trophy className="h-16 w-16 mx-auto text-primary mb-3" />
            <h2 className="text-2xl font-display font-bold mb-2">{lang === "ru" ? "Готово!" : "Tugadi!"}</h2>
            <p className="text-muted-foreground mb-4">{lang === "ru" ? "Ваш результат" : "Sizning natijangiz"}</p>
            <div className="text-5xl font-bold text-primary mb-2">{result.score} / {result.total}</div>
            <p className="text-muted-foreground mb-6">{result.total > 0 ? Math.round((result.score / result.total) * 100) : 0}%</p>

            {result.correct.length > 0 && (
              <div className="text-left mb-6 space-y-3">
                {questions.map((q, qi) => {
                  const correctIdx = result.correct[qi];
                  const myAns = answers[qi];
                  return (
                    <div key={q.id} className="p-3 rounded-lg border border-border">
                      <div className="text-sm font-medium mb-2">{qi + 1}. {pickLang(q, lang, "question")}</div>
                      <div className="space-y-1">
                        {(q.options as string[]).map((opt, oi) => {
                          const isCorrect = oi === correctIdx;
                          const isMine = oi === myAns;
                          return (
                            <div key={oi} className={`text-sm px-2 py-1 rounded flex items-center justify-between ${isCorrect ? "bg-green-500/10 text-green-700 dark:text-green-400" : isMine ? "bg-destructive/10 text-destructive" : "text-muted-foreground"}`}>
                              <span>{opt}</span>
                              {isCorrect && <Check className="h-4 w-4" />}
                              {isMine && !isCorrect && <X className="h-4 w-4" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {submitting && <Loader2 className="h-4 w-4 animate-spin mx-auto mb-3" />}
            <div className="flex gap-2 justify-center">
              <Button onClick={() => { setStep(0); setAnswers([]); setDone(false); setStarted(false); setResult(null); }}>{lang === "ru" ? "Ещё раз" : "Yana"}</Button>
              <Button variant="outline" asChild><Link to="/quizzes">{lang === "ru" ? "К списку" : "Ro'yxatga"}</Link></Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
