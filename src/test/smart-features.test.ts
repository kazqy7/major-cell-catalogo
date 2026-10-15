import { describe, expect, it, vi, beforeEach } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { applyFilters, emptyFilters } from "@/lib/catalog-filters";
import { installmentOptions, simulate } from "@/lib/installments";
import { REVIEWS, INSTALLMENTS } from "@/config/store";

const base = { model: null, color: null, brand: null } as const;
const list = [
  { ...base, name: "iPhone 13", category: "iphone_novo" as const, storage: "128 GB", price: 3399 },
  { ...base, name: "iPhone 13", category: "iphone_seminovo" as const, storage: "128 GB", price: 2500 },
  { ...base, name: "Redmi A5", category: "xiaomi" as const, storage: "64 GB", price: 1070 },
];

describe("filtros", () => {
  it("combina marca, condição, armazenamento e preço", () => {
    const r = applyFilters(list, { ...emptyFilters(), brand: "Apple", condition: "seminovo", storage: "128 GB", max: "3000" });
    expect(r).toHaveLength(1);
    expect(r[0]!.price).toBe(2500);
  });
  it("limpar filtros mostra tudo", () => {
    expect(applyFilters(list, emptyFilters())).toHaveLength(3);
  });
  it("nenhum resultado", () => {
    expect(applyFilters(list, { ...emptyFilters(), brand: "Xiaomi", min: "5000" })).toHaveLength(0);
  });
});

describe("parcelas", () => {
  it("sem condições configuradas não simula nada", () => {
    expect(INSTALLMENTS.maxInstallments).toBe(0);
    expect(installmentOptions()).toEqual([]);
    expect(simulate(4799.99, 10)).toBeNull();
  });
  it("sem juros confirmado divide o preço", () => {
    expect(simulate(1000, 10, { maxInstallments: 10, monthlyRatePercent: 0 })).toEqual({ installment: 100, total: 1000 });
  });
  it("com juros aplica a taxa configurada", () => {
    const r = simulate(1000, 2, { maxInstallments: 12, monthlyRatePercent: 10 })!;
    expect(r.installment).toBe(576.19);
    expect(r.total).toBe(1152.38);
  });
  it("não permite parcelas acima do máximo", () => {
    expect(simulate(1000, 13, { maxInstallments: 12, monthlyRatePercent: 0 })).toBeNull();
  });
});

describe("avaliações", () => {
  it("nenhuma avaliação fictícia", () => expect(REVIEWS).toHaveLength(0));
});

describe("favoritos", () => {
  beforeEach(() => { localStorage.clear(); vi.resetModules(); });
  it("persistem após recarregar", async () => {
    const a = await import("@/lib/favorites");
    a.toggleFavorite("p1");
    vi.resetModules();
    const b = await import("@/lib/favorites");
    expect(b.readFavorites()).toEqual(["p1"]);
    b.toggleFavorite("p1");
    expect(JSON.parse(localStorage.getItem("majorcell:favorites")!)).toEqual([]);
  });
});
