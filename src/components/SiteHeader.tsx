import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { WhatsAppButton } from "./WhatsAppButton";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/ofertas", label: "Ofertas" },
  { to: "/iphones-novos", label: "iPhones novos" },
  { to: "/iphones-seminovos", label: "iPhones seminovos" },
  { to: "/xiaomi", label: "Xiaomi" },
  { to: "/comparar", label: "Comparar" },
  { to: "/troca", label: "Troque seu iPhone" },
  { to: "/assistencia", label: "Assistência Técnica" },
  { to: "/favoritos", label: "Meus favoritos" },
  { to: "/sobre", label: "Sobre a loja" },
  { to: "/contato", label: "Contato" },
] as const;

// No computador o menu mostra só o essencial; o restante fica no menu do celular e no rodapé.
const NAV_DESKTOP = [
  { to: "/iphones-novos", label: "iPhones novos" },
  { to: "/iphones-seminovos", label: "Seminovos" },
  { to: "/xiaomi", label: "Xiaomi" },
  { to: "/ofertas", label: "Ofertas" },
  { to: "/assistencia", label: "Assistência" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-5">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_DESKTOP.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
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
        <nav className="bg-card px-5 pb-6 pt-2 lg:hidden">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block py-3.5 text-lg text-foreground"
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
