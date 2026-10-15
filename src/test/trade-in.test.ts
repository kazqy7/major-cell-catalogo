import { describe, expect, it } from "vitest";
import { tradeInMessage, validateTradeIn, type TradeIn } from "@/lib/trade-in";

const ok: TradeIn = { name: "Ana", model: "iPhone 12", storage: "128 GB", condition: "Bom", battery: "85", works: "Tudo funciona", notes: "", wanted: "iPhone 16 128 GB", wantedLink: "https://x/produto/1", contact: "" };

describe("trade-in", () => {
  it("requires name, model, storage, condition and works", () => {
    expect(Object.keys(validateTradeIn({ ...ok, name: "", model: "", storage: "", condition: "", works: "" })).sort())
      .toEqual(["condition", "model", "name", "storage", "works"]);
    expect(validateTradeIn(ok)).toEqual({});
  });
  it("rejects battery above 100", () => {
    expect(validateTradeIn({ ...ok, battery: "120" }).battery).toBeDefined();
  });
  it("message has the filled data and product link", () => {
    const m = tradeInMessage(ok);
    expect(m).toContain("Modelo atual: iPhone 12");
    expect(m).toContain("Saúde da bateria: 85%");
    expect(m).toContain("iPhone 16 128 GB (https://x/produto/1)");
  });
});
