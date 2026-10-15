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
