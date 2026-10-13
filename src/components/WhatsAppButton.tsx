import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { whatsappLink } from "@/config/store";
import { cn } from "@/lib/utils";

export function WhatsAppButton({
  message,
  children = "Consultar no WhatsApp",
  variant = "gold",
  className,
}: {
  message: string;
  children?: React.ReactNode;
  variant?: "gold" | "outline";
  className?: string;
}) {
  const href = whatsappLink(message);
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all";
  const styles =
    variant === "gold"
      ? "bg-gold text-primary-foreground shadow-gold hover:-translate-y-0.5"
      : "hairline text-foreground hover:border-primary hover:text-primary";
  if (!href) {
    return (
      <button
        type="button"
        className={cn(base, styles, className)}
        onClick={() => toast.info("O número de WhatsApp da loja ainda não foi configurado.")}
      >
        <MessageCircle className="h-4 w-4" /> {children}
      </button>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(base, styles, className)}>
      <MessageCircle className="h-4 w-4" /> {children}
    </a>
  );
}
