import { describe, expect, it } from "vitest";
import { comingSoonMessage, isComingSoon } from "@/lib/products";

describe("lançamentos em breve", () => {
  it("status em_breve é identificado como lançamento", () => {
    expect(isComingSoon({ status: "em_breve" })).toBe(true);
    expect(isComingSoon({ status: "disponivel" })).toBe(false);
  });
  it("mensagem inclui modelo e cor e não promete preço nem estoque", () => {
    const m = comingSoonMessage({ name: "iPhone 18 Pro" }, "Burgundy");
    expect(m).toContain("iPhone 18 Pro");
    expect(m).toContain("Burgundy");
    expect(m).not.toMatch(/R\$|disponível\?/);
  });
});
