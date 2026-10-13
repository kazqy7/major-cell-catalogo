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

export const productMessage = (
  p: Pick<Product, "name" | "model" | "storage" | "color" | "price" | "description" | "ram">,
  chosenColor?: string | null,
) => {
  const parts = [p.name, p.model, p.storage].filter(Boolean).join(" ");
  const ram = p.ram ? `${p.ram} RAM` : p.description?.match(/\d+\s*GB\s*RAM/i)?.[0];
  const color = chosenColor ? `cor ${chosenColor}` : p.color;
  const detail = [parts, color, ram].filter(Boolean).join(" · ");
  const price = formatPrice(p.price);
  return `Olá! Tenho interesse no ${detail}${price ? `, anunciado por ${price}` : ""}. Ele está disponível?`;
};
