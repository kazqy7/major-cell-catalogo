import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, BadgeCheck, Headphones } from "lucide-react";
import hero from "@/assets/hero.jpg";
import catNovo from "@/assets/cat-novo.jpg";
import catSemi from "@/assets/cat-seminovo.jpg";
import catXiaomi from "@/assets/cat-xiaomi.jpg";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CATEGORIES } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Major Cell — Seu próximo smartphone está aqui" },
      { name: "description", content: "iPhones novos, seminovos selecionados e Xiaomi. Encontre seu próximo aparelho com atendimento de confiança na Major Cell." },
      { property: "og:title", content: "Major Cell — Seu próximo smartphone está aqui" },
      { property: "og:description", content: "iPhones novos, seminovos selecionados e Xiaomi com atendimento de confiança." },
    ],
  }),
  component: Home,
});

const IMGS = { iphone_novo: catNovo, iphone_seminovo: catSemi, xiaomi: catXiaomi } as const;

function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <img src={hero} alt="" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover object-right opacity-70 md:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10" />
        <div className="relative mx-auto max-w-7xl px-5 py-24 md:py-36">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Major Cell</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.05] md:text-6xl">
            Seu próximo smartphone está na <span className="text-gold">Major Cell.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            iPhones novos, seminovos selecionados e Xiaomi. Encontre seu próximo aparelho com atendimento de confiança.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/catalogo" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5">
              Ver aparelhos <ArrowRight className="h-4 w-4" />
            </Link>
            <WhatsAppButton variant="outline" className="px-6 py-3" message="Olá, Major Cell! Gostaria de atendimento.">
              Falar com a Major Cell
            </WhatsAppButton>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Categorias</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Escolha por onde começar</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link key={c.value} to={c.slug} className="group relative block overflow-hidden rounded-2xl hairline shadow-card">
              <img src={IMGS[c.value]} alt={c.label} loading="lazy" width={800} height={1008} className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-2xl font-semibold">{c.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Ver aparelhos <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5">
        <div className="grid gap-6 rounded-2xl hairline bg-card/50 p-8 md:grid-cols-3">
          {[
            { i: ShieldCheck, t: "Procedência garantida", d: "Aparelhos verificados antes de chegarem até você." },
            { i: BadgeCheck, t: "Seminovos selecionados", d: "Avaliação criteriosa de estado e bateria." },
            { i: Headphones, t: "Atendimento próximo", d: "Tire dúvidas direto com a gente pelo WhatsApp." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="flex gap-4">
              <Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.5} />
              <div>
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
