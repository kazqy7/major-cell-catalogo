import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { StoreFooterInfo } from "./StoreVisit";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3">
        <div className="space-y-4">
          <Logo className="h-12 w-auto" />
          <p className="max-w-xs text-base text-muted-foreground">
            iPhones novos, seminovos selecionados e Xiaomi, com atendimento de confiança.
          </p>
          <StoreFooterInfo />
        </div>
        <div className="space-y-2 text-sm">
          <p className="mb-3 text-base font-semibold text-foreground">Catálogo</p>
          <Link to="/iphones-novos" className="block text-muted-foreground hover:text-foreground">iPhones novos</Link>
          <Link to="/iphones-seminovos" className="block text-muted-foreground hover:text-foreground">iPhones seminovos</Link>
          <Link to="/xiaomi" className="block text-muted-foreground hover:text-foreground">Xiaomi</Link>
          <Link to="/ofertas" className="block text-muted-foreground hover:text-foreground">Ofertas</Link>
          <Link to="/comparar" className="block text-muted-foreground hover:text-foreground">Comparar iPhones</Link>
          <Link to="/favoritos" className="block text-muted-foreground hover:text-foreground">Meus favoritos</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="mb-3 text-base font-semibold text-foreground">Loja</p>
          <Link to="/troca" className="block text-muted-foreground hover:text-foreground">Troque seu iPhone</Link>
          <Link to="/assistencia" className="block text-muted-foreground hover:text-foreground">Assistência Técnica</Link>
          <Link to="/sobre" className="block text-muted-foreground hover:text-foreground">Sobre a loja</Link>
          <Link to="/contato" className="block text-muted-foreground hover:text-foreground">Contato</Link>
          <Link to="/admin" className="block text-muted-foreground/60 hover:text-foreground">Área administrativa</Link>
        </div>
      </div>
      <p className="pb-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Major Cell. Todos os direitos reservados.
      </p>
    </footer>
  );
}
