import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { NewsCard } from "./index";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "Yangiliklar — Milliy Tarbiya" }, { name: "description", content: "Milliy tarbiya bo'yicha so'nggi yangiliklar va voqealar" }] }),
  component: NewsList,
});

function NewsList() {
  const { t } = useI18n();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("news").select("*").order("published_at", { ascending: false })
      .then(({ data }) => { setNews(data || []); setLoading(false); });
  }, []);

  return (
    <Layout>
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">{t("news")}</h1>
        <p className="text-muted-foreground mb-8">{t("allNews")}</p>
        {loading && <p className="text-muted-foreground">{t("loading")}</p>}
        {!loading && !news.length && <p className="text-muted-foreground text-center py-16">{t("noNews")}</p>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((n) => <NewsCard key={n.id} item={n} />)}
        </div>
      </section>
    </Layout>
  );
}
