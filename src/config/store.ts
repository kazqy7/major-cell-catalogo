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

export function whatsappLink(message: string): string | null {
  const n = STORE.WHATSAPP_NUMBER.replace(/\D/g, "");
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}
