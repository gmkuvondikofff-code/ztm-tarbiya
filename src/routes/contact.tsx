import { createFileRoute } from "@tanstack/react-router";
import { Phone, Send, MapPin, Mail } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Aloqa — Milliy Tarbiya" }, { name: "description", content: "Biz bilan bog'laning: telefon, Telegram, manzil" }] }),
  component: Contact,
});

function Contact() {
  const { t } = useI18n();
  const items = [
    { icon: Phone, label: t("phone"), value: "+998 90 123 45 67", href: "tel:+998901234567" },
    { icon: Send, label: "Telegram", value: "@milliytarbiya", href: "https://t.me/milliytarbiya" },
    { icon: Mail, label: "Email", value: "info@milliytarbiya.uz", href: "mailto:info@milliytarbiya.uz" },
  ];
  return (
    <Layout>
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">{t("contactUs")}</h1>
        <p className="text-muted-foreground mb-10">Savol yoki takliflaringiz bo'lsa, bog'laning</p>

        <div className="grid md:grid-cols-3 gap-5">
          {items.map((it) => (
            <a key={it.label} href={it.href} target="_blank" rel="noreferrer" className="group bg-card border border-border rounded-2xl p-6 shadow-elegant hover:shadow-glow hover:-translate-y-1 transition-all">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground mb-4 shadow-glow">
                <it.icon className="h-5 w-5" />
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{it.label}</div>
              <div className="font-semibold text-lg group-hover:text-primary transition-colors">{it.value}</div>
            </a>
          ))}
        </div>

        <div className="mt-10 bg-gradient-subtle border border-border rounded-3xl p-8 text-center">
          <MapPin className="h-8 w-8 mx-auto text-primary mb-3" />
          <p className="text-muted-foreground">Toshkent shahri, O'zbekiston</p>
        </div>
      </section>
    </Layout>
  );
}
