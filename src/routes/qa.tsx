import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/qa")({
  head: () => ({ meta: [{ title: "Savol-Javob — Milliy Tarbiya AI" }, { name: "description", content: "Milliy tarbiya bo'yicha AI yordamchidan savol so'rang" }] }),
  component: QA,
});

function QA() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      const model = import.meta.env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile";
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      });

      if (resp.status === 429) { toast.error("Juda ko'p so'rov, biroz kuting"); setLoading(false); return; }
      if (!resp.ok || !resp.body) { toast.error("Xatolik"); setLoading(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) {
              acc += c;
              setMessages((m) => m.map((x, i) => i === m.length - 1 ? { ...x, content: acc } : x));
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      toast.error("Bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-glow mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t("aiHelper")}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("aiIntro")}</p>
        </div>

        <div className="bg-card border border-border rounded-3xl shadow-elegant overflow-hidden flex flex-col" style={{ height: "60vh" }}>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <Sparkles className="h-10 w-10 mb-3 text-primary/40" />
                <p className="max-w-sm text-sm">{t("aiPlaceholder")}</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {m.role === "assistant" ? (
                    <div className="prose-content text-sm">
                      <ReactMarkdown>{m.content || "..."}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start"><div className="bg-muted rounded-2xl px-4 py-3"><Loader2 className="h-4 w-4 animate-spin" /></div></div>
            )}
          </div>

          <div className="border-t border-border p-3 bg-background/50">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={t("aiPlaceholder")}
                className="resize-none min-h-[44px] max-h-32"
                rows={1}
                disabled={loading}
              />
              <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="h-11 w-11 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
