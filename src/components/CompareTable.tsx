import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { conditionLabel, formatPrice, productMessage, productsQuery, type ProductWithUrls } from "@/lib/products";
import { PRIORITIES, reason, recommend, specFor, type Priority } from "@/lib/iphone-specs";
import { differences, plainFeatures, profilePhrases } from "@/lib/plain-compare";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PageHeader } from "@/components/PageHeader";

const WA_LABEL = "Quero saber mais pelo WhatsApp";

export function CompareTable() {
  const { data } = useSuspenseQuery(productsQuery());
  const iphones = data.filter((p) => p.category !== "xiaomi");
  const search = useSearch({ from: "/comparar" });
  const navigate = useNavigate({ from: "/comparar" });
  const ids = (search.ids ?? "").split(",").filter((id) => iphones.some((p) => p.id === id)).slice(0, 3);
  const selected = ids.map((id) => iphones.find((p) => p.id === id)!);
  const setIds = (next: string[]) => navigate({ search: next.length ? { ids: next.join(",") } : {}, replace: true });

  const items = selected.flatMap((p) => { const spec = specFor(p.name); return spec ? [{ p, name: p.name, price: p.price, spec }] : []; });
  const complete = items.length === selected.length;
  const newestGen = Math.max(...items.map((i) => i.spec.chipGen));
  const newestUnique = items.filter((i) => i.spec.chipGen === newestGen).length === 1;
  const diffs = complete ? differences(items) : [];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20">
      <PageHeader eyebrow="Comparar" title="Qual iPhone combina com você?" subtitle="Escolha 2 ou 3 iPhones da loja e veja, em palavras simples, o que muda entre eles." />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => {
          if (i > selected.length) return null;
          const p = selected[i];
          const it = items.find((x) => x.p === p);
          return (
            <div key={i} className="flex flex-col rounded-3xl bg-card p-5">
              <label className="text-xs text-muted-foreground" htmlFor={`slot-${i}`}>{p ? `iPhone ${i + 1}` : "Adicionar iPhone"}</label>
              <div className="mt-1 flex gap-2">
                <select id={`slot-${i}`} value={p?.id ?? ""}
                  onChange={(e) => { const n = [...ids]; n[i] = e.target.value; setIds(n.filter(Boolean)); }}
                  className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground">
                  <option value="">Escolher iPhone</option>
                  {iphones.map((o) => (
                    <option key={o.id} value={o.id} disabled={ids.includes(o.id) && o.id !== p?.id}>
                      {o.name} {o.storage} — {formatPrice(o.price) ?? "Consulte"}
                    </option>
                  ))}
                </select>
                {p && (
                  <button type="button" aria-label={`Remover ${p.name}`} onClick={() => setIds(ids.filter((x) => x !== p.id))} className="rounded-full p-2.5 hairline">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {p && (
                <div className="mt-5 flex flex-1 flex-col">
                  <div className="mx-auto aspect-square w-full max-w-[200px] rounded-2xl bg-showcase p-3">
                    {p.imageUrls[0] && <img src={p.imageUrls[0]} alt={p.name} className="h-full w-full object-contain" />}
                  </div>
                  <p className="mt-4 text-center text-[11px] uppercase tracking-[0.18em] text-primary">{conditionLabel(p.category)}</p>
                  <Link to="/produto/$id" params={{ id: p.id }} className="mt-1 block text-center text-xl font-semibold hover:text-primary">{p.name}</Link>
                  <p className="mt-1 text-center text-2xl text-primary">{formatPrice(p.price) ?? "Consulte disponibilidade"}</p>
                  {p.storage && <p className="text-center text-sm text-muted-foreground">{p.storage} de espaço</p>}

                  {it && selected.length >= 2 && complete && (
                    <ul className="mt-4 space-y-1.5 text-sm">
                      {profilePhrases(items, it).map((t) => <li key={t} className="rounded-xl bg-background/60 px-3 py-2">{t}</li>)}
                    </ul>
                  )}
                  {it && (
                    <dl className="mt-4 space-y-3 text-sm">
                      {plainFeatures(it.spec, selected.length >= 2 && newestUnique && it.spec.chipGen === newestGen).map((f) => (
                        <div key={f.label}>
                          <dt className="text-xs text-muted-foreground">{f.label}</dt>
                          <dd>{f.text}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <WhatsAppButton message={productMessage(p)} className="mt-5 w-full">{WA_LABEL}</WhatsAppButton>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected.length >= 2 ? (
        diffs.length > 0 && (
          <section aria-labelledby="diff" className="mt-10 rounded-3xl bg-card p-6">
            <h2 id="diff" className="text-2xl font-semibold">Qual é a diferença na prática?</h2>
            <ul className="mt-4 space-y-3">
              {diffs.map((d) => <li key={d} className="flex gap-3 text-base"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{d}</li>)}
            </ul>
          </section>
        )
      ) : (
        <p className="mt-8 text-center text-sm text-muted-foreground">Escolha pelo menos 2 iPhones para ver o que muda entre eles.</p>
      )}

      <section className="mt-6 rounded-3xl hairline p-6 text-sm">
        <h2 className="font-semibold">O que significa o "GB"?</h2>
        <p className="mt-1 text-muted-foreground">É o espaço para guardar fotos, vídeos, aplicativos e arquivos. Quanto maior o número, mais coisas cabem. A quantidade exata depende do tamanho de cada arquivo.</p>
      </section>

      <Advisor iphones={iphones} onCompare={setIds} />
      <p className="mt-6 text-xs text-muted-foreground">Informações dos aparelhos conforme a Apple. Preços e estoque do catálogo atual da Major Cell.</p>
    </div>
  );
}

function Advisor({ iphones, onCompare }: { iphones: ProductWithUrls[]; onCompare: (ids: string[]) => void }) {
  const [budget, setBudget] = useState("");
  const [pr, setPr] = useState<Priority>("equilibrado");
  const [done, setDone] = useState(false);
  const value = budget.trim() ? Number(budget.replace(/\./g, "").replace(",", ".")) : Infinity;
  const recs = done && value > 0 ? recommend(iphones, value, pr) : [];
  return (
    <section aria-labelledby="advisor" className="mt-10 rounded-3xl bg-card p-6">
      <h2 id="advisor" className="text-2xl font-semibold">O que é mais importante para você no celular?</h2>
      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Prioridade">
        {PRIORITIES.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={pr === o.value} onClick={() => { setPr(o.value); setDone(false); }}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${pr === o.value ? "bg-gold font-semibold text-primary-foreground" : "hairline text-foreground"}`}>
            {o.label}
          </button>
        ))}
      </div>
      <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
        <label className="flex-1 text-sm text-muted-foreground">Quanto você quer gastar, no máximo? (opcional)
          <input inputMode="decimal" value={budget} onChange={(e) => { setBudget(e.target.value); setDone(false); }} placeholder="Ex.: 5000"
            className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2.5 text-base text-foreground" />
        </label>
        <button type="submit" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground">Encontrar meu iPhone</button>
      </form>
      {done && (recs.length ? (
        <div className="mt-6 space-y-3">
          {recs.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 rounded-2xl hairline p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {p.imageUrls[0] && <img src={p.imageUrls[0]} alt="" className="h-14 w-14 shrink-0 rounded-xl bg-showcase object-contain p-1" />}
                <div>
                  <p className="font-semibold">{p.name} {p.storage} <span className="text-primary">{formatPrice(p.price)}</span></p>
                  <p className="text-sm text-muted-foreground">{reason(specFor(p.name)!, pr)}</p>
                </div>
              </div>
              <WhatsAppButton variant="outline" message={productMessage(p)} className="text-xs">{WA_LABEL}</WhatsAppButton>
            </div>
          ))}
          {recs.length >= 2 && (
            <button type="button" onClick={() => { onCompare(recs.map((r) => r.id)); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-sm text-primary hover:underline">
              Comparar estes iPhones
            </button>
          )}
          <p className="text-xs text-muted-foreground">Sugestões feitas por regras simples com base nas informações da Apple e no catálogo da loja.</p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">Nenhum iPhone disponível dentro desse valor. Fale com a loja pelo WhatsApp para outras opções.</p>
      ))}
    </section>
  );
}
