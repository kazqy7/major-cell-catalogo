import { useState } from "react";
import { toast } from "sonner";
import { X, ArrowLeft, ArrowRight, Trash2, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BUCKET, CATEGORIES, type Category, type ProductWithUrls } from "@/lib/products";

type Img = { path: string; url: string };
const inp = "h-11 w-full rounded-xl hairline bg-background px-3 text-sm focus:border-primary focus:outline-none";

export function ProductForm({ product, onClose, onSaved }: { product: ProductWithUrls | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    category: (product?.category ?? "iphone_novo") as Category,
    name: product?.name ?? "",
    model: product?.model ?? "",
    storage: product?.storage ?? "",
    color: product?.color ?? "",
    battery_health: product?.battery_health?.toString() ?? "",
    price: product?.price?.toString() ?? "",
    description: product?.description ?? "",
    status: product?.status ?? "disponivel",
  });
  const [imgs, setImgs] = useState<Img[]>(product ? product.images.map((p, i) => ({ path: p, url: product.imageUrls[i] ?? "" })) : []);
  const [removed, setRemoved] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const added: Img[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const path = `${crypto.randomUUID()}.${file.name.split(".").pop() || "jpg"}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
      if (error) { toast.error(`Falha ao enviar ${file.name}`); continue; }
      added.push({ path, url: URL.createObjectURL(file) });
    }
    setImgs((s) => [...s, ...added]);
    setUploading(false);
  }

  const move = (i: number, d: number) => setImgs((s) => {
    const n = [...s]; const j = i + d; if (j < 0 || j >= n.length) return s;
    const t = n[i]!; n[i] = n[j]!; n[j] = t; return n;
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const battery = f.battery_health ? Number(f.battery_health) : null;
    if (battery != null && (battery < 0 || battery > 100)) { toast.error("Saúde da bateria deve estar entre 0 e 100."); return; }
    setSaving(true);
    const row = {
      category: f.category,
      name: f.name.trim(),
      model: f.model.trim() || null,
      storage: f.storage.trim() || null,
      color: f.color.trim() || null,
      battery_health: f.category === "iphone_seminovo" ? battery : null,
      price: f.price ? Number(f.price) : null,
      description: f.description.trim() || null,
      status: f.status as "disponivel" | "vendido",
      images: imgs.map((i) => i.path),
    };
    const { error } = product
      ? await supabase.from("products").update(row).eq("id", product.id)
      : await supabase.from("products").insert(row);
    setSaving(false);
    if (error) { toast.error("Não foi possível salvar: " + error.message); return; }
    if (removed.length) await supabase.storage.from(BUCKET).remove(removed);
    toast.success(product ? "Aparelho atualizado." : "Aparelho cadastrado.");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm">
      <form onSubmit={save} className="my-8 w-full max-w-2xl space-y-4 rounded-2xl hairline bg-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{product ? "Editar aparelho" : "Novo aparelho"}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-2 hairline"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">Categoria
            <select className={inp} value={f.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm">Disponibilidade
            <select className={inp} value={f.status} onChange={set("status")}>
              <option value="disponivel">Disponível</option><option value="vendido">Vendido</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">Nome *<input required className={inp} value={f.name} onChange={set("name")} placeholder="Ex.: iPhone 15" /></label>
          <label className="space-y-1 text-sm">Modelo<input className={inp} value={f.model} onChange={set("model")} placeholder="Ex.: Pro Max" /></label>
          <label className="space-y-1 text-sm">Armazenamento
            <select className={inp} value={f.storage} onChange={set("storage")}>
              <option value="">Selecione</option>
              {["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"].map((s) => <option key={s} value={s}>{s}</option>)}
              {f.storage && !["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"].includes(f.storage) && <option value={f.storage}>{f.storage}</option>}
            </select>
          </label>
          <label className="space-y-1 text-sm">Cor<input className={inp} value={f.color} onChange={set("color")} placeholder="Ex.: Titânio natural" /></label>
          <label className="space-y-1 text-sm">Preço (R$) — vazio mostra “Consulte”<input type="number" step="0.01" min="0" className={inp} value={f.price} onChange={set("price")} /></label>
          {f.category === "iphone_seminovo" && (
            <label className="space-y-1 text-sm">Saúde da bateria (%)<input type="number" min="0" max="100" className={inp} value={f.battery_health} onChange={set("battery_health")} /></label>
          )}
        </div>
        <label className="block space-y-1 text-sm">Descrição
          <textarea rows={4} className={inp + " h-auto py-2"} value={f.description} onChange={set("description")} />
        </label>
        <div>
          <p className="mb-2 text-sm">Fotos (a primeira é a capa)</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {imgs.map((im, i) => (
              <div key={im.path} className="group relative aspect-square overflow-hidden rounded-xl hairline">
                <img src={im.url} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-background/80 p-1">
                  <button type="button" onClick={() => move(i, -1)} aria-label="Mover para esquerda"><ArrowLeft className="h-4 w-4" /></button>
                  <button type="button" onClick={() => { setRemoved((r) => [...r, im.path]); setImgs((s) => s.filter((_, j) => j !== i)); }} aria-label="Remover foto"><Trash2 className="h-4 w-4 text-destructive" /></button>
                  <button type="button" onClick={() => move(i, 1)} aria-label="Mover para direita"><ArrowRight className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-primary/40 text-xs text-muted-foreground hover:text-primary">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              Adicionar
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-full hairline px-5 py-2.5 text-sm">Cancelar</button>
          <button disabled={saving || uploading} className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
