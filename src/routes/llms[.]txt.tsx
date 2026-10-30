import { createFileRoute } from "@tanstack/react-router";
import { STORE, STORE_PLACE } from "@/config/store";
import { storeFaq } from "@/lib/faq";
import { phoneDisplay, absUrl } from "@/lib/seo";

// Resumo da loja em texto simples para assistentes de IA. Sai de src/config/store.ts.

const PAGES = [
  ["Catálogo", "/catalogo"],
  ["iPhones novos", "/iphones-novos"],
  ["iPhones seminovos", "/iphones-seminovos"],
  ["Xiaomi", "/xiaomi"],
  ["Assistência técnica", "/assistencia"],
  ["Troca de iPhone", "/troca"],
  ["Contato", "/contato"],
] as const;

function llmsText() {
  return [
    `# ${STORE.name}`,
    "",
    `> Loja de celulares em ${STORE_PLACE}: iPhones novos e seminovos, Xiaomi e assistência técnica.`,
    "",
    `- Endereço: ${STORE.address}`,
    `- WhatsApp: ${phoneDisplay()}`,
    `- Instagram: https://www.instagram.com/${STORE.instagram}`,
    "",
    "## Páginas",
    ...PAGES.map(([label, path]) => `- [${label}](${absUrl(path)})`),
    "",
    "## Perguntas frequentes",
    ...storeFaq().flatMap(({ q, a }) => [`### ${q}`, a, ""]),
  ].join("\n");
}

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(llmsText(), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
