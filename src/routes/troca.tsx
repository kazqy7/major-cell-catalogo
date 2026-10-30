import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, MessageCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { catalogError } from "@/components/CategoryPage";
import { whatsappLink } from "@/config/store";
import { cn } from "@/lib/utils";
import { comingSoonQuery, formatPrice, productsQuery } from "@/lib/products";
import {
  CONDITIONS,
  CONDITION_HINTS,
  STORAGES,
  TRADE_MODELS,
  WORKS,
  stepErrors,
  tradeInMessage,
  validateTradeIn,
  type TradeIn,
} from "@/lib/trade-in";

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
const STEPS = ["Seu iPhone", "Estado", "O que você quer", "Enviar"];
const input = "mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
const chip = (on: boolean) =>
  cn(
    "rounded-full px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    on ? "bg-primary font-semibold text-primary-foreground" : "bg-secondary text-foreground hover:text-primary",
  );

function TradeInPage() {
  const { data } = useSuspenseQuery(productsQuery());
  // Aparelhos que a pessoa pode querer levar: iPhones do catálogo, do mais novo para o mais antigo.
  const iphones = data.filter((p) => p.category !== "xiaomi").reverse();
  const [f, setF] = useState<TradeIn>(EMPTY);
  const [step, setStep] = useState(0);
  const [gen, setGen] = useState("");
  const [otherModel, setOtherModel] = useState(false);
  const [batteryKnown, setBatteryKnown] = useState(false);
  const [wantedId, setWantedId] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof TradeIn, string>>>({});
  const top = useRef<HTMLDivElement>(null);
  const put = (patch: Partial<TradeIn>) => setF((o) => ({ ...o, ...patch }));
  const wanted = iphones.find((p) => p.id === wantedId);

  const go = (to: number) => {
    setStep(to);
    setErrors({});
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const next = () => {
    const errs = stepErrors(f, step);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    go(step + 1);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t: TradeIn = {
      ...f,
      wanted: wanted ? `${wanted.name} ${wanted.storage ?? ""}`.trim() : "",
      wantedLink: wanted ? `${window.location.origin}/produto/${wanted.id}` : "",
    };
    const errs = validateTradeIn(t);
    setErrors(errs);
    if (Object.keys(errs).length) {
      // Volta para a primeira etapa que tem erro.
      const first = [0, 1, 3].find((s) => Object.keys(stepErrors(t, s)).length);
      if (first !== undefined && first !== step) setStep(first);
      toast.error("Confira os campos destacados.");
      return;
    }
    const href = whatsappLink(tradeInMessage(t));
    if (!href) {
      toast.info("O número de WhatsApp da loja ainda não foi configurado.");
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const Err = ({ k }: { k: keyof TradeIn }) =>
    errors[k] ? (
      <span role="alert" className="mt-1.5 block text-sm text-destructive">
        {errors[k]}
      </span>
    ) : null;

  const summary: [string, string][] = [
    ["Seu iPhone", [f.model, f.storage].filter(Boolean).join(" · ")],
    ["Estado", f.condition],
    ["Funcionamento", f.works],
    ["Bateria", batteryKnown && f.battery ? `${f.battery}%` : f.condition ? "Não sei" : ""],
    ["Quer levar", wanted ? `${wanted.name} ${wanted.storage ?? ""}` : step > 2 ? "Ainda não escolhi" : ""],
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20">
      <PageHeader
        title="Troque seu iPhone usado"
        subtitle="Conte como está o seu iPhone em quatro passos rápidos. A gente avalia e responde pelo WhatsApp com as possibilidades de troca."
      />

      <div ref={top} className="mt-8 grid scroll-mt-20 gap-8 lg:grid-cols-[1fr_340px]">
        <form noValidate onSubmit={submit} className="rounded-3xl bg-card p-6 md:p-10">
          {/* Progresso: as etapas já feitas podem ser reabertas */}
          <ol className="grid grid-cols-4 gap-2" aria-label="Etapas da troca">
            {STEPS.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => go(i)}
                  aria-current={i === step ? "step" : undefined}
                  className="w-full text-left disabled:cursor-default"
                >
                  <span className={cn("block h-1.5 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-secondary")} />
                  <span className={cn("mt-2 hidden text-sm sm:block", i === step ? "font-semibold text-foreground" : "text-muted-foreground")}>{s}</span>
                </button>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted-foreground sm:hidden">{STEPS[step]}</p>

          {step === 0 && (
            <div className="mt-8 space-y-8">
              <fieldset>
                <legend className="text-2xl font-semibold text-foreground">Qual é o seu iPhone?</legend>
                <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Geração">
                  {TRADE_MODELS.map((g) => (
                    <button key={g.gen} type="button" aria-pressed={gen === g.gen && !otherModel} onClick={() => { setGen(g.gen); setOtherModel(false); }} className={chip(gen === g.gen && !otherModel)}>
                      {g.gen === "SE" ? "iPhone SE" : `iPhone ${g.gen}`}
                    </button>
                  ))}
                  <button type="button" aria-pressed={otherModel} onClick={() => { setOtherModel(true); setGen(""); put({ model: "" }); }} className={chip(otherModel)}>
                    Outro modelo
                  </button>
                </div>
                {gen && !otherModel && (
                  <div className="mt-4 flex flex-wrap gap-2 rounded-2xl bg-background p-3" role="radiogroup" aria-label="Modelo">
                    {TRADE_MODELS.find((g) => g.gen === gen)!.models.map((m) => (
                      <button key={m} type="button" role="radio" aria-checked={f.model === m} onClick={() => put({ model: m })} className={chip(f.model === m)}>
                        {m}
                      </button>
                    ))}
                  </div>
                )}
                {otherModel && (
                  <label className="mt-4 block text-sm text-muted-foreground">
                    Escreva o modelo
                    <input className={input} value={f.model} onChange={(e) => put({ model: e.target.value })} maxLength={60} placeholder="Ex.: iPhone XR" autoFocus />
                  </label>
                )}
                <Err k="model" />
              </fieldset>

              <fieldset>
                <legend className="text-lg font-semibold text-foreground">Armazenamento</legend>
                <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Armazenamento">
                  {STORAGES.map((s) => (
                    <button key={s} type="button" role="radio" aria-checked={f.storage === s} onClick={() => put({ storage: s })} className={chip(f.storage === s)}>
                      {s}
                    </button>
                  ))}
                </div>
                <Err k="storage" />
              </fieldset>
            </div>
          )}

          {step === 1 && (
            <div className="mt-8 space-y-8">
              <fieldset>
                <legend className="text-2xl font-semibold text-foreground">Como ele está?</legend>
                <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Estado de conservação">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={f.condition === c}
                      onClick={() => put({ condition: c })}
                      className={cn(
                        "rounded-2xl p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        f.condition === c ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/70",
                      )}
                    >
                      <span className="block font-semibold">{c}</span>
                      <span className={cn("mt-1 block text-sm", f.condition === c ? "text-primary-foreground/80" : "text-muted-foreground")}>{CONDITION_HINTS[c]}</span>
                    </button>
                  ))}
                </div>
                <Err k="condition" />
              </fieldset>

              <fieldset>
                <legend className="text-lg font-semibold text-foreground">Tudo funciona?</legend>
                <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Funcionamento">
                  {WORKS.map((w) => (
                    <button key={w} type="button" role="radio" aria-checked={f.works === w} onClick={() => put({ works: w })} className={chip(f.works === w)}>
                      {w}
                    </button>
                  ))}
                </div>
                <Err k="works" />
              </fieldset>

              <fieldset>
                <legend className="text-lg font-semibold text-foreground">Saúde da bateria</legend>
                <p className="mt-1 text-sm text-muted-foreground">Ajustes → Bateria → Saúde e Carregamento.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" aria-pressed={batteryKnown} onClick={() => { setBatteryKnown(true); if (!f.battery) put({ battery: "85" }); }} className={chip(batteryKnown)}>
                    Sei a porcentagem
                  </button>
                  <button type="button" aria-pressed={!batteryKnown} onClick={() => { setBatteryKnown(false); put({ battery: "" }); }} className={chip(!batteryKnown)}>
                    Não sei
                  </button>
                </div>
                {batteryKnown && (
                  <label className="mt-5 flex items-center gap-5">
                    <span className="sr-only">Saúde da bateria em porcentagem</span>
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={Number(f.battery) || 85}
                      onChange={(e) => put({ battery: e.target.value })}
                      className="h-2 flex-1 cursor-pointer accent-[var(--primary)]"
                    />
                    <span className="w-16 text-right text-2xl font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {f.battery}%
                    </span>
                  </label>
                )}
                <Err k="battery" />
              </fieldset>

              <label className="block text-sm text-muted-foreground">
                Algo mais que devemos saber? Riscos, peças trocadas, reparos ou defeitos (opcional)
                <textarea className={`${input} min-h-24`} value={f.notes} onChange={(e) => put({ notes: e.target.value })} maxLength={500} />
                <Err k="notes" />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-foreground">Qual iPhone você quer levar?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Opcional. Ajuda a gente a já responder com a diferença.</p>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3" role="radiogroup" aria-label="Aparelho desejado">
                <button
                  type="button"
                  role="radio"
                  aria-checked={!wantedId}
                  onClick={() => setWantedId("")}
                  className={cn("flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl p-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", !wantedId ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}
                >
                  <Smartphone className="h-6 w-6" aria-hidden="true" />
                  <span className="font-semibold">Ainda não escolhi</span>
                </button>
                {iphones.map((p) => {
                  const on = p.id === wantedId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setWantedId(p.id)}
                      className={cn("relative flex flex-col rounded-2xl p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/70")}
                    >
                      {on && <Check className="absolute right-3 top-3 h-5 w-5" aria-hidden="true" />}
                      <span className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-showcase p-2">
                        {p.imageUrls[0] ? (
                          <img src={p.imageUrls[0]} alt="" width={300} height={300} loading="lazy" className="h-full w-full object-contain" />
                        ) : (
                          <Smartphone className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                        )}
                      </span>
                      <span className="mt-3 font-semibold leading-tight">{p.name}</span>
                      <span className={cn("text-sm", on ? "text-primary-foreground/80" : "text-muted-foreground")}>
                        {[p.storage, p.category === "iphone_seminovo" ? "Seminovo" : "Novo"].filter(Boolean).join(" · ")}
                      </span>
                      {formatPrice(p.price) && <span className="mt-1 text-sm font-medium">{formatPrice(p.price)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-8 space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">Quase lá</h2>
              <label className="block text-sm text-muted-foreground">
                Seu nome
                <input className={input} value={f.name} onChange={(e) => put({ name: e.target.value })} maxLength={80} autoComplete="name" />
                <Err k="name" />
              </label>
              <label className="block text-sm text-muted-foreground">
                Melhor contato, se não for este WhatsApp (opcional)
                <input className={input} value={f.contact} onChange={(e) => put({ contact: e.target.value })} maxLength={100} placeholder="Telefone ou e-mail" autoComplete="tel" />
                <Err k="contact" />
              </label>
              <dl className="rounded-2xl bg-background p-5 lg:hidden">
                {summary.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-1.5 text-sm">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm text-muted-foreground">
                O valor depende da avaliação do aparelho pela nossa equipe, e a troca só é confirmada depois dela. Nunca pedimos senhas ou códigos de desbloqueio.
              </p>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button type="button" onClick={() => go(step - 1)} className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground focus-visible:text-foreground">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
              </button>
            ) : (
              <span />
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-semibold text-primary-foreground">
                Continuar <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-semibold text-primary-foreground">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Enviar pelo WhatsApp
              </button>
            )}
          </div>
        </form>

        {/* Resumo ao vivo, só no computador: vai se preenchendo a cada escolha */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl bg-card p-7">
            <h2 className="text-lg font-semibold">Seu pedido de troca</h2>
            <dl className="mt-4 space-y-3">
              {summary.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-sm text-muted-foreground">{k}</dt>
                  <dd className={cn("text-base", v ? "font-medium text-foreground" : "text-muted-foreground/60")}>{v || "a preencher"}</dd>
                </div>
              ))}
            </dl>
            {wanted?.imageUrls[0] && (
              <div className="mt-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-showcase p-3">
                <img src={wanted.imageUrls[0]} alt="" width={300} height={225} className="h-full w-full object-contain" />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
