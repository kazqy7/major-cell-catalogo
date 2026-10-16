import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Smartphone, Scale, RefreshCw, Sparkles, MessageCircle, Wrench } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { IphoneOrbit } from "@/components/IphoneOrbit";
import catSemi from "@/assets/cat-seminovo.jpg";
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

const official = (path: string) => `/api/public/product-image/${encodeURIComponent(path)}`;
// Category photos: official manufacturer images. Seminovos keeps its existing photo until a real one is supplied.
const IMGS = {
  iphone_novo: official("official/g-17pm-cosmicorange-1.jpg"),
  iphone_seminovo: catSemi,
  xiaomi: official("official/mfr-redmi-note-15-pro-5g.jpg"),
} as const;
const LAUNCH_IMG = official("official/g-iphone18pro-burgundy.jpg");

function Home() {
  const { data } = useSuspenseQuery(productsQuery());
  const { data: launches } = useSuspenseQuery(comingSoonQuery());
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
      <section className="relative mx-auto max-w-7xl px-5 pt-14 md:pt-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_55%_at_78%_45%,color-mix(in_oklab,var(--primary)_7%,transparent),transparent_75%)]" />
        <div className="grid items-center gap-8 text-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Major Cell</p>
            <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl ">
              Seu próximo iPhone. <span className="text-primary">Uma experiência superior.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground md:text-xl ">
              Tecnologia, confiança e atendimento personalizado para você escolher seu próximo aparelho.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to="/iphones-novos" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground">
                Ver iPhones
              </Link>
              <WhatsAppButton variant="outline" className="px-6 py-3" message="Olá, Major Cell! Gostaria de atendimento.">
                Falar pelo WhatsApp
              </WhatsAppButton>
            </div>
          </div>
          <div className="mt-6 md:mt-10">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              A evolução de um <span className="text-primary">ícone.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground md:text-lg">
              Conheça a história do iPhone, do primeiro modelo às gerações mais recentes.
            </p>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.25em] text-primary/80">Explore cada geração abaixo ↓</p>
          </div>
          <div className="relative w-full">
            <IphoneOrbit products={[...data, ...launches]} />
          </div>
        </div>
        <nav aria-label="Atalhos" className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:flex sm:justify-center">
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ...CATEGORIES.map((c) => ({ key: c.value, to: c.slug, hash: undefined as string | undefined, label: c.label, blurb: c.blurb, img: IMGS[c.value], cover: c.value === "iphone_seminovo", cta: "Ver aparelhos" })),
            ...(launches.length > 0 ? [{ key: "lancamentos", to: "/iphones-novos", hash: "lancamentos", label: "Lançamentos", blurb: "iPhone 18 Pro, 18 Pro Max e iPhone Duo. Em breve na loja.", img: LAUNCH_IMG, cover: false, cta: "Ver lançamentos" }] : []),
          ].map((c) => (
            <Link key={c.key} to={c.to} {...(c.hash ? { hash: c.hash } : {})} className="group flex h-full flex-col overflow-hidden rounded-3xl bg-card">
              <div className="aspect-square overflow-hidden bg-showcase">
                <img src={c.img} alt={c.label} loading="lazy" className={`h-full w-full transition-transform duration-700 group-hover:scale-105 ${c.cover ? "object-cover" : "object-contain p-4"}`} />
              </div>
              <div className="flex flex-1 flex-col p-6">
                {c.key === "lancamentos" && <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Em breve</p>}
                <h3 className="text-2xl font-semibold">{c.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-primary">
                  {c.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {launches.length > 0 && (
          <div className="mt-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Em breve</p>
            <h3 className="mt-2 text-2xl font-semibold md:text-3xl">Lançamentos iPhone</h3>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Apresentados pela Apple em setembro de 2026. Ainda sem estoque na Major Cell — consulte preço e previsão pelo WhatsApp.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {launches.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        )}
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
