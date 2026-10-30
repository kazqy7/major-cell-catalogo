import { useRouterState } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/config/store";

// Telas onde o botão atrapalharia: painel e login.
const HIDDEN = ["/admin", "/entrar", "/redefinir-senha"];

/**
 * Botão de WhatsApp fixo no canto da tela, só no celular e no tablet
 * (no computador o cabeçalho já tem o botão sempre visível).
 */
export function FloatingWhatsApp() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const href = whatsappLink("Olá, Major Cell! Vim pelo site e gostaria de atendimento.");
  if (!href || HIDDEN.some((h) => path.startsWith(h))) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Major Cell no WhatsApp"
      className="fixed z-40 inline-flex h-14 items-center gap-2 rounded-full bg-gold px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/40 transition-transform active:scale-95 lg:hidden"
      style={{
        right: "max(1rem, env(safe-area-inset-right, 0px))",
        bottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      WhatsApp
    </a>
  );
}
