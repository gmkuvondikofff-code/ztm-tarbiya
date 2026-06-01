import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "noname@ztmtarbiya.uz";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "NoName2026@";
const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || "396790";

function AdminLogin() {
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submitCreds = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
        toast.error("Email yoki parol noto'g'ri");
        return;
      }
      setStep(2);
    }, 200);
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code !== ADMIN_CODE) { toast.error("Kod noto'g'ri"); return; }
    sessionStorage.setItem("admin_authed", "1");
    toast.success("Xush kelibsiz!");
    nav({ to: "/admin" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-elegant-lg p-8">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-glow mb-4">
            {step === 1 ? <Shield className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
          </div>
          <h1 className="text-2xl font-bold">{step === 1 ? "Admin kirish" : "Tasdiqlash kodi"}</h1>
          <p className="text-sm text-muted-foreground mt-1">{step === 1 ? "Email va parolingizni kiriting" : "6 xonali kodni kiriting"}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={submitCreds} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <Label htmlFor="password">Parol</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "..." : "Davom etish"}</Button>
          </form>
        ) : (
          <form onSubmit={submitCode} className="space-y-4">
            <div>
              <Label htmlFor="code">6 xonali kod</Label>
              <Input id="code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required autoFocus className="text-center text-2xl tracking-[0.5em] font-mono" />
            </div>
            <Button type="submit" className="w-full" disabled={code.length !== 6}>Kirish</Button>
          </form>
        )}
      </div>
    </div>
  );
}
