import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/resources")({
  component: AdminResources,
});

const empty = { title_uz: "", title_ru: "", description_uz: "", description_ru: "", category: "general", section: "library", file_url: "", external_url: "", cover_image: "" };

function AdminResources() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => supabase.from("resources").select("*").order("created_at", { ascending: false }).then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title_uz) { toast.error("Sarlavha shart"); return; }
    setSaving(true);
    const res = editing
      ? await supabase.from("resources").update(form).eq("id", editing.id)
      : await supabase.from("resources").insert(form);
    setSaving(false);
    if (res.error) toast.error(res.error.message);
    else { toast.success("Saqlandi"); setOpen(false); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("O'chirilsinmi?")) return;
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("O'chirildi"); load(); }
  };

  const onUpload = async (f: File) => { setUploading(true); const u = await uploadFile("files", f); setUploading(false); if (u) setForm({ ...form, file_url: u }); };
  const onCover = async (f: File) => { setUploading(true); const u = await uploadFile("media", f); setUploading(false); if (u) setForm({ ...form, cover_image: u }); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Resurslar</h1>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Yangi</Button>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-elegant">
        {items.length === 0 && <p className="p-8 text-center text-muted-foreground">Resurs yo'q</p>}
        {items.map((r) => (
          <div key={r.id} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{r.title_uz}</div>
              <div className="text-xs text-muted-foreground truncate">{r.description_uz}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setForm({ ...empty, ...r }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Tahrirlash" : "Yangi resurs"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div><Label>Sarlavha (UZ) *</Label><Input value={form.title_uz} onChange={(e) => setForm({ ...form, title_uz: e.target.value })} /></div>
              <div><Label>Sarlavha (RU)</Label><Input value={form.title_ru} onChange={(e) => setForm({ ...form, title_ru: e.target.value })} /></div>
            </div>
            <div><Label>Tavsif (UZ)</Label><Textarea rows={3} value={form.description_uz} onChange={(e) => setForm({ ...form, description_uz: e.target.value })} /></div>
            <div><Label>Tavsif (RU)</Label><Textarea rows={3} value={form.description_ru} onChange={(e) => setForm({ ...form, description_ru: e.target.value })} /></div>
            <div><Label>Kategoriya</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Kitoblar, Maqolalar, Video..." /></div>
            <div>
              <Label>Muqova rasm</Label>
              <div className="flex items-center gap-3 mt-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-muted">
                  <Upload className="h-4 w-4" /> Tanlash
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onCover(e.target.files[0])} />
                </label>
                {form.cover_image && <img src={form.cover_image} alt="" className="h-10 w-16 object-cover rounded" />}
              </div>
            </div>
            <div>
              <Label>Fayl yuklash</Label>
              <div className="flex items-center gap-3 mt-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-muted">
                  <Upload className="h-4 w-4" /> Tanlash
                  <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
                </label>
                {form.file_url && <a href={form.file_url} target="_blank" className="text-sm text-primary truncate">Yuklangan fayl</a>}
              </div>
              {uploading && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Yuklanmoqda</p>}
            </div>
            <div><Label>Yoki tashqi havola</Label><Input value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} placeholder="https://..." /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button>
              <Button onClick={save} disabled={saving || uploading}>{saving ? "..." : "Saqlash"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
