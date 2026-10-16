import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/major-cell-logo.png.asset.json";

/**
 * Logo oficial da Major Cell — arquivo enviado pelo lojista, sem alterações
 * de desenho. A altura é fixa e a largura acompanha a proporção original
 * (1200x681), então a marca nunca fica esticada, esmagada ou cortada.
 */
export function Logo({ className = "h-8 w-auto sm:h-10" }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Major Cell — ir para a página inicial"
      className="inline-flex shrink-0 items-center"
    >
      <img
        src={logoAsset.url}
        alt="Major Cell — vendas e assistência técnica"
        width={1200}
        height={681}
        className={`object-contain max-w-full ${className}`}
        draggable={false}
      />
    </Link>
  );
}
