import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Smartphone,
  BatteryCharging,
  Cpu,
  PlugZap,
  Camera,
  Search,
  ToggleRight,
  Volume2,
  Wrench,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { cn } from "@/lib/utils";
import {
  REPAIR_SERVICES,
  pickService,
  repairLink,
  validateRepair,
  type RepairForm,
  type RepairServiceKey,
} from "@/lib/repair";

export const Route = createFileRoute("/assistencia")({
  head: () => ({
    meta: [
      { title: "Assistência Técnica | Major Cell" },
      {
        name: "description",
        content:
          "Solicite pelo WhatsApp uma avaliação para reparo do seu celular na Major Cell: tela, bateria, placa, conector, câmera, botões, áudio e diagnóstico.",
      },
      { property: "og:title", content: "Assistência Técnica | Major Cell" },
      {
        property: "og:description",
        content: "Solicite uma avaliação para o reparo do seu celular na Major Cell.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Assistencia,
});

const ICONS: Record<RepairServiceKey, LucideIcon> = {
  tela: Smartphone,
  bateria: BatteryCharging,
  placa: Cpu,
  conector: PlugZap,
  camera: Camera,
  diagnostico: Search,
  botoes: ToggleRight,
  audio: Volume2,
  outros: Wrench,
};

const FIELDS: { k: keyof RepairForm; label: string; ph: string }[] = [
  { k: "name", label: "Seu nome", ph: "Como podemos te chamar" },
  { k: "brand", label: "Marca do aparelho", ph: "Ex.: Apple, Xiaomi, Samsung" },
  { k: "model", label: "Modelo do aparelho", ph: "Ex.: iPhone 12" },
  { k: "service", label: "Serviço ou defeito", ph: "Ex.: tela quebrada, não carrega" },
];

function Assistencia() {
  const [f, setF] = useState<RepairForm>({ name: "", brand: "", model: "", service: "", details: "" });
  const [errors, setErrors] = useState<(keyof RepairForm)[]>([]);
  const formRef = useRef<HTMLDivElement>(null);
  const input =
    "mt-1.5 w-full rounded-xl hairline bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary";

  function requestQuote(service: string) {
    const next = pickService(f, service);
    setF(next);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const missing = validateRepair(next);
    if (missing.length) {
      window.setTimeout(
        () => document.getElementById(`repair-${missing[0]}`)?.focus({ preventScroll: true }),
        350,
      );
      return;
    }
    const href = repairLink(next);
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = validateRepair(f);
    setErrors(missing);
    if (missing.length) return;
    const href = repairLink(f);
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <PageHeader
        eyebrow="Assistência técnica"
        title="Assistência Técnica Major Cell"
        subtitle="Seu celular precisa de reparo? Entre em contato com a Major Cell e solicite uma avaliação para o seu aparelho."
      />
      <div className="flex justify-center px-5">
        <WhatsAppButton
          className="px-6 py-3"
          message="Olá! Gostaria de solicitar um orçamento para assistência técnica na Major Cell."
        >
          Solicitar orçamento pelo WhatsApp
        </WhatsAppButton>
      </div>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl font-semibold">Serviços para consulta</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
          Cada serviço depende da avaliação do aparelho. Valores e prazos são informados no atendimento.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPAIR_SERVICES.map(({ key, name, problems }) => {
            const Icon = ICONS[key];
            const selected = f.service === name;
            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col rounded-2xl hairline bg-card p-6 transition-colors",
                  selected && "border-primary",
                )}
              >
                <Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.5} />
                <h3 className="mt-4 text-base font-medium">{name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{problems}</p>
                <button
                  type="button"
                  onClick={() => requestQuote(name)}
                  className={cn(
                    "mt-5 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                    selected
                      ? "bg-gold text-primary-foreground hover:opacity-90"
                      : "hairline text-foreground hover:border-primary hover:text-primary",
                  )}
                >
                  <MessageCircle className="h-4 w-4" /> Solicitar orçamento
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section id="orcamento" ref={formRef} className="mx-auto max-w-2xl scroll-mt-24 px-5 pb-20">
        <form onSubmit={submit} noValidate className="rounded-3xl hairline bg-card p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Solicitar orçamento</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Preencha e envie pelo WhatsApp. Nada fica salvo no site.
          </p>
          <div className="mt-6 grid gap-4">
            {FIELDS.map(({ k, label, ph }) => (
              <label key={k} className="block text-sm">
                {label} <span className="text-primary">*</span>
                <input
                  id={`repair-${k}`}
                  className={input}
                  value={f[k]}
                  maxLength={120}
                  placeholder={ph}
                  aria-invalid={errors.includes(k)}
                  onChange={(e) => setF({ ...f, [k]: e.target.value })}
                />
                {errors.includes(k) && (
                  <span className="mt-1 block text-xs text-destructive">Campo obrigatório</span>
                )}
              </label>
            ))}
            <label className="block text-sm">
              Descrição adicional (opcional)
              <textarea
                className={input}
                rows={4}
                maxLength={600}
                value={f.details}
                onChange={(e) => setF({ ...f, details: e.target.value })}
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" /> Enviar solicitação pelo WhatsApp
          </button>
        </form>
      </section>
    </>
  );
}
