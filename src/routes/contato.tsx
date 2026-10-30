import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { StoreVisit } from "@/components/StoreVisit";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | Major Cell" },
      { name: "description", content: "Fale com a Major Cell pelo WhatsApp e consulte os aparelhos disponíveis." },
      { property: "og:title", content: "Contato | Major Cell" },
      { property: "og:description", content: "Fale com a Major Cell pelo WhatsApp." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Fale com a Major Cell" subtitle="Nosso atendimento é feito pelo WhatsApp. Envie sua dúvida ou o modelo que procura." />
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="max-w-xl rounded-2xl hairline bg-card p-8">
          <WhatsAppButton message="Olá, Major Cell! Gostaria de atendimento." className="px-6 py-3">Conversar no WhatsApp</WhatsAppButton>
        </div>
      </div>
      <StoreVisit />
    </>
  ),
});
