import { useEffect, useRef, useState } from "react";
import { ArrowDown, MessageCircle } from "lucide-react";
import { REPAIR_SERVICES, type RepairServiceKey } from "@/lib/repair";
import { cn } from "@/lib/utils";
import META from "../../public/assistencia/explodida/parts.json";

/**
 * Vista explodida do iPhone na página de Assistência.
 * O aparelho fica fixo na tela enquanto a pessoa rola: primeiro ele se abre, depois cada peça
 * de serviço sai de dentro dele e o serviço que conserta aquela peça acende ao lado.
 * As peças são a vista explodida oficial do manual de reparo da Apple (iPhone 16 Pro),
 * recortadas por scripts fora do projeto: sem as legendas azuis, sem o fundo e sem o logo.
 */

// Ordem em que as peças de serviço saem; cada uma corresponde a um serviço de REPAIR_SERVICES.
const STEPS: RepairServiceKey[] = ["tela", "bateria", "placa", "camera", "conector"];
const SERVICES = STEPS.map((k) => REPAIR_SERVICES.find((s) => s.key === k)!);

/** Serviços que têm uma peça no iPhone animado. */
export const hasRepairPart = (key: RepairServiceKey) => STEPS.includes(key);

/** Leva a animação até a peça de um serviço, de qualquer lugar da página. */
export const showRepairPart = (key: RepairServiceKey) =>
  window.dispatchEvent(new CustomEvent<RepairServiceKey>("repair:show", { detail: key }));

// Trechos da rolagem (0 a 1): o aparelho se abre, depois uma peça por trecho, depois o fechamento.
const INTRO = 0.12;
const STEP = 0.14;
const OUTRO = INTRO + STEP * STEPS.length;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

type Role = RepairServiceKey | "carcaca" | "tampa" | "miudas";
// Papel de cada recorte (números do manual da Apple entre parênteses). O que não está aqui é peça miúda.
const ROLES: Record<string, Role> = {
  "p00.png": "tampa", // (1) tampa traseira
  "p02.png": "tampa", // (2) adesivo da tampa
  "p06.png": "camera", // (7) câmeras traseiras
  "p12.png": "conector", // (12) conector USB-C
  "p13.png": "bateria", // (13) bateria
  "p15.png": "placa", // (16) placa lógica
  "p17.png": "carcaca", // (17) carcaça
  "p20.png": "tela", // (20) adesivo da tela
  "p21.png": "tela", // (21) tela
};
const SKIP = new Set(["p01.png"]); // logo da Apple na tampa
const PARTS = META.parts.filter((p) => !SKIP.has(p.file)).map((p) => ({ ...p, role: ROLES[p.file] ?? ("miudas" as Role) }));
const FRAME = PARTS.find((p) => p.role === "carcaca")!;

