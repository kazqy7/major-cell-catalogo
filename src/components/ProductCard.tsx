import { Link } from "@tanstack/react-router";
import { Smartphone, BatteryMedium } from "lucide-react";
import { conditionLabel, formatPrice, productMessage, type ProductWithUrls } from "@/lib/products";
import { WhatsAppButton } from "./WhatsAppButton";

export function ProductCard({ p }: { p: ProductWithUrls }) {
  const price = formatPrice(p.price);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl hairline bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
      <Link to="/produto/$id" params={{ id: p.id }} className="relative block aspect-[4/5] overflow-hidden bg-secondary">
        {p.imageUrls[0] ? (
          <img
            src={p.imageUrls[0]}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Smartphone className="h-12 w-12" strokeWidth={1} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
          {conditionLabel(p.category)}
        </span>
        {p.status === "vendido" && (
          <span className="absolute right-3 top-3 rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground">
            Vendido
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <Link to="/produto/$id" params={{ id: p.id }}>
            <h3 className="text-lg font-semibold leading-tight hover:text-primary">{p.name}</h3>
          </Link>
          {p.model && <p className="text-sm text-muted-foreground">{p.model}</p>}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {p.storage && <span className="rounded-full bg-secondary px-2.5 py-1">{p.storage}</span>}
          {p.color && <span className="rounded-full bg-secondary px-2.5 py-1">{p.color}</span>}
          {p.category === "iphone_seminovo" && p.battery_health != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
              <BatteryMedium className="h-3.5 w-3.5 text-success" /> {p.battery_health}%
            </span>
          )}
        </div>
        <p className="mt-auto font-display text-xl font-semibold text-gold">
          {price ?? <span className="text-sm font-medium text-muted-foreground">Consulte disponibilidade</span>}
        </p>
        <WhatsAppButton message={productMessage(p)} className="w-full" />
      </div>
    </article>
  );
}
