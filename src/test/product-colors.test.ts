import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { parseColors, productMessage } from "@/lib/products";

describe("cores dos produtos", () => {
  it("cor sem confirmação de estoque fica esgotada", () => {
    expect(parseColors([{ name: "Preto" }])[0]?.available).toBe(false);
  });
  it("mensagem do WhatsApp traz a cor escolhida e o preço", () => {
    const msg = productMessage(
      { name: "iPhone 16", model: null, storage: "128 GB", color: null, price: 4799.99, description: null, ram: null },
      "Preto",
    );
    expect(msg).toContain("iPhone 16 128 GB · cor Preto");
    expect(msg).toContain("R$\u00a04.799,99");
  });
});
