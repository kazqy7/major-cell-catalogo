/**
 * Configurações da loja — altere aqui.
 * WHATSAPP_NUMBER: somente dígitos, com código do país e DDD (ex.: "5511999999999").
 * Enquanto estiver vazio, os botões de WhatsApp mostram um aviso em vez de abrir a conversa.
 */
export const STORE = {
  name: "Major Cell",
  WHATSAPP_NUMBER: "5538988063088",
  instagram: "",
  address: "",
  hours: "",
};

/**
 * Parcelamento — taxa de REFERÊNCIA estimada (2,03% a.m.), apenas para simulações aproximadas.
 * NÃO representa a taxa real da maquininha/operadora. Máximo de 21 parcelas (Tabela Price).
 */
export const INSTALLMENTS = {
  maxInstallments: 21,
  monthlyRatePercent: 2.03 as number | null,
};

/**
 * Avaliações verificadas de clientes reais. Adicione apenas depoimentos autorizados.
 * Exemplo de formato: { name: "Nome", text: "Depoimento", rating: 5, date: "2026-10-01" }
 */
export const REVIEWS: { name: string; text: string; rating: number; date?: string }[] = [];

export function whatsappLink(message: string): string | null {
  const n = STORE.WHATSAPP_NUMBER.replace(/\D/g, "");
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}
