import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Smartphone, Tag } from "lucide-react";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { CatalogSkeleton } from "@/components/Catalog";
import { catalogError } from "@/components/CategoryPage";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { conditionLabel, formatPrice, productsQuery } from "@/lib/products";
import { isOfferLive, offerMessage } from "@/lib/offers";

export const Route = createFileRoute("/ofertas")({
  head: () => ({
    meta: [
      { title: "Ofertas | Major Cell" },
      { name: "description", content: "Promoções ativas de iPhones e Xiaomi na Major Cell." },
      { property: "og:title", content: "Ofertas | Major Cell" },
      { property: "og:description", content: "Promoções ativas de iPhones e Xiaomi na Major Cell." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery({ includeSold: true })),
  errorComponent: catalogError,
  component: () => (
    <>
      <PageHeader eyebrow="Ofertas" title="Ofertas Major Cell" subtitle="Condições especiais por tempo limitado." />
      <div className="mx-auto max-w-7xl px-5 py-12">
        <Suspense fallback={<CatalogSkeleton />}><List /></Suspense>
      </div>
    </>
  ),
});

function List() {
  const { data } = useSuspenseQuery(productsQuery({ includeSold: true }));
  const items = data.filter((p) => isOfferLive(p));
  if (items.length === 0)
    return (
      <div className="flex flex-col items-center rounded-3xl hairline bg-card px-6 py-20 text-center">
        <Tag className="h-10 w-10 text-primary" strokeWidth={1.2} />
        <h2 className="mt-4 text-xl font-semibold">Novas ofertas em breve</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">No momento não há promoções ativas. Volte em breve ou confira o catálogo completo.</p>
        <Link to="/catalogo" className="mt-6 rounded-full hairline px-5 py-2 text-sm hover:text-primary">Ver aparelhos</Link>
      </div>
    );
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => {
        const img = p.imageUrls[0];
        const old = p.price != null && p.price > (p.offer_price ?? 0) ? formatPrice(p.price) : null;
        return (
          <article key={p.id} className="flex flex-col rounded-3xl bg-card p-6 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">Oferta · {conditionLabel(p.category)}</p>
            <Link to="/produto/$id" params={{ id: p.id }} className="mt-2 block">
              <h3 className="text-2xl font-semibold leading-tight">{p.name}</h3>
              {p.storage && <p className="mt-1 text-sm text-muted-foreground">{p.storage}{p.ram ? ` · ${p.ram} RAM` : ""}</p>}
              <div className="mt-6 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-showcase p-4">
                {img ? <img src={img} alt={p.name} loading="lazy" className="h-full w-full object-contain" /> : <Smartphone className="h-14 w-14 text-muted-foreground" strokeWidth={1} />}
              </div>
            </Link>
            <div className="mt-5">
              {old && <p className="text-sm text-muted-foreground line-through">{old}</p>}
              <p className="text-2xl font-semibold text-primary">{formatPrice(p.offer_price)}</p>
              {p.offer_ends_at && <p className="mt-1 text-xs text-muted-foreground">Válida até {new Date(p.offer_ends_at).toLocaleDateString("pt-BR")}</p>}
            </div>
            <WhatsAppButton className="mt-5" message={offerMessage(p)}>Consultar oferta no WhatsApp</WhatsAppButton>
          </article>
        );
      })}
    </div>
  );
}
