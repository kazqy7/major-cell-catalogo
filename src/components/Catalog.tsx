import { useSuspenseQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, PackageOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { CATEGORIES, productsQuery, type Category } from "@/lib/products";
import { ProductCard } from "./ProductCard";

const sel =
  "h-11 w-full rounded-xl hairline bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none";

export function Catalog({ fixedCategory }: { fixedCategory?: Category }) {
  const { data } = useSuspenseQuery(productsQuery());
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(fixedCategory ?? "");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState("");
  const [color, setColor] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const base = useMemo(() => data.filter((p) => !cat || p.category === cat), [data, cat]);
  const uniq = (k: "model" | "storage" | "color") =>
    Array.from(new Set(base.map((p) => p[k]).filter(Boolean) as string[])).sort();

  const list = base.filter((p) => {
    const s = q.trim().toLowerCase();
    if (s && ![p.name, p.model].join(" ").toLowerCase().includes(s)) return false;
    if (model && p.model !== model) return false;
    if (storage && p.storage !== storage) return false;
    if (color && p.color !== color) return false;
    if (min && (p.price == null || p.price < Number(min))) return false;
    if (max && (p.price == null || p.price > Number(max))) return false;
    return true;
  });

  const clear = () => {
    setQ(""); setModel(""); setStorage(""); setColor(""); setMin(""); setMax("");
    if (!fixedCategory) setCat("");
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl hairline bg-card/60 p-5">
        <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
          <SlidersHorizontal className="h-4 w-4" /> Filtrar aparelhos
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <label className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar pelo nome do aparelho" className={sel + " pl-9"} aria-label="Buscar" />
          </label>
          {!fixedCategory && (
            <select value={cat} onChange={(e) => { setCat(e.target.value); setModel(""); }} className={sel} aria-label="Categoria">
              <option value="">Todas as categorias</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          )}
          <select value={model} onChange={(e) => setModel(e.target.value)} className={sel} aria-label="Modelo">
            <option value="">Todos os modelos</option>
            {uniq("model").map((v) => <option key={v}>{v}</option>)}
          </select>
          <select value={storage} onChange={(e) => setStorage(e.target.value)} className={sel} aria-label="Armazenamento">
            <option value="">Armazenamento</option>
            {uniq("storage").map((v) => <option key={v}>{v}</option>)}
          </select>
          <select value={color} onChange={(e) => setColor(e.target.value)} className={sel} aria-label="Cor">
            <option value="">Cor</option>
            {uniq("color").map((v) => <option key={v}>{v}</option>)}
          </select>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-2">
            <input type="number" min={0} value={min} onChange={(e) => setMin(e.target.value)} placeholder="Preço mín. (R$)" className={sel} aria-label="Preço mínimo" />
            <input type="number" min={0} value={max} onChange={(e) => setMax(e.target.value)} placeholder="Preço máx. (R$)" className={sel} aria-label="Preço máximo" />
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{list.length} {list.length === 1 ? "aparelho encontrado" : "aparelhos encontrados"}</p>

      {list.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl hairline px-6 py-20 text-center">
          <PackageOpen className="h-12 w-12 text-primary" strokeWidth={1.2} />
          <h3 className="mt-4 text-xl font-semibold">
            {data.length === 0 ? "Novos aparelhos chegando em breve" : "Nenhum aparelho com esses filtros"}
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {data.length === 0
              ? "Nosso catálogo está sendo atualizado. Fale com a gente pelo WhatsApp para saber o que está disponível hoje."
              : "Tente ajustar ou limpar os filtros para ver mais opções."}
          </p>
          {data.length > 0 && (
            <button onClick={clear} className="mt-6 rounded-full hairline px-5 py-2 text-sm hover:border-primary hover:text-primary">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-[460px] animate-pulse rounded-2xl bg-card" />
      ))}
    </div>
  );
}
