import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, ListChecks, Gamepad2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/quizzes")({
  component: AdminQuizzes,
});

type Q = { id?: string; question_uz: string; question_ru: string; options: string[]; correct_index: number; points: number };
const emptyQuiz = { title_uz: "", title_ru: "", description_uz: "", description_ru: "", kind: "quiz" as "quiz" | "game", cover_image: "" };
const emptyQ: Q = { question_uz: "", question_ru: "", options: ["", "", "", ""], correct_index: 0, points: 1 };

function AdminQuizzes() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyQuiz);
  const [questions, setQuestions] = useState<Q[]>([{ ...emptyQ }]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("quizzes").select("*, quiz_questions(count)").order("created_at", { ascending: false });
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const startCreate = () => { setEditing(null); setForm(emptyQuiz); setQuestions([{ ...emptyQ, options: ["", "", "", ""] }]); setOpen(true); };
  const startEdit = async (q: any) => {
    setEditing(q);
    setForm({ title_uz: q.title_uz, title_ru: q.title_ru || "", description_uz: q.description_uz || "", description_ru: q.description_ru || "", kind: q.kind, cover_image: q.cover_image || "" });
    const { data } = await supabase.from("quiz_questions").select("*").eq("quiz_id", q.id).order("order_index");
    setQuestions((data || []).map((x: any) => ({ id: x.id, question_uz: x.question_uz, question_ru: x.question_ru || "", options: Array.isArray(x.options) ? x.options : [], correct_index: x.correct_index, points: x.points })));
    setOpen(true);
  };

  const save = async () => {
    if (!form.title_uz) { toast.error("Sarlavha shart"); return; }
    if (questions.length === 0 || !questions[0].question_uz) { toast.error("Kamida 1 ta savol kerak"); return; }
    setSaving(true);
    let quizId = editing?.id;
    if (editing) {
      const { error } = await supabase.from("quizzes").update(form).eq("id", editing.id);
      if (error) { setSaving(false); toast.error(error.message); return; }
      await supabase.from("quiz_questions").delete().eq("quiz_id", editing.id);
    } else {
      const { data, error } = await supabase.from("quizzes").insert(form).select().single();
      if (error || !data) { setSaving(false); toast.error(error?.message || "Xatolik"); return; }
      quizId = data.id;
    }
    const rows = questions.filter(q => q.question_uz).map((q, i) => ({
      quiz_id: quizId, question_uz: q.question_uz, question_ru: q.question_ru || null,
      options: q.options.filter(o => o), correct_index: q.correct_index, points: q.points, order_index: i,
    }));
    if (rows.length) {
      const { error } = await supabase.from("quiz_questions").insert(rows);
      if (error) { setSaving(false); toast.error(error.message); return; }
    }
    setSaving(false);
    toast.success("Saqlandi");
    setOpen(false);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("O'chirilsinmi?")) return;
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("O'chirildi"); load(); }
  };

  const updateQ = (i: number, patch: Partial<Q>) => setQuestions(questions.map((q, j) => j === i ? { ...q, ...patch } : q));
  const updateOpt = (i: number, oi: number, v: string) => updateQ(i, { options: questions[i].options.map((o, j) => j === oi ? v : o) });
  const addQ = () => setQuestions([...questions, { ...emptyQ, options: ["", "", "", ""] }]);
  const removeQ = (i: number) => setQuestions(questions.filter((_, j) => j !== i));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Test va o'yinlar</h1>
        <Button onClick={startCreate}><Plus className="h-4 w-4 mr-1" /> Yangi</Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-elegant">
        {items.length === 0 && <p className="p-8 text-center text-muted-foreground">Hali test yo'q</p>}
        {items.map((q) => (
          <div key={q.id} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {q.kind === "game" ? <Gamepad2 className="h-5 w-5" /> : <ListChecks className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{q.title_uz}</div>
              <div className="text-xs text-muted-foreground">{q.kind === "game" ? "O'yin" : "Test"} · {q.quiz_questions?.[0]?.count || 0} savol</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => startEdit(q)}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => del(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Tahrirlash" : "Yangi test/o'yin"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div><Label>Sarlavha (UZ) *</Label><Input value={form.title_uz} onChange={(e) => setForm({ ...form, title_uz: e.target.value })} /></div>
              <div><Label>Sarlavha (RU)</Label><Input value={form.title_ru} onChange={(e) => setForm({ ...form, title_ru: e.target.value })} /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div><Label>Tavsif (UZ)</Label><Textarea rows={2} value={form.description_uz} onChange={(e) => setForm({ ...form, description_uz: e.target.value })} /></div>
              <div><Label>Tavsif (RU)</Label><Textarea rows={2} value={form.description_ru} onChange={(e) => setForm({ ...form, description_ru: e.target.value })} /></div>
            </div>
            <div>
              <Label>Turi</Label>
              <select className="w-full mt-1 border border-input rounded-md h-9 px-3 bg-background" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as any })}>
                <option value="quiz">Test (Quiz)</option>
                <option value="game">O'yin (Game)</option>
              </select>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Savollar</h3>
                <Button size="sm" variant="outline" onClick={addQ}><Plus className="h-4 w-4 mr-1" />Savol qo'shish</Button>
              </div>
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-bold text-muted-foreground mt-2">#{i + 1}</span>
                      <div className="flex-1 grid md:grid-cols-2 gap-2">
                        <Input placeholder="Savol (UZ)" value={q.question_uz} onChange={(e) => updateQ(i, { question_uz: e.target.value })} />
                        <Input placeholder="Savol (RU)" value={q.question_ru} onChange={(e) => updateQ(i, { question_ru: e.target.value })} />
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeQ(i)}><X className="h-4 w-4" /></Button>
                    </div>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`correct-${i}`} checked={q.correct_index === oi} onChange={() => updateQ(i, { correct_index: oi })} />
                          <Input placeholder={`Variant ${oi + 1}`} value={opt} onChange={(e) => updateOpt(i, oi, e.target.value)} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Ball:</Label>
                      <Input type="number" className="w-20 h-8" value={q.points} onChange={(e) => updateQ(i, { points: parseInt(e.target.value) || 1 })} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button>
              <Button onClick={save} disabled={saving}>{saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Saqlanmoqda...</> : "Saqlash"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
