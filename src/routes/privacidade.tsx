import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { POLICIES, STORE, STORE_PLACE } from "@/config/store";

const UPDATED_AT = "1º de novembro de 2026";

const company = [POLICIES.company.legalName, POLICIES.company.cnpj && `CNPJ ${POLICIES.company.cnpj}`].filter(Boolean).join(", ");

// Ao mudar o que o site coleta, atualize este texto e UPDATED_AT.
const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: "Quem cuida dos seus dados",
    items: [
      `${STORE.name}${company ? ` (${company})` : ""}, ${STORE.address}. É a responsável pelos dados tratados neste site.`,
      `O contato para qualquer assunto de privacidade é o WhatsApp da loja, informado no fim desta página.`,
    ],
  },
  {
    title: "Quais dados usamos e por quê",
    items: [
      "Avaliações da loja: nota, comentário e nome de exibição, que é opcional. Ficam públicos no site para ajudar outros clientes.",
      "Proteção das avaliações: ao enviar uma avaliação, guardamos um código gerado a partir do seu endereço IP, usado para limitar envios repetidos e evitar abuso.",
      "Formulários de assistência e de troca: montam uma mensagem que você envia pelo WhatsApp. O site não guarda esses dados; recebemos apenas o que você enviar na conversa, para fazer o orçamento e o atendimento.",
      "Área administrativa: e-mail e senha da equipe da loja. Clientes não precisam de conta.",
    ],
  },
  {
    title: "Cookies e dados no seu aparelho",
    items: [
      "Usamos recursos técnicos necessários para o site funcionar e se proteger contra acessos automatizados.",
      "Seus favoritos ficam salvos apenas no seu aparelho. Eles guardam só quais produtos você marcou e não são enviados para a loja.",
      "O mapa da loja é fornecido pelo Google Maps. Ao carregar, o Google recebe dados técnicos, como o endereço IP, e pode usar cookies próprios.",
    ],
  },
  {
    title: "Com quem os dados são compartilhados",
    items: [
      "Empresas de tecnologia que mantêm o site funcionando: hospedagem, rede de entrega e banco de dados. Alguns desses servidores podem ficar fora do Brasil.",
      "Google, WhatsApp e Instagram, quando você usa o mapa ou abre esses serviços pelos nossos botões. Nesses casos valem também as políticas de privacidade de cada um.",
      "Autoridades públicas, quando a lei exigir.",
      "Não vendemos seus dados.",
    ],
  },
  {
    title: "Por quanto tempo guardamos",
    items: [
      "Avaliações ficam publicadas até serem removidas, inclusive a seu pedido.",
      "Dados de atendimento ficam guardados pelo tempo necessário para o serviço, a garantia e as obrigações legais.",
    ],
  },
  {
    title: "Seus direitos",
    items: [
      "Pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode pedir para confirmar se tratamos seus dados, acessar, corrigir, excluir ou solicitar a portabilidade deles, e saber com quem foram compartilhados.",
      "Você também pode retirar um consentimento dado e, se precisar, procurar a Autoridade Nacional de Proteção de Dados (ANPD).",
    ],
  },
];

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade | Major Cell" },
      { name: "description", content: `Como a Major Cell, loja de celulares em ${STORE_PLACE}, usa e protege os seus dados neste site.` },
      { property: "og:title", content: "Política de privacidade | Major Cell" },
      { property: "og:description", content: "Quais dados o site usa, por quê e quais são os seus direitos." },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <>
      <PageHeader title="Política de privacidade" subtitle="Quais dados o site usa, por quê e quais são os seus direitos." />
      <div className="mx-auto max-w-3xl space-y-10 px-5 py-12">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-2xl font-semibold">{s.title}</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-muted-foreground">
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
        <section>
          <h2 className="text-2xl font-semibold">Fale com a gente</h2>
          <p className="mb-5 mt-4 text-base leading-relaxed text-muted-foreground">
            Para exercer seus direitos ou tirar dúvidas sobre privacidade, chame a loja no WhatsApp.
          </p>
          <WhatsAppButton message="Olá, Major Cell! Tenho uma solicitação sobre privacidade e meus dados.">Falar pelo WhatsApp</WhatsAppButton>
        </section>
        <p className="text-sm text-muted-foreground">Atualizada em {UPDATED_AT}.</p>
      </div>
    </>
  );
}
