import { useState } from "react";
import { CreditCard } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { installmentOptions, isConfigured, simulate } from "@/lib/installments";

export function InstallmentSimulator({ price }: { price: number | null }) {
  const opts = installmentOptions();
  const [n, setN] = useState(opts[opts.length - 1] ?? 1);
  const res = simulate(price, n);
  return (
    <section className="mt-6 rounded-2xl hairline p-5" aria-label="Simulador de parcelas">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <CreditCard className="h-4 w-4 text-primary" /> Simular parcelas
      </h2>
      {!isConfigured() || price == null ? (
        <p className="mt-2 text-sm text-muted-foreground">
          As condições de parcelamento são informadas no atendimento. Consulte pelo WhatsApp.
        </p>
      ) : (
        <>
          <label className="mt-3 block text-xs text-muted-foreground">
            Número de parcelas
            <select value={n} onChange={(e) => setN(Number(e.target.value))} className="mt-1 h-10 w-full rounded-full bg-secondary px-4 text-sm text-foreground">
              {opts.map((o) => <option key={o} value={o}>{o}x</option>)}
            </select>
          </label>
          {res && (
            <p className="mt-3 text-sm" aria-live="polite">
              {n}x de <strong>{formatPrice(res.installment)}</strong>
              <span className="text-muted-foreground"> · total {formatPrice(res.total)}</span>
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">Valores estimados. Condições sujeitas à confirmação da loja pelo WhatsApp.</p>
        </>
      )}
    </section>
  );
}
