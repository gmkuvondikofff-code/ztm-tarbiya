import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (r) => r.location.pathname });

  const links = [
    { to: "/", label: t("home") },
    { to: "/news", label: t("news") },
    { to: "/resources", label: t("resources") },
    { to: "/documents", label: t("documents") },
    { to: "/quizzes", label: t("quizzes") },
    { to: "/qa", label: t("qa") },
    { to: "/contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 font-display font-bold min-w-0">
          <img src={logo} alt="Logo" className="h-10 w-10 rounded-lg object-contain bg-white shadow-glow" />
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-bold">Zamonaviy ta'lim</span>
            <span className="text-[11px] text-muted-foreground font-medium">va milliy tarbiya</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  active ? "text-primary bg-primary/10" : "text-foreground/70 hover:text-foreground hover:bg-muted"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "uz" ? "ru" : "uz")}
            className="gap-1.5"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase">{lang}</span>
          </Button>
          <button
            className="lg:hidden p-2 rounded-md hover:bg-muted"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container mx-auto flex flex-col py-2 px-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium border-b border-border/40 last:border-0"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
