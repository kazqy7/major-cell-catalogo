import { useEffect, useState } from "react";

/**
 * Imagem que troca sem piscar: ao mudar o src, continua mostrando a foto atual
 * e só troca quando a nova já terminou de carregar. Se a nova já está no cache, troca na hora.
 */
export function SwapImage({ src, ...rest }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const [shown, setShown] = useState(src);
  useEffect(() => {
    if (src === shown) return;
    const img = new Image();
    let cancelled = false;
    const done = () => {
      if (!cancelled) setShown(src);
    };
    img.onload = done;
    img.onerror = done;
    img.src = src;
    if (img.complete) done();
    return () => {
      cancelled = true;
    };
  }, [src, shown]);
  return <img {...rest} src={shown} />;
}
