import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { CatalogSkeleton } from "@/components/Catalog";
import { catalogError } from "@/components/CategoryPage";
import { productsQuery } from "@/lib/products";
import { useFavorites } from "@/lib/favorites";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Meus favoritos | Major Cell" },
      { name: "description", content: "Os aparelhos que você salvou na Major Cell." },
      { property: "og:title", content: "Meus favoritos | Major Cell" },
      { property: "og:description", content: "Os aparelhos que você salvou na Major Cell." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: catalogError,
  component: () => (
    <>
      <PageHeader eyebrow="Favoritos" title="Meus favoritos" subtitle="Salvos neste navegador, sem cadastro." />
      <div className="mx-auto max-w-7xl px-5 py-12">
        <Suspense fallback={<CatalogSkeleton />}><List /></Suspense>
      </div>
    </>
  ),
});

function List() {
  const ids = useFavorites();
  const { data } = useSuspenseQuery(productsQuery({ includeSold: true }));
  // Removed products are simply skipped.
  const items = data.filter((p) => ids.includes(p.id));
  if (items.length === 0)
    return (
      <div className="flex flex-col items-center rounded-2xl hairline px-6 py-20 text-center">
        <Heart className="h-10 w-10 text-primary" strokeWidth={1.2} />
        <h2 className="mt-4 text-xl font-semibold">Nenhum favorito ainda</h2>
        <p className="mt-2 text-sm text-muted-foreground">Toque no coração de um aparelho para salvá-lo aqui.</p>
        <Link to="/catalogo" className="mt-6 rounded-full hairline px-5 py-2 text-sm hover:text-primary">Ver aparelhos</Link>
      </div>
    );
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}
