/**
 * Configurações da loja — altere aqui.
 * WHATSAPP_NUMBER: somente dígitos, com código do país e DDD (ex.: "5511999999999").
 * Enquanto estiver vazio, os botões de WhatsApp mostram um aviso em vez de abrir a conversa.
 */
/**
 * Endereço da loja em partes: é assim que o Google lê (ficha da loja).
 * Deixe street vazio para esconder o mapa e a seção "Visite a loja".
 */
export const ADDRESS = {
  street: "Av. Castelar Prates, 289",
  neighborhood: "Major Prates",
  city: "Montes Claros",
  state: "MG",
};

export const STORE = {
  name: "Major Cell",
  WHATSAPP_NUMBER: "5538988063088",
  /** Endereço do site no ar, sem barra no fim. Troque aqui se a loja passar a usar um domínio próprio. */
  siteUrl: "https://major-cell-catalogo.lovable.app",
  /** Só o nome de usuário, sem @. Ex.: "majorcell". Vazio esconde o botão do Instagram. */
  instagram: "_major_cell_",
  /** Endereço completo numa linha, montado a partir de ADDRESS. */
  address: ADDRESS.street ? `${ADDRESS.street} - ${ADDRESS.neighborhood}, ${ADDRESS.city} - ${ADDRESS.state}` : "",
};

/** Cidade da loja, usada nos títulos e descrições para buscas locais. */
export const STORE_PLACE = `${ADDRESS.city}, ${ADDRESS.state}`;

/**
 * Garantia, pagamento e dados da empresa. Campo vazio não aparece no site.
 * warranty: por categoria de produto. payments: na ordem em que aparecem.
 * company: razão social e CNPJ (a lei pede que lojas que vendem pela internet mostrem).
 */
export const POLICIES = {
  warranty: {
    iphone_novo: "1 ano de garantia Apple",
    iphone_seminovo: "90 dias de garantia",
    xiaomi: "6 meses de garantia",
  },
  /** Android seminovo: 3 meses (ainda não há categoria própria no catálogo). */
  androidSemiWarranty: "3 meses",
  /** Meses de garantia por categoria, para o Google. 0 = não informar. */
  warrantyMonths: { iphone_novo: 12, iphone_seminovo: 3, xiaomi: 6 },
  payments: ["Cartão", "Pix", "Dinheiro"],
  /** Texto junto do Pix. Ex.: "com desconto" ou "com 5% de desconto". Vazio não aparece. */
  pixNote: "com desconto",
  company: { legalName: "", cnpj: "" },
};

/**
 * Horário de funcionamento. days: 0 = domingo … 6 = sábado. Horas no formato "09:00".
 * Dias que não aparecem aqui contam como fechados. Vazio esconde o horário e o selo "Aberto agora".
 * Exemplo: { days: [1, 2, 3, 4, 5], open: "09:00", close: "18:00" }
 */
export const HOURS: { days: number[]; open: string; close: string }[] = [
  { days: [1, 2, 3, 4, 5], open: "08:30", close: "18:30" },
  { days: [6], open: "08:30", close: "12:30" },
];

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
