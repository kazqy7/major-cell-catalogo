import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { formatPrice, parsePhotoColors, type ProductWithUrls } from "@/lib/products";

/** Uma opção de foto num card: uma cor (com hex) ou um modelo (sem hex). */
export type ShowcaseOption = { label: string; hex: string | null; image: string };

export type ShowcaseCategory = {
  key: string;
  to: string;
  hash?: string;
  label: string;
  blurb: string;
  cta: string;
  options: ShowcaseOption[];
};

/** Cores oficiais de um aparelho, uma foto por cor. */
export const colorOptions = (p: ProductWithUrls | undefined): ShowcaseOption[] =>
  p ? parsePhotoColors(p.photo_colors).flatMap((c) => (c.images[0] ? [{ label: c.name, hex: c.hex, image: c.images[0] }] : [])) : [];

/** Um modelo por aparelho, com a primeira foto de cada um. */
export const modelOptions = (list: ProductWithUrls[]): ShowcaseOption[] =>
  list.flatMap((p) => (p.imageUrls[0] ? [{ label: p.name.replace(/^iPhone\s+/, ""), hex: null, image: p.imageUrls[0] }] : []));

/**
 * Cards de categoria: a foto troca pela cor ou pelo modelo escolhido.
 * No celular viram um carrossel para deslizar com o dedo; do tablet em diante, uma grade.
 */
export function CategoryShowcase({ cats }: { cats: ShowcaseCategory[] }) {
  return (
    <div className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
      {cats.map((c) => (
        <CategoryCard key={c.key} c={c} />
      ))}
    </div>
  );
}

function CategoryCard({ c }: { c: ShowcaseCategory }) {
  const [i, setI] = useState(0);
  const opt = c.options[Math.min(i, c.options.length - 1)];
  const isColor = c.options.some((o) => o.hex);
  const link = { to: c.to, ...(c.hash ? { hash: c.hash } : {}) };
  // Baixa as outras fotos assim que o card recebe o mouse, o dedo ou o foco, para a troca ser imediata.
  const [warm, setWarm] = useState(false);
  const preload = () => {
    if (warm) return;
    setWarm(true);
    c.options.forEach((o) => {
      new Image().src = o.image;
    });
  };
  return (
    <article
      onPointerEnter={preload}
      onTouchStart={preload}
      onFocus={preload}
      className="group flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-card transition-colors hover:bg-secondary sm:w-auto"
    >
      <Link {...link} tabIndex={-1} aria-hidden="true" className="block aspect-square overflow-hidden bg-showcase">
        {opt && (
          <img
            key={opt.image}
            src={opt.image}
            alt=""
            width={600}
            height={600}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-6 duration-500 animate-in fade-in zoom-in-95 transition-transform group-hover:scale-105 motion-reduce:animate-none motion-reduce:transition-none"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-xl font-semibold sm:text-2xl">
          <Link {...link} className="focus-visible:underline">{c.label}</Link>
        </h3>
        <p className="mt-1 text-base text-muted-foreground">{c.blurb}</p>
        {c.options.length > 1 && (
          <div className="mt-4">
            <div role="radiogroup" aria-label={isColor ? `Cores de ${c.label}` : `Modelos de ${c.label}`} className="flex flex-wrap items-center gap-2">
              {c.options.map((o, k) =>
                o.hex ? (
                  <button
                    key={o.label}
                    type="button"
                    role="radio"
                    aria-checked={k === i}
                    aria-label={o.label}
                    title={o.label}
                    onClick={() => setI(k)}
                    className={`h-7 w-7 rounded-full border border-white/15 ring-offset-2 ring-offset-card transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${k === i ? "ring-2 ring-primary" : ""}`}
                    style={{ backgroundColor: o.hex }}
                  />
                ) : (
                  <button
                    key={o.label}
                    type="button"
                    role="radio"
                    aria-checked={k === i}
                    onClick={() => setI(k)}
                    className={`rounded-full px-3 py-1.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${k === i ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:text-primary"}`}
                  >
                    {o.label}
                  </button>
                ),
              )}
            </div>
            {isColor && (
              <p className="mt-2 text-[13px] text-muted-foreground" aria-live="polite">
                {opt?.label}
              </p>
            )}
          </div>
        )}
        <Link {...link} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary">
          {c.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

/**
 * Faixa de um aparelho em todas as cores oficiais, lado a lado.
 * Substitui a antiga imagem genérica entre os Destaques e as Categorias.
 */
export function ColorLineup({ p }: { p: ProductWithUrls }) {
  const colors = colorOptions(p);
  const price = formatPrice(p.price);
  return (
    <section className="mx-auto mt-20 max-w-7xl px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">{p.name}</h2>
          <p className="mt-3 max-w-xl text-base text-muted-foreground md:text-lg">
            {p.storage ? `${p.storage}, ` : ""}novo e lacrado. Em {colors.map((c) => c.label).join(", ").replace(/, ([^,]*)$/, " e $1")}.
          </p>
        </div>
        <div className="flex items-center gap-5">
          {price && <span className="text-xl font-medium text-primary">{price}</span>}
          <Link to="/produto/$id" params={{ id: p.id }} className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground">
            Escolher cor
          </Link>
        </div>
      </div>
      <div className="-mx-5 mt-8 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {colors.slice(0, 4).map((c) => (
          <Link
            key={c.label}
            to="/produto/$id"
            params={{ id: p.id }}
            className="group block w-[70%] shrink-0 snap-start md:w-auto"
            aria-label={`${p.name} ${c.label}`}
          >
            <div className="aspect-square overflow-hidden rounded-3xl bg-showcase">
              <img
                src={c.image}
                alt=""
                width={600}
                height={600}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
              />
            </div>
            <p className="mt-3 flex items-center gap-2 text-sm text-foreground">
              {c.hex && <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.hex }} aria-hidden="true" />}
              {c.label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
