import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { catalogError } from "@/components/CategoryPage";
import { whatsappLink } from "@/config/store";
import { comingSoonQuery, productsQuery } from "@/lib/products";
import { CONDITIONS, WORKS, tradeInMessage, validateTradeIn, type TradeIn } from "@/lib/trade-in";

const TITLE = "Troque seu iPhone usado | Major Cell";
const DESC = "Informe os dados do seu iPhone usado e receba pelo WhatsApp uma avaliação para troca na Major Cell.";

export const Route = createFileRoute("/troca")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(productsQuery()), context.queryClient.ensureQueryData(comingSoonQuery())]),
  errorComponent: catalogError,
  component: TradeInPage,
});

const EMPTY: TradeIn = { name: "", model: "", storage: "", condition: "", battery: "", works: "", notes: "", wanted: "", wantedLink: "", contact: "" };
const STORAGES = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "Não sei"];
const input = "mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground";

function TradeInPage() {
  const { data } = useSuspenseQuery(productsQuery());
  const iphones = data.filter((p) => p.category !== "xiaomi");
  const [f, setF] = useState<TradeIn>(EMPTY);
  const [wantedId, setWantedId] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof TradeIn, string>>>({});
  const set = (k: keyof TradeIn) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = iphones.find((x) => x.id === wantedId);
    const t: TradeIn = { ...f, wanted: p ? `${p.name} ${p.storage ?? ""}`.trim() : "", wantedLink: p ? `${window.location.origin}/produto/${p.id}` : "" };
    const errs = validateTradeIn(t);
    setErrors(errs);
    if (Object.keys(errs).length) { toast.error("Confira os campos destacados."); return; }
    const href = whatsappLink(tradeInMessage(t));
    if (!href) { toast.info("O número de WhatsApp da loja ainda não foi configurado."); return; }
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const Err = ({ k }: { k: keyof TradeIn }) => errors[k] ? <span className="mt-1 block text-xs text-destructive">{errors[k]}</span> : null;

  return (
    <div className="mx-auto max-w-2xl px-5 pb-20">
      <PageHeader eyebrow="Troca" title="Troque seu iPhone usado por outro na Major Cell"
        subtitle="Tem um iPhone usado? Informe os detalhes do seu aparelho e diga qual modelo deseja comprar. Nossa equipe avaliará as informações e entrará em contato pelo WhatsApp para conversar sobre as possibilidades de troca." />
      <div className="text-center"><a href="#avaliacao" className="inline-block rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground">Solicitar avaliação</a></div>

      <form id="avaliacao" noValidate onSubmit={submit} className="mt-10 space-y-5 rounded-3xl bg-card p-6 text-sm text-muted-foreground">
        <label className="block">Seu nome *<input className={input} value={f.name} onChange={set("name")} maxLength={80} autoComplete="name" /><Err k="name" /></label>
        <label className="block">Modelo do seu iPhone usado *<input className={input} value={f.model} onChange={set("model")} maxLength={60} placeholder="Ex.: iPhone 12" /><Err k="model" /></label>
        <label className="block">Armazenamento *
          <select className={input} value={f.storage} onChange={set("storage")}><option value="">Escolher</option>{STORAGES.map((s) => <option key={s}>{s}</option>)}</select><Err k="storage" />
        </label>
        <fieldset>
          <legend>Estado de conservação *</legend>
          <div className="mt-2 flex flex-wrap gap-2">{CONDITIONS.map((c) => (
            <button key={c} type="button" aria-pressed={f.condition === c} onClick={() => setF({ ...f, condition: c })}
              className={`rounded-full px-4 py-2 ${f.condition === c ? "bg-gold font-semibold text-primary-foreground" : "hairline text-foreground"}`}>{c}</button>
          ))}</div><Err k="condition" />
        </fieldset>
        <fieldset>
          <legend>Funcionamento *</legend>
          <div className="mt-2 flex flex-wrap gap-2">{WORKS.map((c) => (
            <button key={c} type="button" aria-pressed={f.works === c} onClick={() => setF({ ...f, works: c })}
              className={`rounded-full px-4 py-2 ${f.works === c ? "bg-gold font-semibold text-primary-foreground" : "hairline text-foreground"}`}>{c}</button>
          ))}</div><Err k="works" />
        </fieldset>
        <label className="block">Saúde da bateria em % (opcional)<input className={input} inputMode="numeric" value={f.battery} onChange={set("battery")} maxLength={4} placeholder="Ex.: 85" /><Err k="battery" /></label>
        <label className="block">Observações: riscos, peças trocadas, reparos ou defeitos (opcional)<textarea className={`${input} min-h-24`} value={f.notes} onChange={set("notes")} maxLength={500} /><Err k="notes" /></label>
        <label className="block">Modelo que deseja comprar na Major Cell (opcional)
          <select className={input} value={wantedId} onChange={(e) => setWantedId(e.target.value)}>
            <option value="">Ainda não escolhi</option>
            {iphones.map((p) => <option key={p.id} value={p.id}>{p.name} {p.storage}</option>)}
          </select>
        </label>
        <label className="block">Melhor contato, se não for este WhatsApp (opcional)<input className={input} value={f.contact} onChange={set("contact")} maxLength={100} placeholder="Telefone ou e-mail" /><Err k="contact" /></label>
        <p className="text-xs">O valor da avaliação depende da análise da nossa equipe e das condições reais do aparelho. A troca só é confirmada após a avaliação. Nunca pedimos senhas ou códigos de desbloqueio.</p>
        <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground">
          <MessageCircle className="h-4 w-4" /> Solicitar avaliação pelo WhatsApp
        </button>
      </form>
    </div>
  );
}
