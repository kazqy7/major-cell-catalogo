import { formatPrice, type Product } from "@/lib/products";

type OfferFields = Pick<Product, "offer_active" | "offer_price" | "offer_ends_at" | "status">;

/** An offer shows only if active, priced, not expired and the phone is not sold. */
export function isOfferLive(p: OfferFields, now: Date = new Date()): boolean {
  if (!p.offer_active || p.offer_price == null || p.status === "vendido") return false;
  if (p.offer_ends_at && new Date(p.offer_ends_at).getTime() <= now.getTime()) return false;
  return true;
}

export function offerMessage(p: Pick<Product, "name" | "model" | "storage" | "ram" | "offer_price">): string {
  const detail = [[p.name, p.model, p.storage].filter(Boolean).join(" "), p.ram ? `${p.ram} RAM` : null].filter(Boolean).join(" · ");
  const price = formatPrice(p.offer_price);
  return `Olá! Vi a oferta do ${detail}${price ? ` por ${price}` : ""} no site da Major Cell. Ela ainda está válida?`;
}
