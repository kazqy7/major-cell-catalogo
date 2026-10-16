import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3">
        <div className="space-y-4">
          <Logo className="h-12 w-auto" />
          <p className="max-w-xs text-sm text-muted-foreground">
            iPhones novos, seminovos selecionados e Xiaomi, com atendimento de confiança.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-primary">Catálogo</p>
          <Link to="/iphones-novos" className="block text-muted-foreground hover:text-foreground">iPhones novos</Link>
          <Link to="/iphones-seminovos" className="block text-muted-foreground hover:text-foreground">iPhones seminovos</Link>
          <Link to="/xiaomi" className="block text-muted-foreground hover:text-foreground">Xiaomi</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-primary">Loja</p>
          <Link to="/sobre" className="block text-muted-foreground hover:text-foreground">Sobre a loja</Link>
          <Link to="/contato" className="block text-muted-foreground hover:text-foreground">Contato</Link>
          <Link to="/admin" className="block text-muted-foreground/60 hover:text-foreground">Área administrativa</Link>
        </div>
      </div>
      <p className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Major Cell. Todos os direitos reservados.
      </p>
    </footer>
  );
}
