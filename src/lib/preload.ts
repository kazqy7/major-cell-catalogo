/**
 * Baixa fotos antes de a pessoa precisar delas, para a troca de cor ser imediata.
 * Cada endereço é pedido uma vez só por visita; o navegador guarda a foto no cache.
 */
const requested = new Set<string>();

export function preloadImages(urls: (string | undefined | null)[]) {
  if (typeof window === "undefined") return;
  for (const url of urls) {
    if (!url || requested.has(url)) continue;
    requested.add(url);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  }
}

/** Igual a preloadImages, mas só quando o navegador estiver ocioso (não atrapalha o carregamento da página). */
export function preloadWhenIdle(urls: (string | undefined | null)[]) {
  if (typeof window === "undefined") return;
  const run = () => preloadImages(urls);
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 1500 });
  else setTimeout(run, 200);
}
