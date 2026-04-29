import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Newspaper, BookOpen, FileText, LayoutDashboard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const nav = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (path === "/admin/login") { setReady(true); return; }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { nav({ to: "/admin/login" }); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (!roles?.some((r: any) => r.role === "admin")) {
        await supabase.auth.signOut();
        nav({ to: "/admin/login" });
        return;
      }
      setReady(true);
    })();
  }, [path]);

  if (path === "/admin/login") return <Outlet />;
  if (!ready) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Yuklanmoqda...</div>;

  const logout = async () => { await supabase.auth.signOut(); toast.success("Chiqdingiz"); nav({ to: "/admin/login" }); };

  const links = [
    { to: "/admin", label: "Boshqaruv", icon: LayoutDashboard, exact: true },
    { to: "/admin/news", label: "Yangiliklar", icon: Newspaper },
    { to: "/admin/resources", label: "Resurslar", icon: BookOpen },
    { to: "/admin/documents", label: "Hujjatlar", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-60 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-5 border-b border-sidebar-border flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero"><Shield className="h-5 w-5" /></div>
          <span className="font-display font-bold">Admin Panel</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => {
            const active = l.exact ? path === l.to : path.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"}`}>
                <l.icon className="h-4 w-4" /> {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Button onClick={logout} variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary-foreground"><LogOut className="h-4 w-4 mr-2" />Chiqish</Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
