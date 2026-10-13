import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { WhatsAppButton } from "./WhatsAppButton";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/iphones-novos", label: "iPhones novos" },
  { to: "/iphones-seminovos", label: "iPhones seminovos" },
  { to: "/xiaomi", label: "Xiaomi" },
  { to: "/sobre", label: "Sobre a loja" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-5 py-4">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: true }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <WhatsAppButton message="Olá, Major Cell! Gostaria de consultar os aparelhos disponíveis.">
            Consultar no WhatsApp
          </WhatsAppButton>
        </div>
        <button
          className="rounded-full p-2 hairline lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border px-5 pb-6 lg:hidden">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block border-b border-border/50 py-3.5 text-base text-foreground"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: true }}
            >
              {n.label}
            </Link>
          ))}
          <WhatsAppButton className="mt-5 w-full" message="Olá, Major Cell! Gostaria de consultar os aparelhos disponíveis." />
        </nav>
      )}
    </header>
  );
}
