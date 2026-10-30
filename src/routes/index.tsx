import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, MessageCircle } from "lucide-react";
import { IphoneOrbit } from "@/components/IphoneOrbit";
import catSemi from "@/assets/cat-seminovo.jpg";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CATEGORIES, comingSoonQuery, formatPrice, parsePhotoColors, productsQuery, type Category, type ProductWithUrls } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { CategoryShowcase, ColorLineup, colorOptions, modelOptions, type ShowcaseCategory } from "@/components/CategoryShowcase";
import { catalogError } from "@/components/CategoryPage";
import { StoreVisit } from "@/components/StoreVisit";
import { TrustStrip } from "@/components/TrustStrip";
import { Reviews } from "@/components/Reviews";
import { StoreFaq } from "@/components/StoreFaq";
import { STORE_PLACE } from "@/config/store";
import { faqJsonLd } from "@/lib/faq";
import { ldScript } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `Major Cell — Loja de celulares em ${STORE_PLACE}` },
      { name: "description", content: `Loja de celulares em ${STORE_PLACE}: iPhones novos, seminovos selecionados, Xiaomi e assistência técnica, com atendimento pelo WhatsApp.` },
      { property: "og:title", content: `Major Cell — Loja de celulares em ${STORE_PLACE}` },
      { property: "og:description", content: `iPhones novos, seminovos selecionados, Xiaomi e assistência técnica em ${STORE_PLACE}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    scripts: [ldScript(faqJsonLd())],
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
  // O iPhone mais novo em estoque abre a página; sem estoque, a foto oficial da categoria.
  const heroProduct = featured.find((p) => p.category !== "xiaomi" && p.imageUrls.length > 0);
  const heroImg = heroProduct?.imageUrls[0] ?? IMGS.iphone_novo;
  const heroPrice = heroProduct ? formatPrice(heroProduct.price) : null;
  // Fotos oficiais por cor: a geração mais nova vai para a faixa de cores; o card de iPhones novos
  // mostra o topo de linha da geração anterior, para as duas partes não repetirem o mesmo aparelho.
  const gen = (p: ProductWithUrls) => Number(p.name.match(/iPhone (\d+)/)?.[1] ?? 0);
  const nColors = (p: ProductWithUrls) => parsePhotoColors(p.photo_colors).length;
  const newest = (cat: Category, ok: (p: ProductWithUrls) => boolean) => [...data].reverse().find((p) => p.category === cat && ok(p));
  const newestGen = Math.max(0, ...data.filter((p) => p.category === "iphone_novo" && nColors(p) > 1).map(gen));
  const lineup = newest("iphone_novo", (p) => gen(p) === newestGen && nColors(p) >= 3);
  const optionsFor: Record<Category, ShowcaseCategory["options"]> = {
    iphone_novo: colorOptions(newest("iphone_novo", (p) => nColors(p) > 1 && gen(p) < newestGen)),
    iphone_seminovo: modelOptions(
      data
        .filter((p) => p.category === "iphone_seminovo")
        .sort((a, b) => gen(b) - gen(a) || b.name.length - a.name.length)
        .slice(0, 4),
    ),
    xiaomi: colorOptions(newest("xiaomi", (p) => nColors(p) > 1)),
  };
  const single = (label: string, image: string) => [{ label, hex: null, image }];
  const cats: ShowcaseCategory[] = [
    ...CATEGORIES.map((c) => ({
      key: c.value,
      to: c.slug,
      label: c.label,
      blurb: c.blurb,
      cta: "Ver aparelhos",
      options: optionsFor[c.value].length ? optionsFor[c.value] : single(c.label, IMGS[c.value]),
    })),
    ...(launches.length > 0
      ? [{
          key: "lancamentos",
          to: "/iphones-novos",
          hash: "lancamentos",
          label: "Lançamentos",
          blurb: "iPhone 18 Pro, 18 Pro Max e iPhone Duo. Em breve na loja.",
          cta: "Ver lançamentos",
          options: modelOptions(launches).length ? modelOptions(launches) : single("Lançamentos", LAUNCH_IMG),
        }]
      : []),
  ];
  const shortcuts = [
    { to: "/iphones-novos", label: "iPhones disponíveis" },
    ...(hasSemi ? [{ to: "/iphones-seminovos", label: "Seminovos" }] : []),
    { to: "/comparar", label: "Comparar iPhones" },
    { to: "/troca", label: "Trocar iPhone usado" },
    { to: "/assistencia", label: "Assistência Técnica" },
  ] as const;
  return (
    <>
      {/* Primeira tela: um título, um botão principal e o iPhone mais novo da loja em destaque. */}
      <section className="mx-auto max-w-7xl px-5 pt-10 md:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="text-center lg:text-left">
            <h1 className="text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Seu próximo iPhone está aqui.
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground md:text-xl lg:mx-0">
              iPhones novos, seminovos revisados e Xiaomi em {STORE_PLACE}, com atendimento direto pelo WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link to="/catalogo" className="rounded-full bg-gold px-7 py-3.5 text-base font-semibold text-primary-foreground">
                Ver aparelhos disponíveis
              </Link>
              <WhatsAppButton variant="outline" className="px-6 py-3.5" message="Olá, Major Cell! Gostaria de atendimento.">
                Falar pelo WhatsApp
              </WhatsAppButton>
            </div>
          </div>
          {heroProduct ? (
            <Link to="/produto/$id" params={{ id: heroProduct.id }} className="group mx-auto block w-full max-w-md lg:max-w-none">
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-showcase p-6 md:p-10">
                <img
                  src={heroImg}
                  alt={heroProduct.name}
                  width={800}
                  height={800}
                  fetchPriority="high"
                  className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4 px-1">
                <span className="text-lg font-semibold">{heroProduct.name}{heroProduct.storage ? ` · ${heroProduct.storage}` : ""}</span>
                {heroPrice && <span className="text-lg text-primary">{heroPrice}</span>}
              </div>
            </Link>
          ) : (
            <div className="mx-auto flex aspect-square w-full max-w-md lg:max-w-none items-center justify-center overflow-hidden rounded-3xl bg-showcase p-6 md:p-10">
              <img src={heroImg} alt="iPhone" width={800} height={800} fetchPriority="high" className="h-full w-full object-contain" />
            </div>
          )}
        </div>
      </section>

      <TrustStrip />

      <section className="mx-auto max-w-7xl px-5 pt-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">A evolução de um ícone</h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground md:text-lg">
          Conheça a história do iPhone, do primeiro modelo às gerações mais recentes.
        </p>
        <div className="relative mt-6 w-full">
          <IphoneOrbit products={[...data, ...launches]} />
        </div>
        <nav aria-label="Atalhos" className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:flex sm:justify-center">
          {shortcuts.map(({ to, label }) => (
            <Link key={to} to={to} className="flex items-center justify-center gap-2 rounded-2xl hairline px-4 py-3 text-sm text-foreground transition-colors hover:border-primary hover:text-primary">
              {label}
            </Link>
          ))}
        </nav>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold md:text-4xl">Destaques da loja</h2>
            </div>
            <Link to="/catalogo" className="hidden items-center gap-1 text-sm text-primary hover:underline sm:inline-flex">Ver tudo <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
          <Link to="/catalogo" className="mt-6 flex items-center justify-center gap-1 text-sm text-primary sm:hidden">Ver todos os aparelhos <ArrowRight className="h-4 w-4" /></Link>
        </section>
      )}

      {lineup && <ColorLineup p={lineup} />}

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold md:text-4xl">Escolha por onde começar</h2>
          </div>
        </div>
        <CategoryShowcase cats={cats} />

        {launches.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-semibold md:text-3xl">Lançamentos iPhone</h3>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground">Apresentados pela Apple em setembro de 2026. Ainda sem estoque na Major Cell — consulte preço e previsão pelo WhatsApp.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
              {launches.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        )}
      </section>

      <Reviews />

      <StoreVisit />

      <StoreFaq />

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-card p-8 text-center">
          <MessageCircle className="h-8 w-8 text-primary" strokeWidth={1.5} />
          <h2 className="text-2xl font-semibold md:text-3xl">Ficou com dúvida? Fale com a gente.</h2>
          <p className="max-w-md text-muted-foreground">Atendimento pelo WhatsApp oficial da Major Cell.</p>
          <WhatsAppButton className="px-6 py-3" message="Olá, Major Cell! Gostaria de atendimento.">Falar pelo WhatsApp</WhatsAppButton>
        </div>
      </section>
    </>
  );
}
