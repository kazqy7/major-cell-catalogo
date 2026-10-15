import { describe, it, expect } from "vitest";
import { validateRepair, repairLink, repairMessage } from "@/lib/repair";

const ok = { name: "Ana", brand: "Apple", model: "iPhone 12", service: "Troca de bateria", details: "" };

describe("assistência técnica", () => {
  it("exige nome, marca, modelo e serviço", () => {
    expect(validateRepair({ name: "", brand: " ", model: "", service: "", details: "x" })).toEqual(["name", "brand", "model", "service"]);
    expect(validateRepair(ok)).toEqual([]);
  });
  it("mensagem traz os dados e usa o número oficial", () => {
    const msg = repairMessage({ ...ok, details: "Desliga sozinho" });
    expect(msg).toContain("Nome: Ana");
    expect(msg).toContain("Marca e modelo: Apple iPhone 12");
    expect(msg).toContain("Serviço ou defeito: Troca de bateria");
    expect(msg).toContain("Descrição do problema: Desliga sozinho");
    expect(repairLink(ok)).toMatch(/^https:\/\/wa\.me\/5538988063088\?text=/);
  });
});
