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

async function signAll(products: Product[]): Promise<ProductWithUrls[]> {
  const paths = Array.from(new Set(products.flatMap((p) => p.images)));
  const map = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60 * 24);
    data?.forEach((d) => d.path && d.signedUrl && map.set(d.path, d.signedUrl));
  }
  return products.map((p) => ({
    ...p,
    imageUrls: p.images.map((i) => map.get(i)).filter(Boolean) as string[],
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
      return signAll(data ?? []);
    },
  });

export const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return (await signAll([data]))[0];
    },
  });

export const productMessage = (p: Pick<Product, "name" | "model" | "storage" | "color" | "price" | "description">) => {
  const parts = [p.name, p.model, p.storage].filter(Boolean).join(" ");
  const ram = p.description?.match(/\d+\s*GB\s*RAM/i)?.[0];
  const detail = [parts, p.color, ram].filter(Boolean).join(" · ");
  const price = formatPrice(p.price);
  return `Olá! Tenho interesse no ${detail}${price ? `, anunciado por ${price}` : ""}. Ele está disponível?`;
};
