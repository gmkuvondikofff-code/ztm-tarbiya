import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListChecks, Gamepad2, Trophy } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";

export const Route = createFileRoute("/quizzes")({
  component: QuizzesPage,
});

function QuizzesPage() {
  const { lang } = useI18n();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (path !== "/quizzes") return;
    (async () => {
      const { data } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false });
      const { data: counts } = await supabase.rpc("get_quiz_question_counts");
      const countMap = new Map<string, number>((counts || []).map((c: any) => [c.quiz_id, Number(c.cnt)]));
      setItems((data || []).map((q: any) => ({ ...q, _count: countMap.get(q.id) || 0 })));
    })();
  }, [path]);

  if (path !== "/quizzes") return <Outlet />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-hero text-white flex items-center justify-center"><Trophy className="h-6 w-6" /></div>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">{lang === "ru" ? "Тесты и игры" : "Testlar va o'yinlar"}</h1>
            <p className="text-muted-foreground">{lang === "ru" ? "Проверь свои знания и заработай баллы" : "Bilimingizni sinab ko'ring va ball to'plang"}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground">{lang === "ru" ? "Пока нет тестов" : "Hali test yo'q"}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((q) => (
              <Link key={q.id} to="/quizzes/$id" params={{ id: q.id }} className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-elegant transition-all hover:-translate-y-1">
                <div className="h-40 bg-gradient-hero flex items-center justify-center">
                  {q.kind === "game" ? <Gamepad2 className="h-16 w-16 text-white/90" /> : <ListChecks className="h-16 w-16 text-white/90" />}
                </div>
                <div className="p-5">
                  <div className="text-xs text-primary font-semibold uppercase mb-2">{q.kind === "game" ? (lang === "ru" ? "Игра" : "O'yin") : "Test"}</div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{pickLang(q, lang, "title")}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{pickLang(q, lang, "description")}</p>
                  <div className="mt-3 text-xs text-muted-foreground">{q.quiz_questions?.[0]?.count || 0} {lang === "ru" ? "вопросов" : "savol"}</div>
                  <Button size="sm" className="mt-4 w-full">{lang === "ru" ? "Начать" : "Boshlash"}</Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
