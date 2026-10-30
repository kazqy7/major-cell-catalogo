import { INSTALLMENTS, POLICIES } from "@/config/store";
import type { Category } from "@/lib/products";

/** "Cartão, Pix ou dinheiro" — com o parcelamento máximo junto do cartão. */
export function paymentLine(payments = POLICIES.payments, max = INSTALLMENTS.maxInstallments) {
  const items = payments.map((p, i) => {
    const label = i === 0 || /pix/i.test(p) ? p : p.toLowerCase();
    if (/cart/i.test(p) && max > 1) return `${label} em até ${max}x`;
    return /pix/i.test(p) && POLICIES.pixNote ? `${label} ${POLICIES.pixNote}` : label;
  });
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} ou ${items[items.length - 1]}`;
}

/** Garantia do aparelho pela categoria; vazio quando a loja não informou. */
export const warrantyFor = (category: Category) => POLICIES.warranty[category] ?? "";
