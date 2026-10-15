import { INSTALLMENTS } from "@/config/store";

export type InstallmentConfig = {
  /** Maior número de parcelas confirmado pela loja. 0 = não configurado. */
  maxInstallments: number;
  /** Juros ao mês em % (ex.: 2.99). 0 = sem juros confirmado. null = não informado. */
  monthlyRatePercent: number | null;
};

export const isConfigured = (c: InstallmentConfig = INSTALLMENTS) =>
  c.maxInstallments >= 1 && c.monthlyRatePercent != null && c.monthlyRatePercent >= 0;

export const installmentOptions = (c: InstallmentConfig = INSTALLMENTS) =>
  isConfigured(c) ? Array.from({ length: Math.floor(c.maxInstallments) }, (_, i) => i + 1) : [];

/** Valor da parcela e total. Sem configuração válida, retorna null (nada é presumido). */
export function simulate(price: number | null, n: number, c: InstallmentConfig = INSTALLMENTS) {
  if (price == null || price <= 0 || !isConfigured(c) || n < 1 || n > c.maxInstallments) return null;
  const r = (c.monthlyRatePercent as number) / 100;
  const raw = r === 0 ? price / n : (price * r) / (1 - Math.pow(1 + r, -n));
  const installment = Math.round(raw * 100) / 100;
  return { installment, total: Math.round(installment * n * 100) / 100 };
}
