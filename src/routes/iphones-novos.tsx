import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, catalogError } from "@/components/CategoryPage";
import { comingSoonQuery, productsQuery } from "@/lib/products";

export const Route = createFileRoute("/iphones-novos")({
  head: () => ({
    meta: [
      { title: "iPhones novos | Major Cell" },
      { name: "description", content: "iPhones novos, lacrados e com procedência na Major Cell." },
      { property: "og:title", content: "iPhones novos | Major Cell" },
      { property: "og:description", content: "iPhones novos, lacrados e com procedência na Major Cell." },
    ],
  }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(productsQuery()), context.queryClient.ensureQueryData(comingSoonQuery())]),
  errorComponent: catalogError,
  component: () => <CategoryPage eyebrow="Catálogo" title="iPhones novos" subtitle="iPhones novos, lacrados e com procedência na Major Cell." category="iphone_novo" />,
});
