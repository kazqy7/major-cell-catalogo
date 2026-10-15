import { Link } from "@tanstack/react-router";
import { Smartphone, ChevronRight } from "lucide-react";
import { conditionLabel, formatPrice, parseColors, productMessage, type ProductWithUrls } from "@/lib/products";
import { whatsappLink } from "@/config/store";
import { FavoriteButton, StockBadge } from "./FavoriteButton";

export function ProductCard({ p }: { p: ProductWithUrls }) {
  const sold = p.status !== "disponivel";
  const price = formatPrice(p.price);
  const hasColors = parseColors(p.colors).length > 0;
  const wa = sold ? null : whatsappLink(productMessage(p));
  return (
    <article className="group relative flex flex-col rounded-3xl bg-card p-6 text-center transition-transform duration-500 hover:scale-[1.01]">
      <FavoriteButton id={p.id} name={p.name} className="absolute right-4 top-4 z-10" />
      <Link to="/produto/$id" params={{ id: p.id }} className="block">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">{conditionLabel(p.category)}</p>
        <h3 className="mt-2 text-2xl font-semibold leading-tight">{p.name}</h3>
        {p.storage && <p className="mt-1 text-sm text-muted-foreground">{p.storage}{p.ram ? ` · ${p.ram} RAM` : ""}</p>}
        <div className="mt-2"><StockBadge status={p.status} /></div>
        <div className="relative mx-auto mt-6 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-showcase p-4">
          {p.imageUrls[0] ? (
            <img src={p.imageUrls[0]} alt={p.name} loading="lazy" className={`h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03] ${sold ? "opacity-50" : ""}`} />
          ) : (
            <Smartphone className="h-14 w-14 text-muted-foreground" strokeWidth={1} />
          )}
        </div>
      </Link>
      <p className="mt-6 text-lg font-medium">
        {price ?? <span className="text-sm text-muted-foreground">Consulte disponibilidade</span>}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 whitespace-nowrap text-sm">
        <Link to="/produto/$id" params={{ id: p.id }} className="rounded-full bg-gold px-5 py-2 font-semibold text-primary-foreground">
          {hasColors ? "Escolher cor" : "Ver detalhes"}
        </Link>
        {!hasColors && wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline">
            Consultar no WhatsApp <ChevronRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}
