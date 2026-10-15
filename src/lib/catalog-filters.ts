import type { Product } from "@/lib/products";

export type Filters = {
  q: string; cat: string; brand: string; condition: "" | "novo" | "seminovo";
  model: string; storage: string; color: string; min: string; max: string;
};
export const emptyFilters = (cat = ""): Filters => ({
  q: "", cat, brand: "", condition: "", model: "", storage: "", color: "", min: "", max: "",
});

type P = Pick<Product, "name" | "model" | "brand" | "category" | "storage" | "color" | "price">;

export const brandOf = (p: P) =>
  p.brand?.trim() || (p.category === "xiaomi" ? "Xiaomi" : "Apple");
export const conditionOf = (p: P) => (p.category === "iphone_seminovo" ? "seminovo" : "novo");

export function applyFilters<T extends P>(list: T[], f: Filters): T[] {
  const s = f.q.trim().toLowerCase();
  return list.filter((p) => {
    if (f.cat && p.category !== f.cat) return false;
    if (s && ![p.name, p.model].join(" ").toLowerCase().includes(s)) return false;
    if (f.brand && brandOf(p) !== f.brand) return false;
    if (f.condition && conditionOf(p) !== f.condition) return false;
    if (f.model && p.model !== f.model) return false;
    if (f.storage && p.storage !== f.storage) return false;
    if (f.color && p.color !== f.color) return false;
    if (f.min && (p.price == null || p.price < Number(f.min))) return false;
    if (f.max && (p.price == null || p.price > Number(f.max))) return false;
    return true;
  });
}
