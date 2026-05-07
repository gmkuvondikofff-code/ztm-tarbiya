import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Calendar, Eye, Sparkles, BookOpen, FileText, MessageCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";
import heroBg from "@/assets/hero-bg.png";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t, lang } = useI18n();
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("news").select("*").order("published_at", { ascending: false }).limit(6)
      .then(({ data }) => setNews(data || []));
  }, []);

  const featured = news[0];
  const rest = news.slice(1);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/70 to-primary/40" />
        </div>
        <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-28">
          <div className="max-w-3xl">
            <Badge className="mb-5 bg-white/15 text-white border-white/20 backdrop-blur hover:bg-white/20">
              <Sparkles className="h-3 w-3 mr-1" /> {t("aiHelper")}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-balance mb-5 leading-[1.05]">
              {t("heroTitle")}
            </h1>
            <p className="text-base md:text-xl text-white/90 mb-8 max-w-2xl">{t("heroSubtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary" className="font-semibold">
                <Link to="/news">{t("news")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                <Link to="/qa">{t("aiHelper")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: t("news"), to: "/news", color: "bg-primary/10 text-primary" },
            { icon: BookOpen, label: t("resources"), to: "/resources", color: "bg-success/10 text-success" },
            { icon: FileText, label: t("documents"), to: "/documents", color: "bg-warning/10 text-warning" },
            { icon: MessageCircle, label: t("aiHelper"), to: "/qa", color: "bg-accent/30 text-accent-foreground" },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="group bg-card border border-border rounded-2xl p-5 shadow-elegant hover:shadow-elegant-lg hover:-translate-y-0.5 transition-all">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl mb-3 ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="font-display font-semibold">{item.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest news */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{t("latestNews")}</h2>
            <p className="text-muted-foreground">{t("heroSubtitle")}</p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/news">{t("allNews")} <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>

        {!news.length && <p className="text-muted-foreground text-center py-12">{t("noNews")}</p>}

        {featured && (
          <Link to="/news/$id" params={{ id: featured.id }} className="group grid lg:grid-cols-2 gap-6 mb-8 bg-card border border-border rounded-3xl overflow-hidden shadow-elegant hover:shadow-elegant-lg transition-all">
            <div className="relative aspect-[16/10] lg:aspect-auto bg-muted overflow-hidden">
              {featured.cover_image ? (
                <img src={featured.cover_image} alt={pickLang(featured, lang, "title")} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full bg-gradient-subtle" />
              )}
              {featured.is_important && (
                <Badge className="absolute top-4 left-4 bg-warning text-warning-foreground">{t("important")}</Badge>
              )}
            </div>
            <div className="p-6 lg:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <Badge variant="secondary">{featured.category}</Badge>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(featured.published_at).toLocaleDateString(lang === "ru" ? "ru-RU" : "uz-UZ")}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{featured.views}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                {pickLang(featured, lang, "title")}
              </h3>
              <p className="text-muted-foreground mb-5 line-clamp-3">
                {pickLang(featured, lang, "excerpt") || pickLang(featured, lang, "content").slice(0, 200)}
              </p>
              <Button className="w-fit">{t("readMore")} <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </Link>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

export function NewsCard({ item }: { item: any }) {
  const { t, lang } = useI18n();
  return (
    <Link to="/news/$id" params={{ id: item.id }} className="group bg-card border border-border rounded-2xl overflow-hidden shadow-elegant hover:shadow-elegant-lg hover:-translate-y-1 transition-all">
      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
        {item.cover_image ? (
          <img src={item.cover_image} alt={pickLang(item, lang, "title")} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-subtle" />
        )}
        {item.is_important && (
          <Badge className="absolute top-3 left-3 bg-warning text-warning-foreground">{t("important")}</Badge>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
          <span>{new Date(item.published_at).toLocaleDateString(lang === "ru" ? "ru-RU" : "uz-UZ")}</span>
        </div>
        <h3 className="font-display font-bold text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {pickLang(item, lang, "title")}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {pickLang(item, lang, "excerpt") || pickLang(item, lang, "content").slice(0, 120)}
        </p>
      </div>
    </Link>
  );
}
