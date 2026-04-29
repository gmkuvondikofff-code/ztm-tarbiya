import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submitCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error("Email yoki parol noto'g'ri"); return; }
    setStep(2);
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); toast.error("Sessiya yo'q"); return; }
    const { data: prof } = await supabase.from("profiles").select("totp_code").eq("user_id", user.id).maybeSingle();
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = roles?.some((r: any) => r.role === "admin");
    setLoading(false);
    if (!isAdmin) { await supabase.auth.signOut(); toast.error("Sizda admin huquqi yo'q"); setStep(1); return; }
    if (!prof || prof.totp_code !== code) { toast.error("Kod noto'g'ri"); return; }
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
            <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>{loading ? "..." : "Kirish"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
