import { describe, it, expect } from "vitest";
import {
  validateRepair,
  repairLink,
  repairMessage,
  pickService,
  REPAIR_SERVICES,
  type RepairForm,
} from "@/lib/repair";

const ok = { name: "Ana", brand: "Apple", model: "iPhone 12", service: "Troca de bateria", details: "" };
const empty = { name: "", brand: "", model: "", service: "", details: "" };

const REQUESTED = [
  "Troca de tela e display",
  "Troca de bateria",
  "Reparo em placa",
  "Reparo no conector de carga",
  "Reparo de câmera",
  "Diagnóstico de defeitos",
  "Reparo de botões e flex",
  "Reparo de áudio",
];

describe("assistência técnica", () => {
  it("exige nome, marca, modelo e serviço", () => {
    expect(validateRepair({ name: "", brand: " ", model: "", service: "", details: "x" })).toEqual([
      "name",
      "brand",
      "model",
      "service",
    ]);
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

  it("lista os 8 serviços pedidos, cada um com descrição curta", () => {
    const names = REPAIR_SERVICES.map((s) => s.name);
    REQUESTED.forEach((r) => expect(names).toContain(r));
    REPAIR_SERVICES.forEach((s) => {
      expect(s.problems.trim().length).toBeGreaterThan(20);
      expect(s.problems.trim().length).toBeLessThan(140);
    });
  });

  it("nenhum card promete preço, prazo ou garantia", () => {
    REPAIR_SERVICES.forEach((s) => {
      const text = `${s.name} ${s.problems}`.toLowerCase();
      expect(text).not.toMatch(/r\$|reais|\bdias?\b|\bprazo\b|garantia|\bhoras?\b|\bsemanas?\b/);
    });
  });

  it("escolher um serviço pelo card preenche o formulário e mantém os demais obrigatórios", () => {
    const picked = pickService(empty, "Reparo de câmera");
    expect(picked.service).toBe("Reparo de câmera");
    expect(validateRepair(picked)).toEqual(["name", "brand", "model"]);
    expect(pickService(ok, "Reparo de áudio").model).toBe("iPhone 12");
  });
});
