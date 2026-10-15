import { Star } from "lucide-react";
import { REVIEWS } from "@/config/store";
import { WhatsAppButton } from "./WhatsAppButton";

/** Only verified reviews from the store config are shown; visitors can't post directly. */
export function Reviews() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20" aria-labelledby="avaliacoes">
      <h2 id="avaliacoes" className="text-3xl font-semibold md:text-4xl">Avaliações de clientes</h2>
      {REVIEWS.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-card p-8 text-center">
          <p className="text-muted-foreground">Ainda não publicamos avaliações. Já comprou na Major Cell? Conte como foi sua experiência — publicamos somente depoimentos de clientes reais, com autorização.</p>
          <WhatsAppButton variant="outline" className="mt-5" message="Olá, Major Cell! Quero compartilhar minha experiência como cliente.">
            Compartilhar minha experiência
          </WhatsAppButton>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <figure key={i} className="rounded-3xl bg-card p-6">
              <div className="flex gap-0.5 text-primary" aria-label={`${r.rating} de 5`}>
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4" fill={k < r.rating ? "currentColor" : "none"} />)}
              </div>
              <blockquote className="mt-3 text-sm">{r.text}</blockquote>
              <figcaption className="mt-3 text-xs text-muted-foreground">{r.name}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
