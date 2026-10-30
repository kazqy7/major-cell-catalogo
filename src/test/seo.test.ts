import { describe, expect, it } from "vitest";
import { absUrl, phoneDisplay, productJsonLd, storeJsonLd } from "@/lib/seo";

const base = { id: "abc", name: "iPhone 14", storage: "128 GB", price: 2199.99, imageUrls: ["/api/public/product-image/x.jpg"] };

describe("dados para o Google", () => {
  it("formata o telefone da loja", () => {
    expect(phoneDisplay("5538988063088")).toBe("+55 38 98806-3088");
  });

  it("monta endereços completos", () => {
    expect(absUrl("/produto/1")).toMatch(/^https:\/\/.+\/produto\/1$/);
    expect(absUrl("https://x.com/a")).toBe("https://x.com/a");
  });

  it("descreve a loja com endereço e horário", () => {
    const s = storeJsonLd();
    expect(s["@type"]).toBe("MobilePhoneStore");
    expect(s.address?.addressLocality).toBe("Montes Claros");
    expect(s.openingHoursSpecification?.[0]).toMatchObject({ dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:30" });
  });

  it("marca seminovo como usado e lançamento como pré-venda", () => {
    const semi = productJsonLd({ ...base, category: "iphone_seminovo", status: "disponivel" });
    expect(semi.offers?.itemCondition).toBe("https://schema.org/UsedCondition");
    expect(semi.offers?.availability).toBe("https://schema.org/InStock");
    expect(semi.offers?.price).toBe("2199.99");
    const launch = productJsonLd({ ...base, category: "iphone_novo", status: "em_breve" });
    expect(launch.offers?.itemCondition).toBe("https://schema.org/NewCondition");
    expect(launch.offers?.availability).toBe("https://schema.org/PreOrder");
    expect(productJsonLd({ ...base, price: null, category: "xiaomi", status: "disponivel" }).offers).toBeUndefined();
  });
});
