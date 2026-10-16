import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, catalogError } from "@/components/CategoryPage";
import { comingSoonQuery, productsQuery } from "@/lib/products";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Todos os aparelhos | Major Cell" },
      { name: "description", content: "iPhones novos, seminovos e Xiaomi disponíveis na Major Cell." },
      { property: "og:title", content: "Todos os aparelhos | Major Cell" },
      { property: "og:description", content: "iPhones novos, seminovos e Xiaomi disponíveis na Major Cell." },
    ],
  }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(productsQuery()), context.queryClient.ensureQueryData(comingSoonQuery())]),
  errorComponent: catalogError,
  component: () => <CategoryPage eyebrow="Catálogo" title="Todos os aparelhos" subtitle="iPhones novos, seminovos e Xiaomi disponíveis na Major Cell."  />,
});
