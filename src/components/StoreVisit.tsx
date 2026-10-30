import { useEffect, useState } from "react";
import { Instagram, MapPin, Navigation } from "lucide-react";
import { HOURS, STORE } from "@/config/store";
import { hourLines, isOpenNow } from "@/lib/hours";
import { cn } from "@/lib/utils";
import { WhatsAppButton } from "./WhatsAppButton";

const mapsSearch = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const mapsRoute = (q: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
const mapsEmbed = (q: string) => `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;

/** "Aberto agora" / "Fechado agora", calculado no navegador para não divergir do servidor. */
export function OpenBadge({ className }: { className?: string }) {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    const update = () => setOpen(isOpenNow());
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);
  if (open === null) return null;
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium", open ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground", className)}>
      <span className={cn("h-2 w-2 rounded-full", open ? "bg-primary" : "bg-muted-foreground")} aria-hidden="true" />
      {open ? "Aberto agora" : "Fechado agora"}
    </span>
  );
}

/**
 * Seção "Visite a loja": endereço, horário, mapa e atalhos.
 * Só aparece quando há endereço ou horário em src/config/store.ts.
 */
export function StoreVisit() {
  const lines = hourLines();
  if (!STORE.address && lines.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <div className="grid overflow-hidden rounded-3xl bg-card lg:grid-cols-2">
        <div className="flex flex-col p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Visite a loja</h2>
            {HOURS.length > 0 && <OpenBadge />}
          </div>
          {STORE.address && (
            <p className="mt-6 flex items-start gap-3 text-lg">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>{STORE.address}</span>
            </p>
          )}
          {lines.length > 0 && (
            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-base">
              {lines.map((l) => (
                <div key={l.days} className="contents">
                  <dt className="text-muted-foreground">{l.days}</dt>
                  <dd className="font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>{l.time}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-8 flex flex-wrap gap-3 lg:mt-auto lg:pt-8">
            {STORE.address && (
              <a href={mapsRoute(STORE.address)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground">
                <Navigation className="h-4 w-4" aria-hidden="true" /> Como chegar
              </a>
            )}
            <WhatsAppButton variant="outline" className="px-6 py-3" message="Olá, Major Cell! Gostaria de visitar a loja.">
              Avisar que vou passar
            </WhatsAppButton>
            {STORE.instagram && (
              <a
                href={`https://instagram.com/${STORE.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-foreground hover:text-primary focus-visible:text-primary"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" /> @{STORE.instagram}
              </a>
            )}
          </div>
        </div>
        {STORE.address && (
          <div className="relative min-h-[320px] bg-secondary lg:min-h-[460px]">
            <iframe
              title={`Mapa: ${STORE.name}, ${STORE.address}`}
              src={mapsEmbed(STORE.address)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 grayscale-[0.4] invert-[0.9] hue-rotate-180"
            />
          </div>
        )}
      </div>
    </section>
  );
}

/** Versão curta para o rodapé. */
export function StoreFooterInfo() {
  const lines = hourLines();
  if (!STORE.address && lines.length === 0 && !STORE.instagram) return null;
  return (
    <div className="space-y-2 text-sm text-muted-foreground">
      {STORE.address && (
        <a href={mapsSearch(STORE.address)} target="_blank" rel="noopener noreferrer" className="block hover:text-foreground">
          {STORE.address}
        </a>
      )}
      {lines.map((l) => (
        <p key={l.days}>
          {l.days}: {l.time}
        </p>
      ))}
      {STORE.instagram && (
        <a href={`https://instagram.com/${STORE.instagram}`} target="_blank" rel="noopener noreferrer" className="block hover:text-foreground">
          @{STORE.instagram}
        </a>
      )}
    </div>
  );
}
