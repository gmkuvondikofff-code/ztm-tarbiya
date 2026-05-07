import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Download, BookOpen, Library, BookMarked } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [{ title: "Kutubxona — Zamonaviy ta'lim" }, { name: "description", content: "Foydali resurslar, kitoblar va materiallar kutubxonasi" }] }),
  component: Resources,
});

function Resources() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<any[]>([]);
  const [active, setActive] = useState<string>("all");

  useEffect(() => {
    supabase.from("resources").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setItems(data || []));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((r) => r.category && set.add(r.category));
    return ["all", ...Array.from(set)];
  }, [items]);

  const filtered = active === "all" ? items : items.filter((r) => r.category === active);

  return (
    <Layout>
      <section className="container mx-auto px-4 py-10 md:py-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-hero text-white shadow-glow">
            <Library className="h-5 w-5" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{t("library")}</h1>
        </div>
        <p className="text-muted-foreground mb-6">{t("resources")}</p>

        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"
                }`}
              >
                {c === "all" ? t("allCategories") : c}
              </button>
            ))}
          </div>
        )}

        {!filtered.length && <p className="text-center text-muted-foreground py-16">Hozircha resurslar yo'q</p>}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filtered.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-elegant hover:shadow-elegant-lg transition-all flex flex-col">
              {r.cover_image ? (
                <img src={r.cover_image} alt="" className="w-full aspect-[16/10] object-cover" />
              ) : (
                <div className="w-full aspect-[16/10] bg-gradient-subtle flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary/40" />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-display font-bold text-lg mb-2 line-clamp-2">{pickLang(r, lang, "title")}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{pickLang(r, lang, "description")}</p>
                <div className="flex gap-2 flex-wrap">
                  {(r.file_url || r.external_url) && (
                    <Button asChild size="sm">
                      <Link to="/resources/$id" params={{ id: r.id }}>
                        <BookMarked className="h-4 w-4 mr-1" /> {t("read")}
                      </Link>
                    </Button>
                  )}
                  {r.file_url && (
                    <Button asChild size="sm" variant="outline">
                      <a href={r.file_url} target="_blank" rel="noreferrer" download><Download className="h-4 w-4" /></a>
                    </Button>
                  )}
                  {r.external_url && !r.file_url && (
                    <Button asChild size="sm" variant="outline">
                      <a href={r.external_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
