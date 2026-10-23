import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import i2007 from "@/assets/evo/2007.png.asset.json";
import i2008 from "@/assets/evo/2008.png.asset.json";
import i2009 from "@/assets/evo/2009.png.asset.json";
import i2010 from "@/assets/evo/2010.png.asset.json";
import i2013 from "@/assets/evo/2013.png.asset.json";
import i2017b from "@/assets/evo/2017-8.png.asset.json";
import i2018 from "@/assets/evo/2018xs.png.asset.json";
import i2012 from "@/assets/evo/2012.png.asset.json";
import i2015 from "@/assets/evo/2015.png.asset.json";
import i2016 from "@/assets/evo/2016.png.asset.json";
import i2017 from "@/assets/evo/2017x.png.asset.json";
import i2019 from "@/assets/evo/2019-11.png.asset.json";
import i2020 from "@/assets/evo/2020-12.png.asset.json";
import i2021 from "@/assets/evo/2021.png.asset.json";
import i2022 from "@/assets/evo/2022.png.asset.json";
import i2023 from "@/assets/evo/2023.png.asset.json";
import i2024 from "@/assets/evo/2024.png.asset.json";
import i2025 from "@/assets/evo/2025.png.asset.json";
import i2026pro from "@/assets/evo/2026pro-new.png.asset.json";
import i2026duo from "@/assets/evo/2026duo-new.png.asset.json";
import i2025air from "@/assets/evo/2025air.png.asset.json";

// Chronological iPhone generations. Images: Wikimedia Commons (2007–2020, CC licences) and official Apple photos (2021+).
// `match` = catalog product name to link to, when the store carries that line.
export const GENERATIONS = [
  { name: "iPhone", year: 2007, img: i2007.url, text: "O primeiro iPhone: tela sensível ao toque e um único botão redefiniram o celular." },
  { name: "iPhone 3G", year: 2008, img: i2008.url, text: "Chegada da internet 3G, do GPS e da App Store." },
  { name: "iPhone 3GS", year: 2009, img: i2009.url, text: "Mais rápido, com gravação de vídeo e controle por voz." },
  { name: "iPhone 4", year: 2010, img: i2010.url, text: "Vidro e aço, tela Retina e a primeira câmera frontal para FaceTime." },
  { name: "iPhone 5", year: 2012, img: i2012.url, text: "Tela maior de 4 polegadas, corpo de alumínio e o conector Lightning." },
  { name: "iPhone 5s", year: 2013, img: i2013.url, text: "Estreia do Touch ID, o leitor de digital no botão de início." },
  { name: "iPhone 6s", year: 2015, img: i2015.url, text: "Linhas arredondadas e o 3D Touch, que sentia a pressão do toque." },
  { name: "iPhone 7", year: 2016, img: i2016.url, text: "Resistência à água e o fim da entrada de fone de ouvido." },
  { name: "iPhone 8", year: 2017, img: i2017b.url, text: "Traseira de vidro e o primeiro iPhone com carregamento sem fio." },
  { name: "iPhone X", year: 2017, img: i2017.url, text: "Tela de ponta a ponta, Face ID e o adeus ao botão de início." },
  { name: "iPhone XS", year: 2018, img: i2018.url, text: "Evolução do X com chip mais rápido e suporte a dois chips (eSIM)." },
  { name: "iPhone 11", year: 2019, img: i2019.url, text: "Câmera dupla com ultra-angular e o modo Noite." },
  { name: "iPhone 12", year: 2020, img: i2020.url, text: "Laterais retas, 5G e o carregamento magnético MagSafe." },
  { name: "iPhone 13", year: 2021, img: i2021.url, match: "iPhone 13", text: "Bateria maior e modo Cinema para vídeos com desfoque." },
  { name: "iPhone 14", year: 2022, img: i2022.url, match: "iPhone 14", text: "Detecção de acidentes e SOS de emergência via satélite." },
  { name: "iPhone 15", year: 2023, img: i2023.url, match: "iPhone 15", text: "Dynamic Island na linha inicial e conector USB-C." },
  { name: "iPhone 16", year: 2024, img: i2024.url, match: "iPhone 16", text: "Botão Controle da Câmera e chip preparado para Apple Intelligence." },
  { name: "iPhone 17 Pro Max", year: 2025, img: i2025.url, match: "iPhone 17 Pro Max", text: "Novo design em alumínio e o sistema de câmeras Pro mais avançado." },
  { name: "iPhone Air", year: 2025, img: i2025air.url, text: "O iPhone mais fino já feito, com uma única câmera traseira." },
  { name: "iPhone 18 Pro", year: 2026, img: i2026pro.url, match: "iPhone 18 Pro", text: "A nova geração Pro anunciada pela Apple em setembro de 2026." },
  { name: "iPhone Duo", year: 2026, img: i2026duo.url, match: "iPhone Duo", text: "O primeiro iPhone dobrável, apresentado pela Apple em 2026." },
] as const;