function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setP(total > 0 ? clamp(-r.top / total) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
  return p;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function RepairExplode({ onPick, selected }: { onPick: (service: string) => void; selected?: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const scrolled = useScrollProgress(ref);
  // Com "reduzir movimento" ligado, mostra o aparelho já aberto, sem animação de rolagem.
  const p = reduced ? 1 : scrolled;
  // O serviço escolhido no orçamento deixa a peça dele marcada, em qualquer ponto da rolagem.
  const picked = SERVICES.find((s) => s.name === selected)?.key;

  /** Rola até o trecho em que a peça do serviço i está em destaque. */
  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    const at = reduced ? 0 : total * (INTRO + i * STEP + STEP * 0.6);
    window.scrollTo({ top: top + at, behavior: reduced ? "auto" : "smooth" });
  };
  const goToRef = useRef(goTo);
  goToRef.current = goTo;
  useEffect(() => {
    const onShow = (e: Event) => {
      const i = STEPS.indexOf((e as CustomEvent<RepairServiceKey>).detail);
      if (i >= 0) goToRef.current(i);
    };
    window.addEventListener("repair:show", onShow);
    return () => window.removeEventListener("repair:show", onShow);
  }, []);

  const open = ease(clamp(p / INTRO));
  const step = (key: RepairServiceKey) => ease(clamp((p - INTRO - STEPS.indexOf(key) * STEP) / (STEP * 0.8)));
  const active = p < INTRO ? -1 : Math.min(STEPS.length - 1, Math.floor((p - INTRO) / STEP));
  const outro = reduced ? 1 : ease(clamp((p - OUTRO) / 0.08));
  // A câmera começa perto do aparelho fechado e se afasta até mostrar todas as peças.
  const away = ease(clamp(p / (INTRO + STEP * 1.5)));
  const zoom = 1 + 1.1 * (1 - away);
  // O foco vai do centro do aparelho fechado para o centro do desenho inteiro.
  const fx = FRAME.cx + (META.width / 2 - FRAME.cx) * away;
  const fy = FRAME.cy + (META.height / 2 - FRAME.cy) * away;

  return (
    <section
      ref={ref}
      aria-label="Peças que consertamos"
      className={cn("relative", reduced ? "py-16" : "h-[280svh] md:h-[340svh]")}
    >
      <div className={cn("mx-auto flex max-w-6xl flex-col items-center gap-4 overflow-hidden px-5 md:flex-row md:gap-12", !reduced && "sticky top-14 h-[calc(100svh-3.5rem)] justify-center")}>
        {/* Atalho para quem quer escolher o serviço sem ver a animação inteira */}
        {!reduced && outro < 0.5 && (
          <a
            href="#servicos"
            className="absolute right-5 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:text-primary"
          >
            Pular para os serviços <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
        {/* O aparelho: cada peça é um recorte da vista explodida, no lugar exato do desenho original */}
        <div className="flex h-[50svh] w-full items-center justify-center md:h-[84svh] md:w-[55%]" aria-hidden="true">
          <svg viewBox={`0 0 ${META.width} ${META.height}`} className="h-full w-auto overflow-visible">
            <g transform={`translate(${META.width / 2} ${META.height / 2}) scale(${zoom}) translate(${-fx} ${-fy})`}>
              {PARTS.map((part) => {
                // t = 0: peça recolhida dentro da carcaça; t = 1: peça no lugar da vista explodida.
                // A peça do serviço escolhido no orçamento já aparece fora do aparelho.
                const t =
                  part.role === "carcaca" || part.role === picked
                    ? 1
                    : part.role === "tampa" || part.role === "miudas"
                      ? open
                      : step(part.role);
                const visible =
                  part.role === "carcaca" || part.role === "tampa" || part.role === "tela"
                    ? 1
                    : part.role === "miudas"
                      ? open
                      : clamp(t * 3);
                const on = part.role === STEPS[active];
                const mark = on || part.role === picked;
                return (
                  <image
                    key={part.file}
                    href={`/assistencia/explodida/${part.file}`}
                    x={part.x}
                    y={part.y}
                    width={part.w}
                    height={part.h}
                    opacity={visible * (active >= 0 && !mark && part.role !== "carcaca" ? 0.55 : 1)}
                    transform={`translate(0 ${(FRAME.cy - part.cy) * (1 - t)})`}
                    style={{
                      filter: on
                        ? "sepia(1) saturate(2.6) hue-rotate(-12deg) brightness(1.05) drop-shadow(0 0 10px color-mix(in oklab, var(--primary) 60%, transparent))"
                        : mark
                          ? "sepia(1) saturate(2.6) hue-rotate(-12deg) brightness(1.05)"
                          : undefined,
                    }}
                  />
                );
              })}
            </g>
          </svg>
        </div>

        {/* Os serviços: um acende a cada peça */}
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Por dentro do seu celular</h2>
          <ol className="mt-6 space-y-2">
            {SERVICES.map((s, i) => {
              const on = reduced || i === active;
              return (
                <li
                  key={s.key}
                  className={cn(
                    "rounded-2xl px-5 py-4 transition-[opacity,background-color] duration-300",
                    on ? "bg-card opacity-100" : s.key === picked ? "opacity-100" : "opacity-40",
                    !reduced && !on && s.key !== picked && "hidden md:block",
                  )}
                >
                  <h3 className="text-lg font-semibold md:text-xl">
                    <button type="button" onClick={() => goTo(i)} className="text-left hover:text-primary focus-visible:text-primary focus-visible:outline-none">
                      {s.name}
                    </button>
                  </h3>
                  {s.key === picked && <p className="mt-1 text-sm font-medium text-primary">Escolhido no seu orçamento</p>}
                  {on && (
                    <>
                      <p className="mt-1 text-sm text-muted-foreground md:text-base">{s.problems}</p>
                      <button
                        type="button"
                        onClick={() => onPick(s.name)}
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline focus-visible:underline"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" /> Pedir orçamento
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
          <div className="mt-6 transition-opacity duration-300" style={{ opacity: outro }} aria-hidden={outro < 0.5}>
            <p className="text-lg">Também consertamos celulares de outras marcas, como Xiaomi e Samsung.</p>
            <a
              href="#orcamento"
              tabIndex={outro < 0.5 ? -1 : 0}
              className="mt-4 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Solicitar orçamento
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
