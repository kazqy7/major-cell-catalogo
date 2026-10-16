import { waDeviceMessage, type Product } from "@/lib/products";

type OfferFields = Pick<Product, "offer_active" | "offer_price" | "offer_ends_at" | "status">;

/** An offer shows only if active, priced, not expired and the phone is not sold. */
export function isOfferLive(p: OfferFields, now: Date = new Date()): boolean {
  if (!p.offer_active || p.offer_price == null || p.status === "vendido") return false;
  if (p.offer_ends_at && new Date(p.offer_ends_at).getTime() <= now.getTime()) return false;
  return true;
}

export function offerMessage(
  p: Pick<Product, "name" | "model" | "storage" | "ram" | "offer_price">,
): string {
  return waDeviceMessage({ name: p.name, storage: p.storage, price: p.offer_price });
}
