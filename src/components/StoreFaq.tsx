import { ChevronDown } from "lucide-react";
import { storeFaq } from "@/lib/faq";

/** Perguntas frequentes. Usa <details> para o texto já vir no HTML, legível por buscadores. */
export function StoreFaq() {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-20">
      <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Perguntas frequentes</h2>
      <div className="mt-8 space-y-3">
        {storeFaq().map(({ q, a }) => (
          <details key={q} className="group rounded-2xl hairline px-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-medium [&::-webkit-details-marker]:hidden">
              {q}
              <ChevronDown
                className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="pb-5 text-base text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
