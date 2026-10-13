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
      <section className="px-5 pt-16 text-center md:pt-24">
        <p className="text-sm font-medium text-primary">Major Cell</p>
        <h1 className="mx-auto mt-3 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
          Seu próximo smartphone.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground md:text-xl">
          iPhones novos, seminovos selecionados e Xiaomi, com atendimento de confiança.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/catalogo" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground">
            Ver aparelhos
          </Link>
          <WhatsAppButton variant="outline" className="px-6 py-3" message="Olá, Major Cell! Gostaria de atendimento.">
            Falar com a Major Cell
          </WhatsAppButton>
        </div>
        <div className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-3xl">
          <img src={hero} alt="Smartphones na Major Cell" width={1600} height={1008} className="w-full object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Categorias</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Escolha por onde começar</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link key={c.value} to={c.slug} className="group relative block overflow-hidden rounded-3xl">
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

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="grid gap-6 rounded-3xl bg-card p-8 md:grid-cols-3">
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
