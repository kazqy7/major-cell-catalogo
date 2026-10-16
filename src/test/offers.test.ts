import { describe, it, expect } from "vitest";
import { isOfferLive, offerMessage } from "@/lib/offers";

const base = { offer_active: true, offer_price: 4999, offer_ends_at: null, status: "disponivel" as const };
const now = new Date("2026-10-16T12:00:00Z");

describe("ofertas", () => {
  it("ativa e sem término aparece", () => expect(isOfferLive(base, now)).toBe(true));
  it("desativada não aparece", () => expect(isOfferLive({ ...base, offer_active: false }, now)).toBe(false));
  it("expirada não aparece", () => expect(isOfferLive({ ...base, offer_ends_at: "2026-10-15T23:59:59Z" }, now)).toBe(false));
  it("término futuro aparece", () => expect(isOfferLive({ ...base, offer_ends_at: "2026-10-20T00:00:00Z" }, now)).toBe(true));
  it("sem preço promocional não aparece", () => expect(isOfferLive({ ...base, offer_price: null }, now)).toBe(false));
  it("vendido não aparece", () => expect(isOfferLive({ ...base, status: "vendido" }, now)).toBe(false));
  it("mensagem inclui aparelho e preço", () => {
    const m = offerMessage({ name: "iPhone 15", model: null, storage: "128 GB", ram: null, offer_price: 4999 });
    expect(m).toContain("iPhone 15 128 GB");
    expect(m).toContain("R$");
  });
});
