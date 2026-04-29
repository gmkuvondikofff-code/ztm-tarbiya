import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Download, ExternalLink } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Hujjatlar — Milliy Tarbiya" }, { name: "description", content: "Rasmiy hujjatlar va me'yoriy-huquqiy aktlar" }] }),
  component: Documents,
});

function Documents() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("documents").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setItems(data || []));
  }, []);

  return (
    <Layout>
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">{t("documents")}</h1>
        <p className="text-muted-foreground mb-8">Rasmiy hujjatlar</p>

        {!items.length && <p className="text-center text-muted-foreground py-16">Hozircha hujjatlar yo'q</p>}

        <div className="space-y-3">
          {items.map((d) => (
            <div key={d.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-elegant hover:shadow-elegant-lg transition-all">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{pickLang(d, lang, "title")}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{pickLang(d, lang, "description")}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {d.file_url && (
                  <Button asChild size="sm">
                    <a href={d.file_url} target="_blank" rel="noreferrer"><Download className="h-4 w-4" /></a>
                  </Button>
                )}
                {d.external_url && (
                  <Button asChild size="sm" variant="outline">
                    <a href={d.external_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
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
