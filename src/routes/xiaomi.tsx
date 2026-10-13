import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, catalogError } from "@/components/CategoryPage";
import { productsQuery } from "@/lib/products";

export const Route = createFileRoute("/xiaomi")({
  head: () => ({
    meta: [
      { title: "Xiaomi | Major Cell" },
      { name: "description", content: "Smartphones Xiaomi com ótimo custo-benefício na Major Cell." },
      { property: "og:title", content: "Xiaomi | Major Cell" },
      { property: "og:description", content: "Smartphones Xiaomi com ótimo custo-benefício na Major Cell." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery()),
  errorComponent: catalogError,
  component: () => <CategoryPage eyebrow="Catálogo" title="Xiaomi" subtitle="Smartphones Xiaomi com ótimo custo-benefício na Major Cell." category="xiaomi" />,
});
