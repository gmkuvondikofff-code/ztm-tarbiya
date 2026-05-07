import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, ExternalLink, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";

export const Route = createFileRoute("/resources/$id")({
  component: ResourceReader,
});

type Mode = "book" | "pdf" | "image" | "office" | "none";

function ResourceReader() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookText, setBookText] = useState<string>("");
  const [parsing, setParsing] = useState(false);
  const [page, setPage] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState({ chars: 1800 });

  useEffect(() => {
    supabase.from("resources").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => { setItem(data); setLoading(false); });
  }, [id]);

  const url: string = item?.file_url || item?.external_url || "";
  const lower = url.toLowerCase();
  const isPdf = lower.endsWith(".pdf");
  const isImage = /\.(png|jpe?g|gif|webp|svg)$/.test(lower);
  const isDocx = lower.endsWith(".docx");
  const isTxt = lower.endsWith(".txt");
  const isOffice = !isPdf && !isImage && !isDocx && !isTxt && !!url;

  const mode: Mode = !url ? "none" : isPdf ? "pdf" : isImage ? "image" : (isDocx || isTxt) ? "book" : "office";

  // Load and parse book content
  useEffect(() => {
    if (mode !== "book" || !url) return;
    setParsing(true);
    (async () => {
      try {
        const res = await fetch(url);
        if (isDocx) {
          const buf = await res.arrayBuffer();
          const mammoth = await import("mammoth/mammoth.browser");
          const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
          setBookText(value);
        } else {
          const txt = await res.text();
          setBookText(txt);
        }
      } catch (e) {
        setBookText("Faylni o'qib bo'lmadi");
      } finally {
        setParsing(false);
      }
    })();
  }, [url, mode, isDocx]);

  // Determine chars per page based on viewport
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // approx: smaller screen => fewer chars
      const chars = Math.max(900, Math.min(2400, Math.floor((w * h) / 700)));
      setPageSize({ chars });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // Split text into pages by paragraphs, packing up to chars per page
  const pages = useMemo(() => {
    if (!bookText) return [] as string[];
    const paragraphs = bookText.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
    const out: string[] = [];
    let cur = "";
    for (const p of paragraphs) {
      if ((cur + "\n\n" + p).length > pageSize.chars && cur) {
        out.push(cur);
        cur = p;
      } else {
        cur = cur ? cur + "\n\n" + p : p;
      }
      // If a single paragraph is huge, hard-split
      while (cur.length > pageSize.chars * 1.4) {
        out.push(cur.slice(0, pageSize.chars));
        cur = cur.slice(pageSize.chars);
      }
    }
    if (cur) out.push(cur);
    return out;
  }, [bookText, pageSize.chars]);

  useEffect(() => { setPage(0); }, [pages.length]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (mode !== "book") return;
      if (e.key === "ArrowRight") setPage((p) => Math.min(pages.length - 1, p + 1));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(0, p - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pages.length, mode]);

  if (loading) return <Layout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">{t("loading")}</div></Layout>;
  if (!item) return <Layout><div className="container mx-auto px-4 py-20 text-center">Topilmadi</div></Layout>;

  const officeViewer = mode === "office" ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` : "";

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

        {mode === "book" && (
          <div className="bg-card border border-border rounded-2xl shadow-elegant overflow-hidden">
            {parsing ? (
              <div className="flex items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> {t("loading")}
              </div>
            ) : (
              <>
                <div
                  ref={measureRef}
                  className="prose prose-lg dark:prose-invert max-w-none p-6 md:p-12 min-h-[70vh] whitespace-pre-wrap leading-relaxed font-serif text-[1.05rem] md:text-lg"
                  style={{ columnCount: 1 }}
                >
                  {pages[page] || ""}
                </div>
                <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-muted/40">
                  <Button size="sm" variant="ghost" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Oldingi
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {pages.length ? `${page + 1} / ${pages.length}` : "—"}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))} disabled={page >= pages.length - 1}>
                    Keyingi <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {mode !== "book" && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-elegant" style={{ height: "80vh" }}>
            {mode === "pdf" && <iframe src={url} title={pickLang(item, lang, "title")} className="w-full h-full" />}
            {mode === "image" && <div className="w-full h-full overflow-auto flex items-center justify-center bg-muted"><img src={url} alt="" className="max-w-full" /></div>}
            {mode === "office" && <iframe src={officeViewer} title={pickLang(item, lang, "title")} className="w-full h-full" />}
            {mode === "none" && <div className="p-10 text-center text-muted-foreground">Fayl yuklanmagan</div>}
          </div>
        )}
      </section>
    </Layout>
  );
}
