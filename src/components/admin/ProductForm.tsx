import { useState } from "react";
import { toast } from "sonner";
import { X, ArrowLeft, ArrowRight, Trash2, Upload, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BUCKET, CATEGORIES, colorImageUrl, parseColors, type Category, type ProductColor, type ProductWithUrls } from "@/lib/products";

type Img = { path: string; url: string };
const inp = "h-11 w-full rounded-xl hairline bg-background px-3 text-sm focus:border-primary focus:outline-none";

export function ProductForm({ product, onClose, onSaved }: { product: ProductWithUrls | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    category: (product?.category ?? "iphone_novo") as Category,
    name: product?.name ?? "",
    brand: product?.brand ?? "Apple",
    ram: product?.ram ?? "",
    model: product?.model ?? "",
    storage: product?.storage ?? "",
    color: product?.color ?? "",
    battery_health: product?.battery_health?.toString() ?? "",
    price: product?.price?.toString() ?? "",
    description: product?.description ?? "",
    status: product?.status ?? "disponivel",
    offer_active: product?.offer_active ? "1" : "0",
    offer_price: product?.offer_price?.toString() ?? "",
    offer_ends_at: product?.offer_ends_at ? new Date(product.offer_ends_at).toISOString().slice(0, 10) : "",
  });
  const [imgs, setImgs] = useState<Img[]>(product ? product.images.map((p, i) => ({ path: p, url: product.imageUrls[i] ?? "" })) : []);
  const [colors, setColors] = useState<ProductColor[]>(parseColors(product?.colors));
  const [colorUp, setColorUp] = useState<number | null>(null);
  const setColor = (i: number, patch: Partial<ProductColor>) => setColors((s) => s.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  async function uploadColor(i: number, file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setColorUp(i);
    const path = `official/${crypto.randomUUID()}.${file.name.split(".").pop() || "jpg"}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    setColorUp(null);
    if (error) { toast.error(`Falha ao enviar ${file.name}`); return; }
    setColor(i, { image: path });
  }
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
      const path = `official/${crypto.randomUUID()}.${file.name.split(".").pop() || "jpg"}`;
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
    const offerOn = f.offer_active === "1";
    if (offerOn && !f.offer_price) { toast.error("Informe o preço promocional para ativar a oferta."); return; }
    setSaving(true);
    const row = {
      offer_active: offerOn,
      offer_price: f.offer_price ? Number(f.offer_price) : null,
      // End of the chosen day, Brasília time.
      offer_ends_at: f.offer_ends_at ? new Date(`${f.offer_ends_at}T23:59:59-03:00`).toISOString() : null,
      category: f.category,
      name: f.name.trim(),
      brand: f.brand.trim() || null,
      ram: f.ram.trim() || null,
      model: f.model.trim() || null,
      storage: f.storage.trim() || null,
      color: f.color.trim() || null,
      battery_health: f.category === "iphone_seminovo" ? battery : null,
      price: f.price ? Number(f.price) : null,
      description: f.description.trim() || null,
      status: f.status as "disponivel" | "vendido" | "em_breve",
      images: imgs.map((i) => i.path),
      colors: colors.map((c) => ({ name: c.name.trim(), image: c.image, available: c.available })).filter((c) => c.name),
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
              <option value="disponivel">Disponível</option><option value="vendido">Esgotado / vendido</option><option value="em_breve">Em breve (lançamento)</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">Nome *<input required className={inp} value={f.name} onChange={set("name")} placeholder="Ex.: iPhone 15" /></label>
          <label className="space-y-1 text-sm">Modelo<input className={inp} value={f.model} onChange={set("model")} placeholder="Ex.: Pro Max" /></label>
          <label className="space-y-1 text-sm">Marca<input className={inp} value={f.brand} onChange={set("brand")} placeholder="Ex.: Apple" /></label>
          <label className="space-y-1 text-sm">Memória RAM<input className={inp} value={f.ram} onChange={set("ram")} placeholder="Ex.: 8GB (opcional)" /></label>
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
        <fieldset className="grid gap-3 rounded-xl hairline p-3 sm:grid-cols-3">
          <legend className="px-1 text-sm text-primary">Oferta (página Ofertas)</legend>
          <label className="space-y-1 text-sm">Situação
            <select className={inp} value={f.offer_active} onChange={set("offer_active")}>
              <option value="0">Desativada</option><option value="1">Ativa</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">Preço promocional (R$)<input type="number" step="0.01" min="0" className={inp} value={f.offer_price} onChange={set("offer_price")} /></label>
          <label className="space-y-1 text-sm">Término (opcional)<input type="date" className={inp} value={f.offer_ends_at} onChange={set("offer_ends_at")} /></label>
        </fieldset>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm">Cores do aparelho <span className="text-muted-foreground">(opcional)</span></p>
            <button type="button" onClick={() => setColors((s) => [...s, { name: "", image: null, available: false }])} className="inline-flex items-center gap-1 rounded-full hairline px-3 py-1.5 text-xs hover:border-primary hover:text-primary">
              <Plus className="h-3.5 w-3.5" /> Adicionar cor
            </button>
          </div>
          {colors.length === 0 && <p className="text-xs text-muted-foreground">Sem cores cadastradas: o cliente consulta sem escolher cor.</p>}
          {colors.map((c, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl hairline p-2">
              <label className="relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-primary/40 text-muted-foreground hover:text-primary" title="Foto desta cor">
                {colorUp === i ? <Loader2 className="h-4 w-4 animate-spin" /> : c.image ? <img src={colorImageUrl(c.image)} alt="" className="h-full w-full object-cover" /> : <Upload className="h-4 w-4" />}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadColor(i, e.target.files?.[0])} />
              </label>
              <input className={inp + " min-w-0 flex-1"} value={c.name} onChange={(e) => setColor(i, { name: e.target.value })} placeholder="Nome da cor (ex.: Preto)" aria-label="Nome da cor" />
              <select className={inp + " w-auto"} value={c.available ? "1" : "0"} onChange={(e) => setColor(i, { available: e.target.value === "1" })} aria-label="Estoque da cor">
                <option value="0">Esgotada</option><option value="1">Disponível</option>
              </select>
              {c.image && <button type="button" onClick={() => setColor(i, { image: null })} className="text-xs text-muted-foreground hover:text-primary">Tirar foto</button>}
              <button type="button" onClick={() => setColors((s) => s.filter((_, j) => j !== i))} aria-label="Remover cor"><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          ))}
        </div>
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
