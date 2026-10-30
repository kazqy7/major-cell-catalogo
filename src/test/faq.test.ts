import { describe, expect, it } from "vitest";
import { STORE } from "@/config/store";
import { faqJsonLd, storeFaq } from "@/lib/faq";
import { hourLines } from "@/lib/hours";
import { storeJsonLd } from "@/lib/seo";

describe("perguntas frequentes da loja", () => {
  it("responde com os dados de store.ts", () => {
    const text = storeFaq()
      .map((i) => i.a)
      .join(" ");
    expect(text).toContain(STORE.address);
    expect(text).toContain(hourLines()[0]!.time);
    expect(text).toContain("1 ano de garantia Apple");
    expect(text).toContain("Pix com desconto");
  });

  it("gera uma pergunta no schema para cada item visível", () => {
    const items = storeFaq();
    const ld = faqJsonLd(items);
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(items.length);
    expect(ld.mainEntity[0]?.acceptedAnswer.text).toBe(items[0]?.a);
  });

  it("marca a cidade atendida na ficha da loja", () => {
    expect(storeJsonLd().areaServed.name).toBe("Montes Claros");
    expect(storeJsonLd().description).toContain("Montes Claros, MG");
  });
});
