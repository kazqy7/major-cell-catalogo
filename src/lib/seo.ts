import { ADDRESS, GOOGLE_REVIEWS, HOURS, POLICIES, STORE, STORE_PLACE } from "@/config/store";
import type { ProductWithUrls } from "@/lib/products";

/**
 * Dados estruturados (schema.org) que o Google lê para montar a ficha da loja e dos produtos,
 * e endereços absolutos para as prévias de link no WhatsApp e nas redes.
 */

/** Transforma um caminho do site ("/produto/1") em endereço completo. */
export const absUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${STORE.siteUrl}${path.startsWith("/") ? "" : "/"}${path}`);

/** Foto padrão das prévias de link: foto oficial de um iPhone da loja. */
export const DEFAULT_SHARE_IMAGE = absUrl(`/api/public/product-image/${encodeURIComponent("official/g-17pm-cosmicorange-1.jpg")}`);

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "5538988063088" → "+55 38 98806-3088". */
export function phoneDisplay(digits = STORE.WHATSAPP_NUMBER) {
  const m = digits.replace(/\D/g, "").match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `+${m[1]} ${m[2]} ${m[3]}-${m[4]}` : digits;
}

/** Ficha da loja: tipo "loja de celulares", endereço, horário, telefone e redes. */
export function storeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    "@id": `${STORE.siteUrl}/#loja`,
    name: STORE.name,
    description: `Loja de celulares em ${STORE_PLACE}: iPhones novos e seminovos, Xiaomi e assistência técnica.`,
    url: STORE.siteUrl,
    areaServed: { "@type": "City", name: ADDRESS.city },
    image: DEFAULT_SHARE_IMAGE,
    logo: absUrl("/favicon.png"),
    telephone: phoneDisplay(),
    ...(ADDRESS.street && {
      address: {
        "@type": "PostalAddress",
        streetAddress: `${ADDRESS.street}, ${ADDRESS.neighborhood}`,
        addressLocality: ADDRESS.city,
        addressRegion: ADDRESS.state,
        addressCountry: "BR",
      },
      hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE.address)}`,
    }),
    ...(HOURS.length > 0 && {
      openingHoursSpecification: HOURS.map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.days.map((d) => DAYS[d]),
        opens: h.open,
        closes: h.close,
      })),
    }),
    sameAs: [STORE.instagram && `https://www.instagram.com/${STORE.instagram}`, GOOGLE_REVIEWS.url].filter(Boolean),
    ...(POLICIES.payments.length > 0 && { paymentAccepted: POLICIES.payments.join(", ") }),
    ...(POLICIES.company.legalName && { legalName: POLICIES.company.legalName }),
    ...(POLICIES.company.cnpj && { taxID: POLICIES.company.cnpj }),
  };
}

/** Ficha de um aparelho: preço, condição (novo ou usado) e disponibilidade. */
export function productJsonLd(p: Pick<ProductWithUrls, "id" | "name" | "storage" | "price" | "category" | "status" | "imageUrls">) {
  const availability =
    p.status === "disponivel" ? "InStock" : p.status === "em_breve" ? "PreOrder" : "OutOfStock";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: [p.name, p.storage].filter(Boolean).join(" "),
    sku: p.id,
    brand: { "@type": "Brand", name: p.category === "xiaomi" ? "Xiaomi" : "Apple" },
    image: p.imageUrls.map(absUrl),
    ...(p.price != null && {
      offers: {
        "@type": "Offer",
        url: absUrl(`/produto/${p.id}`),
        price: p.price.toFixed(2),
        priceCurrency: "BRL",
        availability: `https://schema.org/${availability}`,
        itemCondition: `https://schema.org/${p.category === "iphone_seminovo" ? "UsedCondition" : "NewCondition"}`,
        seller: { "@id": `${STORE.siteUrl}/#loja` },
        ...(POLICIES.warrantyMonths[p.category] > 0 && {
          warranty: {
            "@type": "WarrantyPromise",
            durationOfWarranty: { "@type": "QuantitativeValue", value: POLICIES.warrantyMonths[p.category], unitCode: "MON" },
          },
        }),
      },
    }),
  };
}

/** Bloco <script type="application/ld+json"> para o head de uma rota. */
export const ldScript = (data: object) => ({ type: "application/ld+json", children: JSON.stringify(data) });
