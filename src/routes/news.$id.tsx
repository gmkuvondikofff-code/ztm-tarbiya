import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Eye, User, ChevronDown } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";

export const Route = createFileRoute("/news/$id")({
  component: NewsDetail,
});

function NewsDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("news").select("*").eq("id", id).maybeSingle();
      setItem(data);
      setLoading(false);
      if (data) {
        await supabase.from("news").update({ views: (data.views || 0) + 1 }).eq("id", id);
      }
    })();
  }, [id]);

  if (loading) return <Layout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">{t("loading")}</div></Layout>;
  if (!item) return <Layout><div className="container mx-auto px-4 py-20 text-center">{t("noNews")}</div></Layout>;

  const title = pickLang(item, lang, "title");
  const excerpt = pickLang(item, lang, "excerpt");
  const content = pickLang(item, lang, "content");

  return (
    <Layout>
      <article className="container mx-auto px-4 py-8 md:py-10 max-w-4xl">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/news"><ArrowLeft className="h-4 w-4 mr-1" /> {t("backToList")}</Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge>{item.category}</Badge>
          {item.is_important && <Badge className="bg-warning text-warning-foreground">{t("important")}</Badge>}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight mb-4 text-balance">{title}</h1>

        {excerpt && <p className="text-base md:text-lg text-muted-foreground mb-6">{excerpt}</p>}

        <div className="flex flex-wrap items-center gap-4 md:gap-5 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(item.published_at).toLocaleDateString(lang === "ru" ? "ru-RU" : "uz-UZ", { year: "numeric", month: "long", day: "numeric" })}</span>
          <span className="flex items-center gap-1.5"><User className="h-4 w-4" />Admin</span>
          <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{item.views} {t("views")}</span>
        </div>

        {item.cover_image && (
          <img src={item.cover_image} alt={title} className="w-full rounded-2xl mb-6 shadow-elegant" />
        )}

        {!expanded ? (
          <div className="flex justify-center my-8">
            <Button size="lg" onClick={() => setExpanded(true)}>
              {t("readMore")} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="prose-content text-base md:text-lg whitespace-pre-wrap">{content}</div>
            {item.images && item.images.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-4 mt-10">
                {item.images.map((src: string, i: number) => (
                  <img key={i} src={src} alt="" className="rounded-xl w-full shadow-elegant" />
                ))}
              </div>
            )}
          </>
        )}
      </article>
    </Layout>
  );
}
