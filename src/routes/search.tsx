import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search as SearchIcon, Calendar, BookOpen, FileText, HelpCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  head: () => ({ meta: [{ title: "Qidiruv — Milliy Tarbiya" }] }),
  component: SearchPage,
});

type Hit = {
  id: string;
  kind: "news" | "resource" | "document" | "quiz";
  title: string;
  excerpt?: string;
};

function SearchPage() {
  const { lang, t } = useI18n();
  const { q } = Route.useSearch();
  const [input, setInput] = useState(q);
  const [results, setResults] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setInput(q); }, [q]);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const term = `%${q}%`;
    Promise.all([
      supabase.from("news").select("id,title_uz,title_ru,excerpt_uz,excerpt_ru")
        .or(`title_uz.ilike.${term},title_ru.ilike.${term},excerpt_uz.ilike.${term},excerpt_ru.ilike.${term}`).limit(20),
      supabase.from("resources").select("id,title_uz,title_ru,description_uz,description_ru")
        .or(`title_uz.ilike.${term},title_ru.ilike.${term},description_uz.ilike.${term},description_ru.ilike.${term}`).limit(20),
      supabase.from("documents").select("id,title_uz,title_ru,description_uz,description_ru")
        .or(`title_uz.ilike.${term},title_ru.ilike.${term},description_uz.ilike.${term},description_ru.ilike.${term}`).limit(20),
      supabase.from("quizzes").select("id,title_uz,title_ru,description_uz,description_ru")
        .or(`title_uz.ilike.${term},title_ru.ilike.${term},description_uz.ilike.${term},description_ru.ilike.${term}`).limit(20),
    ]).then(([n, r, d, qz]) => {
      const out: Hit[] = [];
      (n.data || []).forEach((x: any) => out.push({ id: x.id, kind: "news", title: pickLang(x, lang, "title"), excerpt: pickLang(x, lang, "excerpt") }));
      (r.data || []).forEach((x: any) => out.push({ id: x.id, kind: "resource", title: pickLang(x, lang, "title"), excerpt: pickLang(x, lang, "description") }));
      (d.data || []).forEach((x: any) => out.push({ id: x.id, kind: "document", title: pickLang(x, lang, "title"), excerpt: pickLang(x, lang, "description") }));
      (qz.data || []).forEach((x: any) => out.push({ id: x.id, kind: "quiz", title: pickLang(x, lang, "title"), excerpt: pickLang(x, lang, "description") }));
      setResults(out);
      setLoading(false);
    });
  }, [q, lang]);

  const iconFor = (k: Hit["kind"]) => k === "news" ? Calendar : k === "resource" ? BookOpen : k === "document" ? FileText : HelpCircle;
  const labelFor = (k: Hit["kind"]) => k === "news" ? t("news") : k === "resource" ? t("resources") : k === "document" ? t("documents") : t("quizzes");
  const linkFor = (h: Hit) => {
    if (h.kind === "news") return { to: "/news/$id" as const, params: { id: h.id } };
    if (h.kind === "resource") return { to: "/resources/$id" as const, params: { id: h.id } };
    if (h.kind === "quiz") return { to: "/quizzes/$id" as const, params: { id: h.id } };
    return { to: "/documents" as const, params: {} };
  };

  return (
    <Layout>
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">{lang === "ru" ? "Поиск" : lang === "en" ? "Search" : "Qidiruv"}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const url = new URL(window.location.href);
            url.searchParams.set("q", input);
            window.history.pushState({}, "", url.toString());
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          className="flex gap-2 mb-8"
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={lang === "ru" ? "Что ищете?" : lang === "en" ? "What are you looking for?" : "Nimani qidiryapsiz?"} />
          <Button type="submit"><SearchIcon className="h-4 w-4" /></Button>
        </form>

        {loading && <p className="text-muted-foreground">{t("loading")}</p>}
        {!loading && q && !results.length && <p className="text-center text-muted-foreground py-12">{lang === "ru" ? "Ничего не найдено" : lang === "en" ? "Nothing found" : "Hech narsa topilmadi"}</p>}

        <div className="space-y-3">
          {results.map((h) => {
            const Icon = iconFor(h.kind);
            const link = linkFor(h);
            return (
              <Link key={`${h.kind}-${h.id}`} {...(link as any)} className="block bg-card border border-border rounded-xl p-4 hover:shadow-elegant-lg transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground mb-1">{labelFor(h.kind)}</div>
                    <h3 className="font-semibold truncate">{h.title}</h3>
                    {h.excerpt && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{h.excerpt}</p>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
