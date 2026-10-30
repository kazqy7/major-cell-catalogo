import { POLICIES, STORE, STORE_PLACE } from "@/config/store";
import { hourLines } from "@/lib/hours";
import { paymentLine } from "@/lib/policies";

/**
 * Perguntas frequentes da página inicial. As respostas saem de src/config/store.ts,
 * então endereço, horário, garantia e pagamento ficam iguais em todo o site.
 * Google e assistentes de IA leem este texto para responder sobre a loja.
 */
export function storeFaq() {
  const { warranty, androidSemiWarranty } = POLICIES;
  const hours = hourLines()
    .map((h) => `${h.days}: ${h.time}`)
    .join("; ");
  const payment = paymentLine();
  const items = [
    {
      q: `Onde comprar iPhone em ${STORE_PLACE}?`,
      a: `Na ${STORE.name}, loja de celulares em ${STORE_PLACE}. Trabalhamos com iPhones novos, seminovos selecionados e Xiaomi.`,
    },
    {
      q: `Onde fica a ${STORE.name}?`,
      a: STORE.address && `A ${STORE.name} fica na ${STORE.address}.`,
    },
    { q: "Qual é o horário de funcionamento?", a: hours && `${hours}.` },
    {
      q: `A ${STORE.name} conserta celular?`,
      a: "Sim. A assistência técnica atende iPhone e outras marcas, com reparo de tela, bateria, placa, conector, câmera, botões e áudio. A avaliação é solicitada pelo WhatsApp.",
    },
    {
      q: "Qual é a garantia dos aparelhos?",
      a: `iPhone novo: ${warranty.iphone_novo}. iPhone seminovo: ${warranty.iphone_seminovo}. Xiaomi lacrado: ${warranty.xiaomi}. Android seminovo: ${androidSemiWarranty} de garantia.`,
    },
    { q: "Quais são as formas de pagamento?", a: payment && `${payment}.` },
    {
      q: "Posso dar meu iPhone usado na troca?",
      a: "Sim. Você informa os dados do aparelho na página Troque seu iPhone e fala com a loja pelo WhatsApp.",
    },
  ];
  return items.filter((i) => i.a);
}

/** Ficha de perguntas e respostas para buscadores. */
export function faqJsonLd(items = storeFaq()) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}
