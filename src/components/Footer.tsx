import { Link } from "@tanstack/react-router";
import { Phone, Send, Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-20 border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
              <Shield className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-lg">Milliy Tarbiya</span>
          </div>
          <p className="text-sm text-sidebar-foreground/70 max-w-sm">{t("footerDesc")}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">{t("contactUs")}</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="tel:+998901234567" className="flex items-center gap-2 text-sidebar-foreground/80 hover:text-sidebar-primary">
                <Phone className="h-4 w-4" /> +998 90 123 45 67
              </a>
            </li>
            <li>
              <a href="https://t.me/milliytarbiya" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sidebar-foreground/80 hover:text-sidebar-primary">
                <Send className="h-4 w-4" /> @milliytarbiya
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">{t("home")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/news" className="text-sidebar-foreground/80 hover:text-sidebar-primary">{t("news")}</Link></li>
            <li><Link to="/resources" className="text-sidebar-foreground/80 hover:text-sidebar-primary">{t("resources")}</Link></li>
            <li><Link to="/documents" className="text-sidebar-foreground/80 hover:text-sidebar-primary">{t("documents")}</Link></li>
            <li><Link to="/qa" className="text-sidebar-foreground/80 hover:text-sidebar-primary">{t("qa")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sidebar-border">
        <div className="container mx-auto px-4 py-4 text-xs text-sidebar-foreground/60 text-center">
          © {new Date().getFullYear()} Milliy Tarbiya. {t("rights")}.
        </div>
      </div>
    </footer>
  );
}
