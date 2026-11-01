import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Smartphone, ChevronRight, ChevronLeft } from "lucide-react";
import { conditionLabel, formatPrice, parseColors, parsePhotoColors, productMessage, comingSoonMessage, type ProductWithUrls } from "@/lib/products";
import { whatsappLink } from "@/config/store";
import { FavoriteButton, StockBadge } from "./FavoriteButton";
import { SwapImage } from "./SwapImage";
import { preloadImages, preloadWhenIdle } from "@/lib/preload";

export function ProductCard({ p }: { p: ProductWithUrls }) {
  const soon = p.status === "em_breve";
  const sold = p.status !== "disponivel" && !soon;
  const price = formatPrice(p.price);
  // Nome completo para leitores de tela: os cards têm os mesmos botões, mas cada um leva a um aparelho.
  const label = [p.name, p.storage].filter(Boolean).join(" ");
  const hasColors = parseColors(p.colors).length > 0;
  const photoColors = parsePhotoColors(p.photo_colors);
  const [sel, setSel] = useState<number | null>(null);
  const shown = photoColors.slice(0, 5);
  const extra = photoColors.length - shown.length;
  const gallery = sel != null
    ? photoColors[sel]?.images ?? []
    : Array.from(new Set([...p.imageUrls, ...photoColors.flatMap((c) => c.images)]));
  const [idx, setIdx] = useState(0);
  const i0 = Math.min(idx, Math.max(gallery.length - 1, 0));
  const img = gallery[i0];
  const step = (d: number) => setIdx((i0 + d + gallery.length) % gallery.length);
  const arrow = "absolute top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border sm:h-9 sm:w-9 border-primary/40 bg-background/80 text-primary backdrop-blur transition hover:bg-primary hover:text-primary-foreground md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100";
  const card = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = card.current;
    if (!el || photoColors.length < 2) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          preloadWhenIdle(photoColors.map((c) => c.images[0]));
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
    // As cores de um produto não mudam enquanto o card está na tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.id]);
  const warm = () => preloadImages(photoColors.flatMap((c) => c.images.slice(0, 2)));
  const wa = sold ? null : whatsappLink(soon ? comingSoonMessage(p, sel != null ? photoColors[sel]?.name : null) : productMessage(p));
  return (
    <article ref={card} onPointerEnter={warm} onTouchStart={warm} onFocus={warm} className="group relative flex flex-col rounded-2xl bg-card p-3 text-center sm:rounded-3xl sm:p-6 transition-transform duration-500 hover:scale-[1.01]">
      <FavoriteButton id={p.id} name={p.name} className="absolute right-1.5 top-1.5 z-10 sm:right-4 sm:top-4" />
      <Link to="/produto/$id" params={{ id: p.id }} className="block">
        <p className="text-sm font-medium text-primary">{conditionLabel(p.category)}</p>
        <h3 className="mt-2 text-base font-semibold leading-tight sm:text-2xl">{p.name}</h3>
        {p.storage && <p className="mt-1 text-[13px] text-muted-foreground sm:text-sm">{p.storage}{p.ram ? ` · ${p.ram} RAM` : ""}</p>}
        <div className="mt-2"><StockBadge status={p.status} /></div>
      </Link>
      <div className="relative mt-3 sm:mt-6">
      <Link to="/produto/$id" params={{ id: p.id }} className="block" tabIndex={-1} aria-hidden="true">
        <div className="relative mx-auto flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-showcase p-2 sm:rounded-2xl sm:p-4">
          {img ? (
            <SwapImage src={img} alt={p.name} width={600} height={600} loading="lazy" decoding="async" className={`h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03] ${sold ? "opacity-50" : ""}`} />
          ) : (
            <Smartphone className="h-14 w-14 text-muted-foreground" strokeWidth={1} />
          )}
        </div>
      </Link>
      {gallery.length > 1 && (
        <>
          <button type="button" aria-label="Foto anterior" onClick={() => step(-1)} className={`${arrow} left-1 sm:left-2`}><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" aria-label="Próxima foto" onClick={() => step(1)} className={`${arrow} right-1 sm:right-2`}><ChevronRight className="h-5 w-5" /></button>
          <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/70 px-2 py-0.5 text-[10px] text-muted-foreground">{i0 + 1}/{gallery.length}</span>
        </>
      )}
      </div>
      {shown.length > 0 && (
        <div className="mt-3 flex flex-col items-center gap-1 sm:mt-4">
          <div className="flex items-center justify-center gap-2" role="radiogroup" aria-label="Cores">
            {shown.map((c, i) => (
              <button
                key={c.name}
                type="button"
                role="radio"
                aria-checked={sel === i}
                aria-label={c.name}
                title={c.name}
                onClick={() => { setSel(i); setIdx(0); }}
                className={`h-4 w-4 rounded-full border border-border ring-offset-2 ring-offset-card transition ${sel === i ? "ring-1 ring-primary" : ""}`}
                style={{ backgroundColor: c.hex ?? "var(--muted)" }}
              />
            ))}
            {extra > 0 && (
              <Link to="/produto/$id" params={{ id: p.id }} className="text-xs text-muted-foreground hover:text-primary">+{extra}</Link>
            )}
          </div>
          <p className="h-4 text-[11px] text-muted-foreground" aria-live="polite">{sel != null ? photoColors[sel]?.name : ""}</p>
        </div>
      )}
      <p className={`${shown.length ? "mt-2 sm:mt-3" : "mt-3 sm:mt-6"} text-base font-medium sm:text-lg`}>
        {soon ? <span className="text-sm text-muted-foreground">Preço a consultar</span> : price ?? <span className="text-sm text-muted-foreground">Consulte disponibilidade</span>}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 whitespace-nowrap text-[13px] sm:mt-4 sm:gap-y-3 sm:text-sm">
        <Link to="/produto/$id" params={{ id: p.id }} aria-label={`${hasColors ? "Escolher cor" : "Ver detalhes"}: ${label}`} className="w-full rounded-full bg-gold px-3 py-2 font-semibold text-primary-foreground sm:w-auto sm:px-5">
          {hasColors ? "Escolher cor" : "Ver detalhes"}
        </Link>
        {(soon || !hasColors) && wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" aria-label={`${soon ? "Consultar lançamento" : "Consultar no WhatsApp"}: ${label}`} className="inline-flex items-center text-primary hover:underline">
            {soon ? "Consultar lançamento" : "Consultar no WhatsApp"} <ChevronRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}
