import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { STORE_PLACE } from "@/config/store";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a loja | Major Cell" },
      { name: "description", content: `Conheça a Major Cell, loja de celulares em ${STORE_PLACE}: iPhones novos, seminovos selecionados e Xiaomi com atendimento de confiança.` },
      { property: "og:title", content: "Sobre a loja | Major Cell" },
      { property: "og:description", content: "Conheça a Major Cell e nosso compromisso com procedência e confiança." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Tecnologia com confiança" subtitle="A Major Cell reúne iPhones novos, seminovos cuidadosamente selecionados e smartphones Xiaomi, sempre com atendimento próximo e transparente." />
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-16 md:grid-cols-3">
        {[
          ["Seleção criteriosa", "Cada seminovo passa por avaliação de estado, funcionamento e saúde da bateria antes de entrar no catálogo."],
          ["Transparência", "Informamos com clareza a condição de cada aparelho. Sem surpresas."],
          ["Atendimento de verdade", "Fale com uma pessoa, tire suas dúvidas e escolha com segurança."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-2xl hairline bg-card p-7">
            <h2 className="text-xl font-semibold text-gold">{t}</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </>
  ),
});
