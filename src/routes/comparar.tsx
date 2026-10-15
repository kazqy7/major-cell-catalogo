import { createFileRoute } from "@tanstack/react-router";
import { productsQuery } from "@/lib/products";
import { catalogError } from "@/components/CategoryPage";
import { CompareTable } from "@/components/CompareTable";

const TITLE = "Comparar iPhones | Major Cell";
const DESC = "Compare iPhones lado a lado e receba uma recomendação conforme seu orçamento e prioridade.";

export const Route = createFileRoute("/comparar")({
  validateSearch: (s: Record<string, unknown>): { ids?: string } =>
    typeof s["ids"] === "string" && s["ids"] ? { ids: s["ids"] } : {},
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery()),
  errorComponent: catalogError,
  component: CompareTable,
});
