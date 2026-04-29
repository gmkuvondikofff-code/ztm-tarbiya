import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink, Download, BookOpen } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [{ title: "Resurslar — Milliy Tarbiya" }, { name: "description", content: "Milliy tarbiya bo'yicha foydali resurslar va materiallar" }] }),
  component: Resources,
});

function Resources() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("resources").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setItems(data || []));
  }, []);

  return (
    <Layout>
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">{t("resources")}</h1>
        <p className="text-muted-foreground mb-8">Foydali materiallar to'plami</p>

        {!items.length && <p className="text-center text-muted-foreground py-16">Hozircha resurslar yo'q</p>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-2xl p-6 shadow-elegant hover:shadow-elegant-lg transition-all">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{pickLang(r, lang, "title")}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{pickLang(r, lang, "description")}</p>
              <div className="flex gap-2">
                {r.file_url && (
                  <Button asChild size="sm" variant="default">
                    <a href={r.file_url} target="_blank" rel="noreferrer"><Download className="h-4 w-4 mr-1" />{t("download")}</a>
                  </Button>
                )}
                {r.external_url && (
                  <Button asChild size="sm" variant="outline">
                    <a href={r.external_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-1" />{t("open")}</a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
