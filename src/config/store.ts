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
 * Comentários de clientes reais publicados no Google. Copie o texto sem alterar
 * e adicione apenas com autorização da pessoa.
 */
export const REVIEWS: { name: string; text: string; rating: number; date?: string }[] = [
  {
    name: "Fabricio Wagner",
    text: "Loja excelente! Atendimento atencioso, profissionais capacitados e sempre dispostos a ajudar. Grande variedade de acessórios e produtos para celulares, além de um serviço de manutenção rápido e de qualidade. Dá para perceber o cuidado e o compromisso com o cliente em cada detalhe. Parabéns pelo trabalho e sucesso sempre! Recomendo sem dúvidas 👏📱🔧",
    rating: 5,
  },
  {
    name: "Joao paulo Borges Medeiros",
    text: "Funcionários atenciosos, boa recepção e profissionalismo da equipe.\nProdutos de qualidade e o melhor preço!",
    rating: 5,
  },
  { name: "Igor Matheus", text: "Atendimento muito bom, e os melhores preços da região", rating: 5 },
  { name: "Cristhian Eduardo Leite", text: "Ótimo atendimento, além de produtos de qualidade e com preço acessível!", rating: 5 },
  { name: "Marcelo Ramos da Paixão", text: "Melhor atendimento da cidade,variáveis produtos.", rating: 5 },
  { name: "Ramon Lima", text: "Top comprei telefone iPhone com eles ótimo preço e entrega rápida ! Recomendo", rating: 5 },
  { name: "Andrey Nobre", text: "Comprei meu iPhone com eles, atendimento excelente, super recomendo.", rating: 5 },
  {
    name: "Hernane Lucas Leite Fernandes",
    text: "Melhor assistência de moc\nexcelente atendimento\nAparelhos novos com ótimos preços e condições de pagamento",
    rating: 5,
  },
  { name: "Maria Eduarda Costa Carvalho", text: "Loja confiável, atendimento top e qualidade garantida. Recomendo!", rating: 5 },
];

/**
 * Nota da loja no Google Maps. Atualize rating e count à mão quando mudarem.
 * url vazia esconde o botão.
 */
export const GOOGLE_REVIEWS = {
  rating: 4.9,
  count: 40,
  url: "https://maps.app.goo.gl/a5cDpqGReYNN73W76",
};

export function whatsappLink(message: string): string | null {
  const n = STORE.WHATSAPP_NUMBER.replace(/\D/g, "");
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}
