import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { swatchTone } from "@/lib/color-swatch";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Smartphone, X } from "lucide-react";
import { colorImageUrl, parseColors, parsePhotoColors, categoryLabel, conditionLabel, formatPrice, productMessage, comingSoonMessage, productQuery } from "@/lib/products";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { catalogError } from "@/components/CategoryPage";
import { FavoriteButton, StockBadge } from "@/components/FavoriteButton";
import { InstallmentSimulator } from "@/components/InstallmentSimulator";

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
  const [chosen, setChosen] = useState<string | null>(null);
  const [photoColorName, setPhotoColorName] = useState<string | null>(null);
  const [zoom, setZoom] = useState(false);
  const photoColors = p ? parsePhotoColors(p.photo_colors) : [];
  const colors = p ? parseColors(p.colors) : [];
  const chosenColor = colors.find((c) => c.name === chosen && c.available);
  const usePhotoColors = colors.length === 0 && photoColors.length > 0;
  const photoColor = usePhotoColors ? photoColors.find((c) => c.name === photoColorName) ?? photoColors[0] : undefined;
  const gallery = chosenColor?.image ? [colorImageUrl(chosenColor.image)] : photoColor ? photoColor.images : p?.imageUrls ?? [];
  const safeIdx = Math.min(idx, Math.max(gallery.length - 1, 0));
  const go = (d: number) => setIdx((safeIdx + d + gallery.length) % gallery.length);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!p) return null;
  const mainImg = gallery[safeIdx];
  const colorName = chosenColor?.name ?? photoColor?.name;
  const anyAvailable = colors.some((c) => c.available);
  const price = formatPrice(p.price);
  const soon = p.status === "em_breve";
  const sold = p.status !== "disponivel" && !soon;
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
      <Link to="/catalogo" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Catálogo
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-showcase p-8">
            {mainImg ? (
              <button type="button" onClick={() => setZoom(true)} className="h-full w-full cursor-zoom-in" aria-label="Ampliar foto">
                <img src={mainImg} alt={colorName ? `${p.name} ${colorName}` : p.name} className="h-full w-full object-contain" />
              </button>
            ) : (
              <Smartphone className="h-16 w-16 text-muted-foreground" strokeWidth={1} />
            )}
            {gallery.length > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground backdrop-blur hover:bg-background"><ChevronLeft className="h-5 w-5" /></button>
                <button type="button" onClick={() => go(1)} aria-label="Próxima foto" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground backdrop-blur hover:bg-background"><ChevronRight className="h-5 w-5" /></button>
              </>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {gallery.map((u, i) => (
                <button key={u} onClick={() => setIdx(i)} className={`h-16 w-16 overflow-hidden rounded-xl bg-showcase p-1 ring-1 ${i === safeIdx ? "ring-2 ring-primary" : "ring-border"}`} aria-label={`Foto ${i + 1}`}>
                  <img src={u} alt="" loading="lazy" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-primary">{conditionLabel(p.category)} · {categoryLabel(p.category)}</p>
            <FavoriteButton id={p.id} name={p.name} className="hairline" />
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{p.name}</h1>
          {p.model && <p className="mt-1 text-lg text-muted-foreground">{p.model}</p>}
          <p className="mt-5 text-2xl font-medium">
            {soon ? <span className="text-lg text-muted-foreground">Preço a consultar</span> : price ?? <span className="text-lg text-muted-foreground">Consulte disponibilidade</span>}
          </p>
          <div className="mt-3"><StockBadge status={p.status} /></div>
          {sold && <p className="mt-2 text-sm font-semibold text-destructive">Este aparelho está esgotado.</p>}
          {soon && <p className="mt-2 text-sm text-muted-foreground">Lançamento oficial da Apple. Ainda não está em estoque na Major Cell; preço e disponibilidade serão informados pelo WhatsApp.</p>}
          {!sold && !soon && <InstallmentSimulator price={p.price} />}

          {colors.length > 0 && (
            <section className="mt-10 border-t border-border pt-8">
              <h2 className="text-xl font-semibold">
                Cor. <span className="text-muted-foreground">{chosenColor ? chosenColor.name : "Escolha a sua."}</span>
              </h2>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-5" role="radiogroup" aria-label="Cores">
                {colors.map((c) => {
                  const active = chosenColor?.name === c.name;
                  const tone = swatchTone(c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={c.available ? c.name : `${c.name} — esgotada`}
                      disabled={!c.available}
                      onClick={() => setChosen(c.name)}
                      className="group flex w-16 flex-col items-center gap-2 disabled:cursor-not-allowed"
                    >
                      <span className={`relative flex h-10 w-10 items-center justify-center rounded-full p-[3px] ring-2 transition ${active ? "ring-primary" : "ring-transparent group-enabled:group-hover:ring-border"}`}>
                        <span
                          className={`block h-full w-full overflow-hidden rounded-full ring-1 ring-border ${c.available ? "" : "opacity-40"}`}
                          style={tone ? { backgroundColor: tone } : undefined}
                        >
                          {!tone && c.image && <img src={colorImageUrl(c.image)} alt="" className="h-full w-full object-cover" />}
                          {!tone && !c.image && <span className="block h-full w-full bg-secondary" />}
                        </span>
                        {!c.available && <span aria-hidden className="absolute h-[2px] w-11 rotate-45 rounded bg-muted-foreground" />}
                      </span>
                      <span className={`text-center text-xs leading-tight ${active ? "text-foreground" : "text-muted-foreground"}`}>
                        {c.name}
                        {!c.available && <span className="block text-[10px] text-destructive">Esgotada</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {usePhotoColors && photoColor && (
            <section className="mt-10 border-t border-border pt-8">
              <h2 className="text-xl font-semibold">
                Cor. <span className="text-muted-foreground">{photoColor.name}</span>
              </h2>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-5" role="radiogroup" aria-label="Cores oficiais do modelo">
                {photoColors.map((c) => {
                  const active = c.name === photoColor.name;
                  return (
                    <button key={c.name} type="button" role="radio" aria-checked={active} aria-label={c.name}
                      onClick={() => { setPhotoColorName(c.name); setIdx(0); }}
                      className="group flex w-16 flex-col items-center gap-2">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full p-[3px] ring-2 transition ${active ? "ring-primary" : "ring-transparent group-hover:ring-border"}`}>
                        <span className="block h-full w-full overflow-hidden rounded-full ring-1 ring-border" style={c.hex ? { backgroundColor: c.hex } : undefined}>
                          {!c.hex && <img src={c.images[0]} alt="" className="h-full w-full object-cover" />}
                        </span>
                      </span>
                      <span className={`text-center text-xs leading-tight ${active ? "text-foreground" : "text-muted-foreground"}`}>{c.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{p.category === "xiaomi" ? "Cores ilustrativas das versões oficiais. Confirme a disponibilidade da cor pelo WhatsApp." : "Cores oficiais do modelo. Confirme a disponibilidade da cor pelo WhatsApp."}</p>
            </section>
          )}

          <section className="mt-10 border-t border-border pt-6">
            <Row k="Condição" v={conditionLabel(p.category)} />
            <Row k="Armazenamento" v={p.storage} />
            <Row k="Memória RAM" v={p.ram} />
            {colors.length === 0 && !usePhotoColors && <Row k="Cor" v={p.color} />}
            {p.category === "iphone_seminovo" && <Row k="Saúde da bateria" v={p.battery_health != null ? `${p.battery_health}%` : null} />}
          </section>
          {p.description && <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{p.description}</p>}

          <div className="mt-10 rounded-3xl bg-card p-6">
            {soon ? (
              <WhatsAppButton message={comingSoonMessage(p, photoColor?.name)} className="w-full px-6 py-3.5 text-base">Consultar lançamento</WhatsAppButton>
            ) : sold ? (
              <WhatsAppButton variant="outline" message={`Olá! Vi que o ${p.name}${p.storage ? " " + p.storage : ""} está esgotado. Vocês terão novamente?`} className="w-full px-6 py-3.5 text-base">
                Avisar quando chegar
              </WhatsAppButton>
            ) : colors.length > 0 && !chosenColor ? (
              <button type="button" disabled className="w-full cursor-not-allowed rounded-full bg-secondary px-6 py-3.5 text-base text-muted-foreground">
                {anyAvailable ? "Selecione uma cor para consultar" : "Todas as cores estão esgotadas"}
              </button>
            ) : (
              <WhatsAppButton message={productMessage(p, chosenColor?.name ?? photoColor?.name)} className="w-full px-6 py-3.5 text-base" />
            )}
            <p className="mt-3 text-center text-xs text-muted-foreground">Atendimento direto com a Major Cell pelo WhatsApp.</p>
            {p.category !== "xiaomi" && (
              <Link to="/comparar" search={{ ids: p.id }} className="mt-4 block text-center text-sm text-primary hover:underline">
                Comparar com outro iPhone
              </Link>
            )}
          </div>
        </div>
      </div>
      {zoom && mainImg && (
        <div role="dialog" aria-modal="true" aria-label="Foto ampliada" className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur" onClick={() => setZoom(false)}>
          <button type="button" onClick={() => setZoom(false)} aria-label="Fechar" className="absolute right-4 top-4 rounded-full bg-secondary p-2 text-foreground"><X className="h-5 w-5" /></button>
          <div className="flex max-h-full w-full max-w-4xl items-center justify-center rounded-3xl bg-showcase p-6" onClick={(e) => e.stopPropagation()}>
            <img src={mainImg} alt={colorName ? `${p.name} ${colorName}` : p.name} className="max-h-[80vh] w-full object-contain" />
          </div>
          {gallery.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Foto anterior" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-secondary p-3 text-foreground"><ChevronLeft className="h-6 w-6" /></button>
              <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Próxima foto" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-secondary p-3 text-foreground"><ChevronRight className="h-6 w-6" /></button>
              <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">{safeIdx + 1} / {gallery.length}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
