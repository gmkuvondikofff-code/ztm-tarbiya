import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";

export const Route = createFileRoute("/resources/$id")({
  component: ResourceReader,
});

function ResourceReader() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("resources").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => { setItem(data); setLoading(false); });
  }, [id]);

  if (loading) return <Layout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">{t("loading")}</div></Layout>;
  if (!item) return <Layout><div className="container mx-auto px-4 py-20 text-center">Topilmadi</div></Layout>;

  const url: string = item.file_url || item.external_url || "";
  const lower = url.toLowerCase();
  const isPdf = lower.endsWith(".pdf");
  const isImage = /\.(png|jpe?g|gif|webp|svg)$/.test(lower);
  const isOfficeOrOther = !isPdf && !isImage && url;
  const officeViewer = isOfficeOrOther ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` : "";

  return (
    <Layout>
      <section className="container mx-auto px-4 py-6 md:py-10 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/resources"><ArrowLeft className="h-4 w-4 mr-1" /> {t("library")}</Link>
          </Button>
          <div className="flex gap-2">
            {item.file_url && (
              <Button asChild size="sm" variant="outline">
                <a href={item.file_url} target="_blank" rel="noreferrer" download><Download className="h-4 w-4 mr-1" /> {t("download")}</a>
              </Button>
            )}
            {item.external_url && (
              <Button asChild size="sm" variant="outline">
                <a href={item.external_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-1" /> {t("open")}</a>
              </Button>
            )}
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">{pickLang(item, lang, "title")}</h1>
        {pickLang(item, lang, "description") && (
          <p className="text-muted-foreground mb-5">{pickLang(item, lang, "description")}</p>
        )}

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-elegant" style={{ height: "80vh" }}>
          {isPdf && <iframe src={url} title={pickLang(item, lang, "title")} className="w-full h-full" />}
          {isImage && <div className="w-full h-full overflow-auto flex items-center justify-center bg-muted"><img src={url} alt="" className="max-w-full" /></div>}
          {isOfficeOrOther && <iframe src={officeViewer} title={pickLang(item, lang, "title")} className="w-full h-full" />}
          {!url && <div className="p-10 text-center text-muted-foreground">Fayl yuklanmagan</div>}
        </div>
      </section>
    </Layout>
  );
}
