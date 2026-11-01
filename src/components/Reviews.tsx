import { lazy, Suspense, useState } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { GOOGLE_REVIEWS, REVIEWS } from "@/config/store";
import { listReviews } from "@/lib/reviews.functions";
import { shownName, summarize } from "@/lib/reviews";

// A janela de avaliar só é baixada quando alguém clica em "Avaliar a loja".
const ReviewDialog = lazy(() => import("./ReviewDialog"));

export const reviewsQuery = () => queryOptions({ queryKey: ["store-reviews"], queryFn: () => listReviews() });

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <div role="img" className="flex gap-0.5 text-primary" aria-label={`${value} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, k) => <Star key={k} className={size} fill={k < Math.round(value) ? "currentColor" : "none"} />)}
    </div>
  );
}

/** Nota real da loja no Google, com link para as avaliações no Maps. */
function GoogleRating() {
  const { rating, count, url } = GOOGLE_REVIEWS;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl hairline px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
    >
      <span className="text-2xl font-semibold text-foreground">{rating.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</span>
      <Stars value={rating} />
      <span>{count} avaliações no Google</span>
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

export function Reviews() {
  const { data = [], isLoading } = useQuery(reviewsQuery());
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const { count, average } = summarize(data);
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20" aria-labelledby="avaliacoes">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="avaliacoes" className="text-3xl font-semibold md:text-4xl">Avaliações de clientes</h2>
          {GOOGLE_REVIEWS.url && <GoogleRating />}
          {!GOOGLE_REVIEWS.url && count > 0 && (
            <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="text-2xl font-semibold text-foreground">{average.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</span>
              <Stars value={average} />
              <span>{count} {count === 1 ? "avaliação" : "avaliações"}</span>
            </div>
          )}
        </div>
        <button type="button" onClick={() => { setOpened(true); setOpen(true); }} className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Avaliar a loja
        </button>
      </div>
      {REVIEWS.length > 0 && (
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="rounded-3xl bg-card p-6">
              <Stars value={r.rating} />
              <blockquote className="mt-3 whitespace-pre-line break-words text-sm">{r.text}</blockquote>
              <figcaption className="mt-3 text-xs text-muted-foreground">{r.name} · Avaliação do Google</figcaption>
            </figure>
          ))}
        </div>
      )}
      {isLoading || (count === 0 && (GOOGLE_REVIEWS.url || REVIEWS.length > 0)) ? null : count === 0 ? (
        <div className="mt-6 rounded-3xl bg-card p-8 text-center">
          <p className="text-muted-foreground">Seja o primeiro a avaliar a Major Cell.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {data.slice(0, 12).map((r) => (
            <figure key={r.id} className="rounded-3xl bg-card p-6">
              <Stars value={r.rating} />
              {r.comment && <blockquote className="mt-3 whitespace-pre-line break-words text-sm">{r.comment}</blockquote>}
              <figcaption className="mt-3 text-xs text-muted-foreground">
                {shownName(r.display_name)} · {new Date(r.created_at).toLocaleDateString("pt-BR")}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {opened && (
        <Suspense fallback={null}>
          <ReviewDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </section>
  );
}
