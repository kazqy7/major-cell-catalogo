import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Category = Database["public"]["Enums"]["product_category"];
export type ProductWithUrls = Product & { imageUrls: string[] };

export const CATEGORIES: { value: Category; label: string; slug: string; blurb: string }[] = [
  { value: "iphone_novo", label: "iPhones novos", slug: "/iphones-novos", blurb: "Lacrados, com garantia e procedência." },
  { value: "iphone_seminovo", label: "iPhones seminovos", slug: "/iphones-seminovos", blurb: "Selecionados e revisados um a um." },
  { value: "xiaomi", label: "Xiaomi", slug: "/xiaomi", blurb: "Tecnologia de ponta com ótimo custo-benefício." },
];

export const categoryLabel = (c: Category) => CATEGORIES.find((x) => x.value === c)?.label ?? c;
export const conditionLabel = (c: Category) =>
  c === "iphone_seminovo" ? "Seminovo" : "Novo";

export const formatPrice = (p: number | null) =>
  p == null ? null : p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const BUCKET = "product-images";

// Product photos are served through a same-origin public endpoint that only
// exposes the "official/" folder of the private bucket, so no public read
// policy is needed on storage.
function imageUrl(path: string): string {
  return `/api/public/product-image/${encodeURIComponent(path)}`;
}

function withUrls(products: Product[]): ProductWithUrls[] {
  return products.map((p) => ({
    ...p,
    imageUrls: p.images.filter(Boolean).map(imageUrl),
  }));
}

export const isComingSoon = (p: Pick<Product, "status">) => p.status === "em_breve";

/** WhatsApp text for a launch that the store has not priced or stocked yet. */
export const comingSoonMessage = (p: Pick<Product, "name">, color?: string | null) =>
  `Olá! Gostaria de saber sobre o lançamento ${p.name}${color ? ` na cor ${color}` : ""}. Vocês terão esse modelo? Qual será o preço?`;

/** Coming-soon launches: shown separately, never counted as stock. */
export const comingSoonQuery = () =>
  queryOptions({
    queryKey: ["products", "em_breve"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products").select("*").eq("status", "em_breve")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return withUrls(data ?? []);
    },
  });

export const productsQuery = (opts: { includeSold?: boolean } = {}) =>
  queryOptions({
    queryKey: ["products", opts.includeSold ? "all" : "available"],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (!opts.includeSold) q = q.eq("status", "disponivel");
      const { data, error } = await q;
      if (error) throw error;
      return withUrls(data ?? []);
    },
  });

export const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return withUrls([data])[0];
    },
  });

export type ProductColor = { name: string; image: string | null; available: boolean };

export function parseColors(raw: unknown): ProductColor[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c): c is { name?: unknown; image?: unknown; available?: unknown } => !!c && typeof c === "object")
    .map((c) => ({
      name: typeof c.name === "string" ? c.name.trim() : "",
      image: typeof c.image === "string" && c.image ? c.image : null,
      available: c.available === true,
    }))
    .filter((c) => c.name);
}

export const colorImageUrl = (path: string) => imageUrl(path);

/** Official photo colors: visual only, never tied to stock. */
export type PhotoColor = { name: string; hex: string | null; images: string[] };

export function parsePhotoColors(raw: unknown): PhotoColor[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c): c is { name?: unknown; hex?: unknown; images?: unknown } => !!c && typeof c === "object")
    .map((c) => ({
      name: typeof c.name === "string" ? c.name.trim() : "",
      hex: typeof c.hex === "string" && /^#[0-9a-f]{6}$/i.test(c.hex) ? c.hex : null,
      images: Array.isArray(c.images) ? c.images.filter((i): i is string => typeof i === "string" && !!i).map(imageUrl) : [],
    }))
    .filter((c) => c.name && c.images.length > 0);
}

/** Shared template for the WhatsApp consultation message of a device. */
export const waDeviceMessage = (d: {
  name: string;
  seminovo?: boolean;
  storage?: string | null;
  color?: string | null;
  price?: number | null;
}) => {
  const lines: (string | null)[] = [
    "Olá! Tudo bem? Gostaria de saber mais sobre este aparelho da Major Cell:",
    "",
    `📱 ${d.name}${d.seminovo ? " (Seminovo)" : ""}`,
    d.storage ? `💾 Armazenamento: ${d.storage}` : null,
    d.color ? `🎨 Cor: ${d.color}` : null,
    d.price != null ? `💰 Preço: ${formatPrice(d.price)}` : null,
    "",
    "Tenho interesse em comprar e gostaria de conhecer as condições de pagamento e a disponibilidade.",
    "",
    "Pode me ajudar a encontrar a melhor opção para fechar negócio?",
    "",
    "Aguardo seu retorno!",
  ];
  return lines.filter((l): l is string => l !== null).join("\n");
};

export const productMessage = (
  p: Pick<Product, "name" | "model" | "storage" | "color" | "price" | "description" | "ram"> &
    Partial<Pick<Product, "category" | "offer_active" | "offer_price" | "offer_ends_at">>,
  chosenColor?: string | null,
) => {
  const offerLive =
    p.offer_active === true &&
    p.offer_price != null &&
    (!p.offer_ends_at || new Date(p.offer_ends_at).getTime() > Date.now());
  return waDeviceMessage({
    name: p.name,
    seminovo: p.category === "iphone_seminovo",
    storage: p.storage,
    color: chosenColor ?? p.color,
    price: offerLive && p.offer_price != null ? p.offer_price : p.price,
  });
};

/** Generation (iPhone) or family (Redmi/Xiaomi) used to group the catalog. */
export function groupKey(p: Pick<Product, "name">): string {
  const n = p.name.trim();
  const ip = n.match(/^iPhone\s+(\d+)/i);
  if (ip) return `iPhone ${ip[1]}`;
  const rd = n.match(/^(Redmi\s+(?:Note\s+\d+|[A-Z]?\d+[A-Z]?)(?:\s+Pro)?)/i);
  if (rd) return rd[1]!;
  return n;
}
