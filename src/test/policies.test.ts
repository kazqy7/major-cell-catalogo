import { describe, expect, it } from "vitest";
import { paymentLine, warrantyFor } from "@/lib/policies";
import { productJsonLd } from "@/lib/seo";

describe("garantia e pagamento", () => {
  it("monta a frase de pagamento com parcelas e desconto no Pix", () => {
    expect(paymentLine(["Cartão", "Pix", "Dinheiro"], 21)).toBe("Cartão em até 21x, Pix com desconto ou dinheiro");
    expect(paymentLine(["Pix"], 21)).toBe("Pix com desconto");
    expect(paymentLine([], 21)).toBe("");
  });

  it("dá a garantia certa por categoria", () => {
    expect(warrantyFor("iphone_novo")).toBe("1 ano de garantia Apple");
    expect(warrantyFor("iphone_seminovo")).toBe("90 dias de garantia");
    expect(warrantyFor("xiaomi")).toBe("6 meses de garantia");
  });

  it("informa a garantia em meses para o Google", () => {
    const base = { id: "x", name: "Redmi", storage: null, price: 1000, status: "disponivel" as const, imageUrls: [] };
    expect(productJsonLd({ ...base, category: "xiaomi" }).offers?.warranty?.durationOfWarranty.value).toBe(6);
    expect(productJsonLd({ ...base, category: "iphone_novo" }).offers?.warranty?.durationOfWarranty.value).toBe(12);
  });
});
