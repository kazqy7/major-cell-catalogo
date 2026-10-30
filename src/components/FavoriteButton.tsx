import { Heart } from "lucide-react";
import { toggleFavorite, useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({ id, name, className }: { id: string; name: string; className?: string }) {
  const on = useFavorites().includes(id);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remover ${name} dos favoritos` : `Adicionar ${name} aos favoritos`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(id); }}
      className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/70 backdrop-blur transition-colors hover:text-primary", on ? "text-primary" : "text-muted-foreground", className)}
    >
      <Heart className="h-4 w-4" fill={on ? "currentColor" : "none"} />
    </button>
  );
}

export function StockBadge({ status }: { status: string }) {
  if (status === "em_breve")
    return <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">Em breve</span>;
  const sold = status !== "disponivel";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium", sold ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", sold ? "bg-destructive" : "bg-primary")} />
      {sold ? "Esgotado" : "Disponível"}
    </span>
  );
}
