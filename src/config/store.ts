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
 * Parcelamento — taxas REAIS da maquininha Mastercard (repasse ao cliente).
 * Índice = número de parcelas (1 = crédito à vista). Valores em % sobre o total.
 * Método: total = preço ÷ (1 − taxa); parcela = total ÷ n. Fonte única das taxas.
 */
export const INSTALLMENTS = {
  maxInstallments: 21,
  rates: [
    3.09, 4.31, 5.04, 5.78, 6.51, 7.25, 8.13, 8.86, 9.6, 10.33, 11.07, 11.8,
    12.53, 13.27, 14.0, 14.74, 15.47, 16.21, 16.94, 17.68, 18.41,
  ] as (number | null)[],
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
