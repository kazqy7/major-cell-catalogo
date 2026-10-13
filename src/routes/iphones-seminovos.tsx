import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, catalogError } from "@/components/CategoryPage";
import { productsQuery } from "@/lib/products";

export const Route = createFileRoute("/iphones-seminovos")({
  head: () => ({
    meta: [
      { title: "iPhones seminovos | Major Cell" },
      { name: "description", content: "iPhones seminovos selecionados e revisados, com saúde de bateria informada." },
      { property: "og:title", content: "iPhones seminovos | Major Cell" },
      { property: "og:description", content: "iPhones seminovos selecionados e revisados, com saúde de bateria informada." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery()),
  errorComponent: catalogError,
  component: () => <CategoryPage eyebrow="Catálogo" title="iPhones seminovos" subtitle="iPhones seminovos selecionados e revisados, com saúde de bateria informada." category="iphone_seminovo" />,
});
