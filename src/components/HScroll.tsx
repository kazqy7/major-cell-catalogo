import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/** Horizontal card rail with discreet arrows; arrows only scroll, never navigate. */
export function HScroll({ children, label, itemClass = "w-[78%] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]" }: { children: ReactNode; label: string; itemClass?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [can, setCan] = useState({ l: false, r: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCan({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const go = (dir: number) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const btn =
    "absolute top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary/40 bg-background/85 text-primary shadow-lg backdrop-blur transition hover:bg-primary hover:text-primary-foreground md:h-11 md:w-11";

  return (
    <div className="relative" role="region" aria-label={label}>
      <div
        ref={ref}
        onScroll={update}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (c) => <div className={`shrink-0 snap-start ${itemClass}`}>{c}</div>)}
      </div>
      {can.l && (
        <button type="button" aria-label="Anterior" onClick={() => go(-1)} className={`${btn} left-1 md:-left-5`}>
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {can.r && (
        <button type="button" aria-label="Próximo" onClick={() => go(1)} className={`${btn} right-1 md:-right-5`}>
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