type Item = { id: string; name: string };

export function IphoneOrbit({ products }: { products: Item[] }) {
  const last = GENERATIONS.length - 1;
  const [active, setActive] = useState(last - 2);
  const [narrow, setNarrow] = useState(false);
  const startX = useRef<number | null>(null);
  const swiped = useRef(false);
  // Only download photos near the visible phone; keep already-loaded ones mounted.
  const seen = useRef(new Set<number>());

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const go = (d: number) => setActive((a) => Math.min(last, Math.max(0, a + d)));
  const g = GENERATIONS[active] ?? GENERATIONS[last]!;
  const product = "match" in g ? products.find((p) => p.name === g.match) : undefined;

  const R = narrow ? 260 : 560; // orbit radius (px)
  const STEP = narrow ? 32 : 30; // degrees between phones

  return (
    <div className="relative">
      <div
        role="region"
        aria-roledescription="carrossel"
        aria-label="Evolução do iPhone"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); }}
        onPointerDown={(e) => { startX.current = e.clientX; }}
        onPointerUp={(e) => {
          if (startX.current == null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          swiped.current = Math.abs(dx) > 40;
          if (swiped.current) go(dx < 0 ? 1 : -1);
        }}
        className="relative h-[300px] touch-pan-y select-none overflow-hidden outline-none sm:h-[400px] lg:h-[440px]"
        style={{ perspective: narrow ? "800px" : "1400px" }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {GENERATIONS.map((item, i) => {
            const d = i - active;
            const theta = (d * STEP * Math.PI) / 180;
            const x = R * Math.sin(theta);
            const z = R * (Math.cos(theta) - 1);
            const hidden = Math.abs(d) > (narrow ? 2 : 3);
            return (
              <button
                key={item.name}
                type="button"
                tabIndex={-1}
                aria-label={`${item.name}, ${item.year}`}
                onClick={() => { if (swiped.current) { swiped.current = false; return; } setActive(i); }}
                className="group absolute left-1/2 top-1/2 flex cursor-pointer h-[240px] w-[180px] items-center justify-center sm:h-[330px] sm:w-[250px] lg:h-[360px] lg:w-[280px]"
                style={{
                  transform: `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${-d * STEP * 0.8}deg)`,
                  opacity: hidden ? 0 : d === 0 ? 1 : Math.max(0.35, 0.85 - Math.abs(d) * 0.13),
                  filter: d === 0 ? "none" : `brightness(${Math.max(0.55, 0.9 - Math.abs(d) * 0.1)})`,
                  zIndex: 100 - Math.abs(d),
                  pointerEvents: hidden ? "none" : "auto",
                  transition: "transform 700ms cubic-bezier(.22,.8,.26,1), opacity 700ms, filter 700ms",
                }}
              >
                {(Math.abs(d) <= 4 || seen.current.has(i)) && (seen.current.add(i), true) && (
                <img
                  src={item.img}
                  alt={d === 0 ? `${item.name} (${item.year})` : ""}
                  decoding="async"
                  draggable={false}
                  style={item.img.endsWith(".jpg") ? { maskImage: "radial-gradient(closest-side, #000 70%, transparent)", WebkitMaskImage: "radial-gradient(closest-side, #000 70%, transparent)" } : undefined}
                  className="max-h-full max-w-full object-contain drop-shadow-[0_18px_20px_rgba(0,0,0,0.7)]"
                />
                )}
              </button>
            );
          })}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-[20%] bottom-4 h-6 rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_14%,transparent),transparent)]" />
      </div>

      <button type="button" aria-label="Geração anterior" onClick={() => go(-1)} disabled={active === 0}
        className="absolute left-0 top-[150px] z-[200] -translate-y-1/2 rounded-full hairline bg-background/70 p-2.5 text-foreground backdrop-blur transition-colors hover:border-primary hover:text-primary disabled:opacity-30 sm:top-[200px] lg:top-[220px]">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button type="button" aria-label="Próxima geração" onClick={() => go(1)} disabled={active === last}
        className="absolute right-0 top-[150px] z-[200] -translate-y-1/2 rounded-full hairline bg-background/70 p-2.5 text-foreground backdrop-blur transition-colors hover:border-primary hover:text-primary disabled:opacity-30 sm:top-[200px] lg:top-[220px]">
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="mt-2 min-h-[120px] text-center" aria-live="polite">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">{g.year}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{g.name}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{g.text}</p>
        {product && (
          <Link to="/produto/$id" params={{ id: product.id }} className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline">
            Ver no catálogo
          </Link>
        )}
      </div>

      <div className="mt-3 flex justify-center gap-1.5" aria-label="Linha do tempo">
        {GENERATIONS.map((item, i) => (
          <button key={item.name} type="button" aria-label={`${item.name}, ${item.year}`} aria-current={i === active}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground"}`} />
        ))}
      </div>
    </div>
  );
}
