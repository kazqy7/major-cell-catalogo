import { whatsappLink } from "@/config/store";

export type RepairForm = { name: string; brand: string; model: string; service: string; details: string };
export const REQUIRED: (keyof RepairForm)[] = ["name", "brand", "model", "service"];

/** Serviços que a loja avalia. Só descrevem sintomas — nunca preço, prazo ou garantia. */
export type RepairServiceKey =
  | "tela"
  | "bateria"
  | "placa"
  | "conector"
  | "camera"
  | "diagnostico"
  | "botoes"
  | "audio"
  | "outros";

export type RepairService = { key: RepairServiceKey; name: string; problems: string };

export const REPAIR_SERVICES: RepairService[] = [
  {
    key: "tela",
    name: "Troca de tela e display",
    problems: "Tela trincada, manchas na imagem, toque que não responde ou display que falha.",
  },
  {
    key: "bateria",
    name: "Troca de bateria",
    problems: "Bateria que dura pouco, descarrega rápido, esquenta ou faz o aparelho desligar sozinho.",
  },
  {
    key: "placa",
    name: "Reparo em placa",
    problems: "Aparelho que não liga, não carrega, perde sinal ou reinicia sem motivo aparente.",
  },
  {
    key: "conector",
    name: "Reparo no conector de carga",
    problems: "Não carrega, cabo frouxo ou encaixado, carregamento que vai e volta ou entrada danificada.",
  },
  {
    key: "camera",
    name: "Reparo de câmera",
    problems: "Foto embaçada, foco que não trava, aplicativo da câmera fechando ou lente trincada.",
  },
  {
    key: "diagnostico",
    name: "Diagnóstico de defeitos",
    problems: "Defeito ainda não identificado, aparelho que liga sem dar imagem ou desliga do nada.",
  },
  {
    key: "botoes",
    name: "Reparo de botões e flex",
    problems: "Botões sem resposta, volume ou liga/desliga duro, e cabos internos que precisam de avaliação.",
  },
  {
    key: "audio",
    name: "Reparo de áudio",
    problems: "Sem som no alto-falante, chiado, microfone que não capta ou voz ruim em chamadas.",
  },
  {
    key: "outros",
    name: "Outros reparos em celulares",
    problems: "Qualquer outro defeito: descreva o que acontece com o aparelho e envie para avaliação.",
  },
];

export function validateRepair(f: RepairForm): (keyof RepairForm)[] {
  return REQUIRED.filter((k) => !f[k].trim());
}

/** Escolhe um serviço a partir do card, mantendo o que o cliente já escreveu. */
export function pickService(f: RepairForm, service: string): RepairForm {
  return { ...f, service };
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
