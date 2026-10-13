import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Smartphone } from "lucide-react";
import { categoryLabel, conditionLabel, formatPrice, productMessage, productQuery } from "@/lib/products";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { catalogError } from "@/components/CategoryPage";

export const Route = createFileRoute("/produto/$id")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(productQuery(params.id));
    if (!p) throw notFound();
    return { name: p.name as string, model: p.model as string | null };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.name}${loaderData.model ? " " + loaderData.model : ""} | Major Cell` : "Aparelho | Major Cell";
    const d = "Detalhes, fotos e consulta pelo WhatsApp na Major Cell.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  errorComponent: catalogError,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-2xl font-semibold">Aparelho não encontrado</h1>
      <Link to="/catalogo" className="mt-6 inline-block text-primary">Voltar ao catálogo</Link>
    </div>
  ),
  component: ProductPage,
});

function Row({ k, v }: { k: string; v?: string | null }) {
  if (!v) return null;
  return (
    <div className="flex justify-between border-b border-border py-3 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

function ProductPage() {
  const { id } = Route.useParams();
  const { data: p } = useSuspenseQuery(productQuery(id));
  const [idx, setIdx] = useState(0);
  if (!p) return null;
  const price = formatPrice(p.price);
  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
      </Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl hairline bg-card">
            {p.imageUrls[idx] ? (
              <img src={p.imageUrls[idx]} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground"><Smartphone className="h-16 w-16" strokeWidth={1} /></div>
            )}
          </div>
          {p.imageUrls.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {p.imageUrls.map((u, i) => (
                <button key={u} onClick={() => setIdx(i)} className={`aspect-square overflow-hidden rounded-xl border ${i === idx ? "border-primary" : "border-border"}`} aria-label={`Foto ${i + 1}`}>
                  <img src={u} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">{categoryLabel(p.category)}</p>
          <h1 className="mt-3 text-4xl font-semibold">{p.name}</h1>
          {p.model && <p className="mt-1 text-lg text-muted-foreground">{p.model}</p>}
          <p className="mt-6 font-display text-3xl font-semibold text-gold">
            {price ?? <span className="text-lg text-muted-foreground">Consulte disponibilidade</span>}
          </p>
          {p.status === "vendido" && <p className="mt-2 text-sm font-semibold text-destructive">Este aparelho já foi vendido.</p>}
          <div className="mt-8">
            <Row k="Condição" v={conditionLabel(p.category)} />
            <Row k="Armazenamento" v={p.storage} />
            <Row k="Cor" v={p.color} />
            {p.category === "iphone_seminovo" && <Row k="Saúde da bateria" v={p.battery_health != null ? `${p.battery_health}%` : null} />}
          </div>
          {p.description && <p className="mt-8 whitespace-pre-line leading-relaxed text-muted-foreground">{p.description}</p>}
          <WhatsAppButton message={productMessage(p)} className="mt-10 w-full px-6 py-3.5 text-base sm:w-auto" />
        </div>
      </div>
    </div>
  );
}
