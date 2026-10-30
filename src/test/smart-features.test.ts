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
  it("usa as taxas reais da maquininha Mastercard até 21x", () => {
    expect(INSTALLMENTS.maxInstallments).toBe(21);
    expect(INSTALLMENTS.rates).toHaveLength(21);
    expect(INSTALLMENTS.rates[0]).toBe(3.09);
    expect(INSTALLMENTS.rates[20]).toBe(18.41);
    expect(installmentOptions()).toHaveLength(21);
    expect(simulate(1000, 22)).toBeNull();
  });
  it("repassa a taxa ao cliente: total = preço ÷ (1 − taxa)", () => {
    // 1x: 1000 / (1 − 0,0309) ≈ 1031,89
    const a = simulate(1000, 1)!;
    expect(a.total).toBe(1031.89);
    expect(a.installment).toBe(1031.89);
    // 12x: 1000 / (1 − 0,118) ≈ 1133,79; parcela ≈ 94,48
    const b = simulate(1000, 12)!;
    expect(b.total).toBe(1133.79);
    expect(b.installment).toBe(94.48);
  });
  it("aplica a taxa configurada para outras tabelas", () => {
    const r = simulate(1000, 2, { maxInstallments: 12, rates: [5, 10] })!;
    expect(r.total).toBe(1111.11);
    expect(r.installment).toBe(555.55);
  });
  it("não permite parcelas acima do máximo ou sem taxa", () => {
    expect(simulate(1000, 13, { maxInstallments: 12, rates: Array(12).fill(5) })).toBeNull();
    expect(simulate(1000, 2, { maxInstallments: 12, rates: [5, null, 5] })).toBeNull();
  });
});

describe("avaliações", () => {
  it("só comentários reais do Google, autorizados pelos clientes", () =>
    expect(REVIEWS.map((r) => r.name)).toEqual([
      "Fabricio Wagner",
      "Joao paulo Borges Medeiros",
      "Igor Matheus",
      "Cristhian Eduardo Leite",
      "Marcelo Ramos da Paixão",
      "Ramon Lima",
      "Andrey Nobre",
      "Hernane Lucas Leite Fernandes",
      "Maria Eduarda Costa Carvalho",
    ]));
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
