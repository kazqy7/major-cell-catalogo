import { Link } from "@tanstack/react-router";

/** Marca provisória em texto — substituir pela logo oficial quando enviada. */
export function Logo() {
  return (
    <Link to="/" className="flex items-baseline gap-1.5 font-display" aria-label="Major Cell — início">
      <span className="text-gold text-2xl font-bold tracking-tight">MAJOR</span>
      <span className="text-sm font-medium uppercase tracking-[0.35em] text-silver">Cell</span>
    </Link>
  );
}
