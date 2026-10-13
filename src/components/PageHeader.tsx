export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-6 pt-16 text-center md:pt-24">
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight md:text-7xl">{title}</h1>
      {subtitle && <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">{subtitle}</p>}
    </section>
  );
}
