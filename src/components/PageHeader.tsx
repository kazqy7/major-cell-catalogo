export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-glow">
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-muted-foreground">{subtitle}</p>}
      </div>
    </section>
  );
}
