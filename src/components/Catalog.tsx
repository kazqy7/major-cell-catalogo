import { useSuspenseQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, PackageOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { CATEGORIES, groupKey, productsQuery, type Category, type ProductWithUrls } from "@/lib/products";
import { applyFilters, brandOf, emptyFilters, type Filters } from "@/lib/catalog-filters";
import { ProductCard } from "./ProductCard";

const sel =
  "h-11 w-full rounded-full border-0 bg-secondary px-4 text-sm text-foreground focus:border-primary focus:outline-none";

export function Catalog({ fixedCategory }: { fixedCategory?: Category | undefined }) {
  const { data } = useSuspenseQuery(productsQuery());
  const [f, setF] = useState<Filters>(() => emptyFilters(fixedCategory ?? ""));
  const set = (k: keyof Filters) => (e: { target: { value: string } }) => setF((o) => ({ ...o, [k]: e.target.value }));

  const base = useMemo(() => data.filter((p) => !f.cat || p.category === f.cat), [data, f.cat]);
  const uniq = (k: "storage" | "color") =>
    Array.from(new Set(base.map((p) => p[k]).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
  const brands = Array.from(new Set(base.map(brandOf))).sort();
  const showCondition = !fixedCategory && data.some((p) => p.category === "iphone_seminovo");

  const list = applyFilters(data, f);
  const active = JSON.stringify(f) !== JSON.stringify(emptyFilters(fixedCategory ?? ""));
  const clear = () => setF(emptyFilters(fixedCategory ?? ""));

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filtrar aparelhos</span>
          {active && <button onClick={clear} className="text-primary hover:underline">Limpar filtros</button>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <label className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <input value={f.q} onChange={set("q")} placeholder="Buscar pelo nome do aparelho" className={sel + " pl-9"} aria-label="Buscar" />
          </label>
          {!fixedCategory && (
            <select value={f.cat} onChange={set("cat")} className={sel} aria-label="Categoria">
              <option value="">Todas as categorias</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          )}
          {brands.length > 1 && (
            <select value={f.brand} onChange={set("brand")} className={sel} aria-label="Marca">
              <option value="">Todas as marcas</option>
              {brands.map((v) => <option key={v}>{v}</option>)}
            </select>
          )}
          {showCondition && (
            <select value={f.condition} onChange={set("condition")} className={sel} aria-label="Condição">
              <option value="">Novo ou seminovo</option>
              <option value="novo">Novo</option>
              <option value="seminovo">Seminovo</option>
            </select>
          )}
          <select value={f.storage} onChange={set("storage")} className={sel} aria-label="Armazenamento">
            <option value="">Armazenamento</option>
            {uniq("storage").map((v) => <option key={v}>{v}</option>)}
          </select>
          {uniq("color").length > 0 && (
            <select value={f.color} onChange={set("color")} className={sel} aria-label="Cor">
              <option value="">Cor</option>
              {uniq("color").map((v) => <option key={v}>{v}</option>)}
            </select>
          )}
          <div className="flex gap-2 sm:col-span-2 lg:col-span-2">
            <input type="number" min={0} value={f.min} onChange={set("min")} placeholder="Preço mín. (R$)" className={sel} aria-label="Preço mínimo" />
            <input type="number" min={0} value={f.max} onChange={set("max")} placeholder="Preço máx. (R$)" className={sel} aria-label="Preço máximo" />
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
        <div className="space-y-16">
          {groups(list).map(([g, items]) => (
            <section key={g}>
              <h2 className="mb-6 text-2xl font-semibold md:text-3xl">{g}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function groups(list: ProductWithUrls[]) {
  const m = new Map<string, ProductWithUrls[]>();
  for (const p of list) {
    const k = groupKey(p);
    m.set(k, [...(m.get(k) ?? []), p]);
  }
  return Array.from(m.entries());
}

export function CatalogSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-[460px] animate-pulse rounded-3xl bg-card" />
      ))}
    </div>
  );
}
