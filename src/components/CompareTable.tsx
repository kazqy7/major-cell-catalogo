import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { conditionLabel, formatPrice, productMessage, productsQuery, type ProductWithUrls } from "@/lib/products";
import { PRIORITIES, reason, recommend, specFor, type Priority } from "@/lib/iphone-specs";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PageHeader } from "@/components/PageHeader";

const NA = "Informação não disponível";

export function CompareTable() {
  const { data } = useSuspenseQuery(productsQuery());
  const iphones = data.filter((p) => p.category !== "xiaomi");
  const search = useSearch({ from: "/comparar" });
  const navigate = useNavigate({ from: "/comparar" });
  const ids = (search.ids ?? "").split(",").filter((id) => iphones.some((p) => p.id === id)).slice(0, 3);
  const selected = ids.map((id) => iphones.find((p) => p.id === id)!);
  const setIds = (next: string[]) => navigate({ search: next.length ? { ids: next.join(",") } : {}, replace: true });

  const slots = [0, 1, 2];
  const rows: { label: string; get: (p: ProductWithUrls) => string; diff?: boolean }[] = [
    { label: "Preço", get: (p) => formatPrice(p.price) ?? "Consulte disponibilidade", diff: true },
    { label: "Armazenamento", get: (p) => p.storage ?? NA, diff: true },
    { label: "Condição", get: (p) => conditionLabel(p.category) },
    { label: "Disponibilidade", get: () => "Disponível" },
    { label: "Tela", get: (p) => { const s = specFor(p.name); return s ? `${s.screen}, ${s.refresh}` : NA; }, diff: true },
    { label: "Câmeras traseiras", get: (p) => specFor(p.name)?.cameras ?? NA, diff: true },
    { label: "Bateria (vídeo)", get: (p) => { const s = specFor(p.name); return s ? `Até ${s.videoHours} h` : NA; }, diff: true },
    { label: "Processador / desempenho", get: (p) => specFor(p.name)?.chip ?? NA, diff: true },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20">
      <PageHeader eyebrow="Comparar" title="Qual iPhone é para você?" subtitle="Escolha até 3 modelos do nosso estoque e compare lado a lado." />

      <Advisor iphones={iphones} onCompare={(list) => setIds(list)} />

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {slots.map((i) => {
          const p = selected[i];
          if (i > selected.length) return null;
          return (
            <div key={i} className="rounded-3xl bg-card p-5">
              <label className="text-xs text-muted-foreground" htmlFor={`slot-${i}`}>Modelo {i + 1}</label>
              <div className="mt-1 flex gap-2">
                <select
                  id={`slot-${i}`}
                  value={p?.id ?? ""}
                  onChange={(e) => { const n = [...ids]; n[i] = e.target.value; setIds(n.filter(Boolean)); }}
                  className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground"
                >
                  <option value="">Escolher iPhone</option>
                  {iphones.map((o) => (
                    <option key={o.id} value={o.id} disabled={ids.includes(o.id) && o.id !== p?.id}>
                      {o.name} {o.storage} — {formatPrice(o.price)}
                    </option>
                  ))}
                </select>
                {p && (
                  <button type="button" aria-label={`Remover ${p.name}`} onClick={() => setIds(ids.filter((x) => x !== p.id))} className="rounded-full p-2 hairline">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {p && (
                <div className="mt-5 text-center">
                  <div className="mx-auto aspect-square w-full max-w-[200px] rounded-2xl bg-showcase p-3">
                    {p.imageUrls[0] && <img src={p.imageUrls[0]} alt={p.name} className="h-full w-full object-contain" />}
                  </div>
                  <Link to="/produto/$id" params={{ id: p.id }} className="mt-3 block font-semibold hover:text-primary">{p.name}</Link>
                  <p className="text-lg text-primary">{formatPrice(p.price)}</p>
                  <WhatsAppButton message={productMessage(p)} className="mt-3 w-full text-xs" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected.length >= 2 ? (
        <>
          <div className="mt-10 overflow-hidden rounded-3xl bg-card">
            {rows.map((r) => {
              const vals = selected.map(r.get);
              const differs = r.diff && new Set(vals).size > 1;
              return (
                <div key={r.label} className="border-b border-border/50 p-4 last:border-0 sm:grid sm:grid-cols-[180px_1fr] sm:gap-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {r.label} {differs && <span className="ml-1 text-primary">• diferença</span>}
                  </p>
                  <div className="mt-2 grid gap-3 sm:mt-0" style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(0,1fr))` }}>
                    {vals.map((v, i) => (
                      <p key={i} className={`text-sm ${differs ? "text-foreground" : "text-muted-foreground"}`}>
                        <span className="block text-[10px] text-muted-foreground sm:hidden">{selected[i]!.name}</span>{v}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <Profiles items={selected} />
          <p className="mt-4 text-xs text-muted-foreground">Especificações técnicas conforme a Apple. Preços e estoque do catálogo atual da Major Cell.</p>
        </>
      ) : (
        <p className="mt-10 text-center text-sm text-muted-foreground">Selecione pelo menos 2 iPhones para ver a comparação.</p>
      )}
    </div>
  );
}

function Profiles({ items }: { items: ProductWithUrls[] }) {
  const best = (k: Priority) => recommend(items, Infinity, k)[0];
  const labels: Record<Priority, string> = {
    camera: "Quem fotografa e filma muito",
    bateria: "Quem passa o dia fora de casa",
    desempenho: "Jogos e uso intenso",
    tela: "Vídeos e leitura em tela grande",
    custo: "Melhor custo-benefício",
  };
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {PRIORITIES.map(({ value }) => {
        const p = best(value);
        if (!p) return null;
        return (
          <div key={value} className="rounded-2xl hairline p-4">
            <p className="text-xs text-muted-foreground">{labels[value]}</p>
            <p className="mt-1 font-semibold text-primary">{p.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{reason(specFor(p.name)!, value)}</p>
          </div>
        );
      })}
    </div>
  );
}

function Advisor({ iphones, onCompare }: { iphones: ProductWithUrls[]; onCompare: (ids: string[]) => void }) {
  const [budget, setBudget] = useState("");
  const [pr, setPr] = useState<Priority>("custo");
  const [done, setDone] = useState(false);
  const value = Number(budget.replace(/\./g, "").replace(",", "."));
  const recs = done && value > 0 ? recommend(iphones, value, pr) : [];
  return (
    <section aria-labelledby="advisor" className="mt-10 rounded-3xl bg-card p-6">
      <h2 id="advisor" className="text-xl font-semibold">Assistente de escolha</h2>
      <p className="mt-1 text-sm text-muted-foreground">Informe quanto quer investir e o que é mais importante para você.</p>
      <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
        <label className="flex-1 text-xs text-muted-foreground">Orçamento máximo (R$)
          <input inputMode="decimal" value={budget} onChange={(e) => { setBudget(e.target.value); setDone(false); }} placeholder="Ex.: 5000"
            className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground" />
        </label>
        <label className="flex-1 text-xs text-muted-foreground">Prioridade
          <select value={pr} onChange={(e) => { setPr(e.target.value as Priority); setDone(false); }}
            className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground">
            {PRIORITIES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <button type="submit" className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground">Recomendar</button>
      </form>
      {done && (
        recs.length ? (
          <div className="mt-6 space-y-3">
            {recs.map((p, i) => (
              <div key={p.id} className="flex flex-col gap-2 rounded-2xl hairline p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{i + 1}. {p.name} {p.storage} <span className="text-primary">{formatPrice(p.price)}</span></p>
                  <p className="text-xs text-muted-foreground">{reason(specFor(p.name)!, pr)}</p>
                </div>
                <WhatsAppButton variant="outline" message={productMessage(p)} className="text-xs" />
              </div>
            ))}
            {recs.length >= 2 && (
              <button type="button" onClick={() => onCompare(recs.map((r) => r.id))} className="text-sm text-primary hover:underline">
                Comparar estes modelos
              </button>
            )}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">Nenhum iPhone disponível dentro desse orçamento. Fale com a loja pelo WhatsApp para outras opções.</p>
        )
      )}
    </section>
  );
}
