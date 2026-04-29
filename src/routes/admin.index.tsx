import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Newspaper, BookOpen, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState({ news: 0, resources: 0, documents: 0 });
  useEffect(() => {
    (async () => {
      const [n, r, d] = await Promise.all([
        supabase.from("news").select("id", { count: "exact", head: true }),
        supabase.from("resources").select("id", { count: "exact", head: true }),
        supabase.from("documents").select("id", { count: "exact", head: true }),
      ]);
      setStats({ news: n.count || 0, resources: r.count || 0, documents: d.count || 0 });
    })();
  }, []);

  const cards = [
    { label: "Yangiliklar", value: stats.news, icon: Newspaper, color: "bg-primary/10 text-primary" },
    { label: "Resurslar", value: stats.resources, icon: BookOpen, color: "bg-success/10 text-success" },
    { label: "Hujjatlar", value: stats.documents, icon: FileText, color: "bg-warning/10 text-warning" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Boshqaruv paneli</h1>
      <div className="grid md:grid-cols-3 gap-5">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-2xl p-6 shadow-elegant">
            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4 ${c.color}`}><c.icon className="h-5 w-5" /></div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
            <div className="text-3xl font-bold mt-1">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
