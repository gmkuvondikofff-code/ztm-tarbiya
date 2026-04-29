import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/news")({
  component: AdminNews,
});

const empty = { title_uz: "", title_ru: "", excerpt_uz: "", excerpt_ru: "", content_uz: "", content_ru: "", category: "Yangiliklar", cover_image: "", images: [] as string[], is_important: false };

function AdminNews() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => supabase.from("news").select("*").order("published_at", { ascending: false }).then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (n: any) => { setEditing(n); setForm({ ...empty, ...n, images: n.images || [] }); setOpen(true); };

  const save = async () => {
    if (!form.title_uz || !form.content_uz) { toast.error("Sarlavha va matn (UZ) shart"); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...form, author_id: user?.id };
    const res = editing
      ? await supabase.from("news").update(payload).eq("id", editing.id)
      : await supabase.from("news").insert(payload);
    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Saqlandi");
    setOpen(false);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("O'chirilsinmi?")) return;
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("O'chirildi"); load(); }
  };

  const onCover = async (f: File) => { setUploading(true); const u = await uploadFile("media", f); setUploading(false); if (u) setForm({ ...form, cover_image: u }); };
  const onExtra = async (files: FileList) => {
    setUploading(true);
    const urls: string[] = [];
    for (const f of Array.from(files)) { const u = await uploadFile("media", f); if (u) urls.push(u); }
    setUploading(false);
    setForm({ ...form, images: [...form.images, ...urls] });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Yangiliklar</h1>
        <Button onClick={startCreate}><Plus className="h-4 w-4 mr-1" /> Yangi</Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-elegant">
        {items.length === 0 && <p className="p-8 text-center text-muted-foreground">Hali yangilik yo'q</p>}
        {items.map((n) => (
          <div key={n.id} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
            <div className="h-14 w-20 rounded-lg bg-muted overflow-hidden shrink-0">
              {n.cover_image && <img src={n.cover_image} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{n.title_uz}</div>
              <div className="text-xs text-muted-foreground">{new Date(n.published_at).toLocaleDateString("uz-UZ")} · {n.views} ko'rildi · {n.category}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => startEdit(n)}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => del(n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Tahrirlash" : "Yangi yangilik"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div><Label>Sarlavha (UZ) *</Label><Input value={form.title_uz} onChange={(e) => setForm({ ...form, title_uz: e.target.value })} /></div>
              <div><Label>Sarlavha (RU)</Label><Input value={form.title_ru} onChange={(e) => setForm({ ...form, title_ru: e.target.value })} /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div><Label>Kategoriya</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="flex items-end gap-3"><Switch checked={form.is_important} onCheckedChange={(v) => setForm({ ...form, is_important: v })} /><Label>Muhim yangilik</Label></div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div><Label>Qisqa matn (UZ)</Label><Textarea rows={2} value={form.excerpt_uz} onChange={(e) => setForm({ ...form, excerpt_uz: e.target.value })} /></div>
              <div><Label>Qisqa matn (RU)</Label><Textarea rows={2} value={form.excerpt_ru} onChange={(e) => setForm({ ...form, excerpt_ru: e.target.value })} /></div>
            </div>
            <div><Label>To'liq matn (UZ) *</Label><Textarea rows={8} value={form.content_uz} onChange={(e) => setForm({ ...form, content_uz: e.target.value })} /></div>
            <div><Label>To'liq matn (RU)</Label><Textarea rows={8} value={form.content_ru} onChange={(e) => setForm({ ...form, content_ru: e.target.value })} /></div>

            <div>
              <Label>Asosiy rasm</Label>
              <div className="flex items-center gap-3 mt-1">
                {form.cover_image && <img src={form.cover_image} className="h-20 w-32 rounded-lg object-cover" />}
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-muted">
                  <Upload className="h-4 w-4" /> Yuklash
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onCover(e.target.files[0])} />
                </label>
                {form.cover_image && <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, cover_image: "" })}>O'chirish</Button>}
              </div>
            </div>

            <div>
              <Label>Qo'shimcha rasmlar</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {form.images.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} className="h-20 w-20 rounded-lg object-cover" />
                    <button onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                <label className="cursor-pointer h-20 w-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:bg-muted">
                  <Plus className="h-5 w-5" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && onExtra(e.target.files)} />
                </label>
              </div>
            </div>

            {uploading && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda...</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button>
              <Button onClick={save} disabled={saving || uploading}>{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
