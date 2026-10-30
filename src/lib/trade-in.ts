export type TradeIn = {
  name: string;
  model: string;
  storage: string;
  condition: string;
  battery: string;
  works: string;
  notes: string;
  wanted: string;
  wantedLink: string;
  contact: string;
};

export const CONDITIONS = ["Excelente", "Bom", "Regular", "Com defeitos"];
export const WORKS = ["Tudo funciona", "Possui algum problema", "Não sei"];

/** O que cada estado de conservação quer dizer, para o cliente escolher sem dúvida. */
export const CONDITION_HINTS: Record<string, string> = {
  Excelente: "Sem riscos visíveis, parece novo.",
  Bom: "Riscos leves de uso, só vistos de perto.",
  Regular: "Riscos e marcas visíveis na tela ou na carcaça.",
  "Com defeitos": "Vidro trincado, peça danificada ou algo que não funciona.",
};

export const STORAGES = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "Não sei"];

/** Modelos de iPhone para escolher com um toque, agrupados por geração. */
export const TRADE_MODELS: { gen: string; models: string[] }[] = [
  { gen: "17", models: ["iPhone 17", "iPhone Air", "iPhone 17 Pro", "iPhone 17 Pro Max"] },
  { gen: "16", models: ["iPhone 16e", "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max"] },
  { gen: "15", models: ["iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max"] },
  { gen: "14", models: ["iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max"] },
  { gen: "13", models: ["iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max"] },
  { gen: "12", models: ["iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max"] },
  { gen: "11", models: ["iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max"] },
  { gen: "SE", models: ["iPhone SE (2ª geração)", "iPhone SE (3ª geração)"] },
];

/** Campos conferidos em cada etapa do passo a passo da troca. */
export const TRADE_STEPS: (keyof TradeIn)[][] = [
  ["model", "storage"],
  ["condition", "works", "battery", "notes"],
  [],
  ["name", "contact"],
];

/** Erros só dos campos de uma etapa, para não acusar o que o cliente ainda nem viu. */
export function stepErrors(t: TradeIn, step: number): Partial<Record<keyof TradeIn, string>> {
  const all = validateTradeIn(t);
  return Object.fromEntries((TRADE_STEPS[step] ?? []).filter((k) => all[k]).map((k) => [k, all[k]]));
}

const LIMITS: Record<keyof TradeIn, number> = { name: 80, model: 60, storage: 20, condition: 20, battery: 10, works: 30, notes: 500, wanted: 120, wantedLink: 300, contact: 100 };

/** Returns a map of field -> error message for required/invalid fields. */
export function validateTradeIn(t: TradeIn): Partial<Record<keyof TradeIn, string>> {
  const e: Partial<Record<keyof TradeIn, string>> = {};
  if (!t.name.trim()) e.name = "Informe seu nome.";
  if (!t.model.trim()) e.model = "Informe o modelo do seu iPhone.";
  if (!t.storage.trim()) e.storage = "Escolha o armazenamento.";
  if (!CONDITIONS.includes(t.condition)) e.condition = "Escolha o estado de conservação.";
  if (!WORKS.includes(t.works)) e.works = "Informe o funcionamento.";
  if (t.battery.trim()) {
    const n = Number(t.battery.replace("%", "").trim());
    if (!Number.isFinite(n) || n < 1 || n > 100) e.battery = "Use um número de 1 a 100.";
  }
  (Object.keys(LIMITS) as (keyof TradeIn)[]).forEach((k) => {
    if (!e[k] && t[k].length > LIMITS[k]) e[k] = `Use no máximo ${LIMITS[k]} caracteres.`;
  });
  return e;
}

export function tradeInMessage(t: TradeIn): string {
  const v = (s: string) => s.trim() || "Não informado";
  const bat = t.battery.trim() ? `${t.battery.replace("%", "").trim()}%` : "Não sei";
  const wanted = t.wanted.trim() ? `${t.wanted.trim()}${t.wantedLink ? ` (${t.wantedLink})` : ""}` : "Ainda não escolhi";
  const lines = [
    "Olá! Quero solicitar uma avaliação para trocar meu iPhone usado na Major Cell.",
    "",
    `Nome: ${v(t.name)}`,
    `Modelo atual: ${v(t.model)}`,
    `Armazenamento: ${v(t.storage)}`,
    `Estado de conservação: ${v(t.condition)}`,
    `Saúde da bateria: ${bat}`,
    `Funcionamento: ${v(t.works)}`,
    `Observações: ${v(t.notes)}`,
    `Modelo que desejo comprar: ${wanted}`,
  ];
  if (t.contact.trim()) lines.push(`Melhor contato: ${t.contact.trim()}`);
  lines.push("", "Gostaria de saber o valor de avaliação e as possibilidades de troca.");
  return lines.join("\n");
}
