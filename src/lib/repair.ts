import { whatsappLink } from "@/config/store";

export type RepairForm = { name: string; brand: string; model: string; service: string; details: string };
export const REQUIRED: (keyof RepairForm)[] = ["name", "brand", "model", "service"];

export function validateRepair(f: RepairForm): (keyof RepairForm)[] {
  return REQUIRED.filter((k) => !f[k].trim());
}

export function repairMessage(f: RepairForm): string {
  return [
    "Olá! Gostaria de solicitar um orçamento para assistência técnica na Major Cell.",
    "",
    `Nome: ${f.name.trim()}`,
    `Marca e modelo: ${f.brand.trim()} ${f.model.trim()}`,
    `Serviço ou defeito: ${f.service.trim()}`,
    `Descrição do problema: ${f.details.trim() || "Não informada"}`,
    "",
    "Gostaria de saber as possibilidades de reparo para o meu aparelho.",
  ].join("\n");
}

export const repairLink = (f: RepairForm) => whatsappLink(repairMessage(f));
