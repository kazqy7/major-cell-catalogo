import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { parseColors, productMessage } from "@/lib/products";

describe("cores dos produtos", () => {
  it("cor sem confirmação de estoque fica esgotada", () => {
    expect(parseColors([{ name: "Preto" }])[0]?.available).toBe(false);
  });
  it("mensagem do WhatsApp segue o modelo oficial, com cor e preço", () => {
    const msg = productMessage(
      { name: "iPhone 16", model: null, storage: "128 GB", color: null, price: 4799.99, description: null, ram: null },
      "Preto",
    );
    expect(msg).toContain("📱 iPhone 16");
    expect(msg).toContain("💾 Armazenamento: 128 GB");
    expect(msg).toContain("🎨 Cor: Preto");
    expect(msg).toContain("💰 Preço: R$\u00a04.799,99");
    expect(msg).toContain("Aguardo seu retorno!");
  });
  it("seminovo é identificado e a oferta ativa define o preço da mensagem", () => {
    const msg = productMessage({
      name: "iPhone 11", model: null, storage: "64 GB", color: null, price: 1250, description: null, ram: null,
      category: "iphone_seminovo", offer_active: true, offer_price: 999, offer_ends_at: null,
    });
    expect(msg).toContain("📱 iPhone 11 (Seminovo)");
    expect(msg).toContain("💰 Preço: R$\u00a0999,00");
  });
  it("campos vazios não aparecem na mensagem", () => {
    const msg = productMessage({ name: "Redmi A5", model: null, storage: null, color: null, price: null, description: null, ram: null });
    expect(msg).not.toContain("💾");
    expect(msg).not.toContain("🎨");
    expect(msg).not.toContain("💰");
  });
});
