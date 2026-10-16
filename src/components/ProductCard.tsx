import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Smartphone, ChevronRight, ChevronLeft } from "lucide-react";
import { conditionLabel, formatPrice, parseColors, parsePhotoColors, productMessage, comingSoonMessage, type ProductWithUrls } from "@/lib/products";
import { whatsappLink } from "@/config/store";
import { FavoriteButton, StockBadge } from "./FavoriteButton";

export function ProductCard({ p }: { p: ProductWithUrls }) {
  const soon = p.status === "em_breve";
  const sold = p.status !== "disponivel" && !soon;
  const price = formatPrice(p.price);
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
  const arrow = "absolute top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary/40 bg-background/80 text-primary backdrop-blur transition hover:bg-primary hover:text-primary-foreground md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100";
  const wa = sold ? null : whatsappLink(soon ? comingSoonMessage(p, sel != null ? photoColors[sel]?.name : null) : productMessage(p));
  return (
    <article className="group relative flex flex-col rounded-3xl bg-card p-6 text-center transition-transform duration-500 hover:scale-[1.01]">
      <FavoriteButton id={p.id} name={p.name} className="absolute right-4 top-4 z-10" />
      <Link to="/produto/$id" params={{ id: p.id }} className="block">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">{conditionLabel(p.category)}</p>
        <h3 className="mt-2 text-2xl font-semibold leading-tight">{p.name}</h3>
        {p.storage && <p className="mt-1 text-sm text-muted-foreground">{p.storage}{p.ram ? ` · ${p.ram} RAM` : ""}</p>}
        <div className="mt-2"><StockBadge status={p.status} /></div>
      </Link>
      <div className="relative mt-6">
      <Link to="/produto/$id" params={{ id: p.id }} className="block" tabIndex={-1} aria-hidden="true">
        <div className="relative mx-auto flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-showcase p-4">
          {img ? (
            <img src={img} alt={p.name} loading="lazy" className={`h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03] ${sold ? "opacity-50" : ""}`} />
          ) : (
            <Smartphone className="h-14 w-14 text-muted-foreground" strokeWidth={1} />
          )}
        </div>
      </Link>
      {gallery.length > 1 && (
        <>
          <button type="button" aria-label="Foto anterior" onClick={() => step(-1)} className={`${arrow} left-2`}><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" aria-label="Próxima foto" onClick={() => step(1)} className={`${arrow} right-2`}><ChevronRight className="h-5 w-5" /></button>
          <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/70 px-2 py-0.5 text-[10px] text-muted-foreground">{i0 + 1}/{gallery.length}</span>
        </>
      )}
      </div>
      {shown.length > 0 && (
        <div className="mt-4 flex flex-col items-center gap-1">
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
      <p className={`${shown.length ? "mt-3" : "mt-6"} text-lg font-medium`}>
        {soon ? <span className="text-sm text-muted-foreground">Preço a consultar</span> : price ?? <span className="text-sm text-muted-foreground">Consulte disponibilidade</span>}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 whitespace-nowrap text-sm">
        <Link to="/produto/$id" params={{ id: p.id }} className="rounded-full bg-gold px-5 py-2 font-semibold text-primary-foreground">
          {hasColors ? "Escolher cor" : "Ver detalhes"}
        </Link>
        {(soon || !hasColors) && wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline">
            {soon ? "Consultar lançamento" : "Consultar no WhatsApp"} <ChevronRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}
