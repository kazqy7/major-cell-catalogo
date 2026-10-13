import { Suspense } from "react";
import { PageHeader } from "./PageHeader";
import { Catalog, CatalogSkeleton } from "./Catalog";
import type { Category } from "@/lib/products";

export function CategoryPage({ eyebrow, title, subtitle, category }: { eyebrow: string; title: string; subtitle: string; category?: Category }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div className="mx-auto max-w-7xl px-5 py-12">
        <Suspense fallback={<CatalogSkeleton />}>
          <Catalog fixedCategory={category} />
        </Suspense>
      </div>
    </>
  );
}

export const catalogError = ({ error }: { error: Error }) => (
  <div className="mx-auto max-w-xl px-5 py-24 text-center">
    <h2 className="text-2xl font-semibold">Não foi possível carregar os aparelhos</h2>
    <p className="mt-2 text-muted-foreground">Verifique sua conexão e tente novamente em instantes.</p>
    <p className="mt-4 text-xs text-muted-foreground/60">{error.message}</p>
  </div>
);
