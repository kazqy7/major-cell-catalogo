import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Smartphone, Scale, RefreshCw, Sparkles, MessageCircle, Wrench } from "lucide-react";
import hero from "@/assets/hero.jpg";
import catNovo from "@/assets/cat-novo.jpg";
import catSemi from "@/assets/cat-seminovo.jpg";
import catXiaomi from "@/assets/cat-xiaomi.jpg";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CATEGORIES, comingSoonQuery, productsQuery } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { catalogError } from "@/components/CategoryPage";
import { STORE } from "@/config/store";
import { Reviews } from "@/components/Reviews";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Major Cell — Seu próximo smartphone está aqui" },
      { name: "description", content: "iPhones novos, seminovos selecionados e Xiaomi. Encontre seu próximo aparelho com atendimento de confiança na Major Cell." },
      { property: "og:title", content: "Major Cell — Seu próximo smartphone está aqui" },
      { property: "og:description", content: "iPhones novos, seminovos selecionados e Xiaomi com atendimento de confiança." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(productsQuery()), context.queryClient.ensureQueryData(comingSoonQuery())]),
  errorComponent: catalogError,
  component: Home,
});

const IMGS = { iphone_novo: catNovo, iphone_seminovo: catSemi, xiaomi: catXiaomi } as const;

function Home() {
  const { data } = useSuspenseQuery(productsQuery());
  const iphones = data.filter((p) => p.category !== "xiaomi");
  const hasSemi = data.some((p) => p.category === "iphone_seminovo");
  // Newest 3 iPhones + newest Xiaomi in stock (catalog is ordered oldest → newest).
  const featured = [...iphones.slice(-3).reverse(), ...data.filter((p) => p.category === "xiaomi").slice(-1)];
  const shortcuts = [
    { to: "/iphones-novos", label: "iPhones disponíveis", icon: Smartphone },
    ...(hasSemi ? [{ to: "/iphones-seminovos", label: "Seminovos", icon: Sparkles }] : []),
    { to: "/comparar", label: "Comparar iPhones", icon: Scale },
    { to: "/troca", label: "Trocar iPhone usado", icon: RefreshCw },
    { to: "/assistencia", label: "Assistência Técnica", icon: Wrench },
  ] as const;
  return (
    <>
      <section className="px-5 pt-16 text-center md:pt-24">
        <p className="text-sm font-medium text-primary">Major Cell</p>
        <h1 className="mx-auto mt-3 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
          Encontre seu próximo <span className="text-primary">celular</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground md:text-xl">
          iPhones e Xiaomi com preço na vitrine e atendimento direto pelo WhatsApp.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/iphones-novos" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground">
            Ver iPhones
          </Link>
          <WhatsAppButton variant="outline" className="px-6 py-3" message="Olá, Major Cell! Gostaria de atendimento.">
            Falar pelo WhatsApp
          </WhatsAppButton>
        </div>
        <nav aria-label="Atalhos" className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:flex sm:justify-center">
          {shortcuts.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center justify-center gap-2 rounded-2xl hairline px-4 py-3 text-sm text-foreground transition-colors hover:border-primary hover:text-primary">
              <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} /> {label}
            </Link>
          ))}
        </nav>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Disponíveis agora</p>
              <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Destaques da loja</h2>
            </div>
            <Link to="/catalogo" className="hidden items-center gap-1 text-sm text-primary hover:underline sm:inline-flex">Ver tudo <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
          <Link to="/catalogo" className="mt-6 flex items-center justify-center gap-1 text-sm text-primary sm:hidden">Ver todos os aparelhos <ArrowRight className="h-4 w-4" /></Link>
        </section>
      )}

      <div className="mx-auto mt-16 max-w-6xl overflow-hidden rounded-3xl px-5">
        <img src={hero} alt="Smartphones na Major Cell" width={1600} height={1008} loading="lazy" className="w-full rounded-3xl object-cover" />
      </div>

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

      <Reviews />

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-card p-8 text-center">
          <MessageCircle className="h-8 w-8 text-primary" strokeWidth={1.5} />
          <h2 className="text-2xl font-semibold md:text-3xl">Ficou com dúvida? Fale com a gente.</h2>
          <p className="max-w-md text-muted-foreground">Atendimento pelo WhatsApp oficial da Major Cell.</p>
          <WhatsAppButton className="px-6 py-3" message="Olá, Major Cell! Gostaria de atendimento.">Falar pelo WhatsApp</WhatsAppButton>
          {STORE.address && <p className="text-sm text-muted-foreground">{STORE.address}</p>}
          {STORE.hours && <p className="text-sm text-muted-foreground">{STORE.hours}</p>}
        </div>
      </section>
    </>
  );
}
