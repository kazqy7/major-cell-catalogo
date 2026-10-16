import { INSTALLMENTS } from "@/config/store";

export type InstallmentConfig = {
  /** Maior número de parcelas confirmado pela loja. 0 = não configurado. */
  maxInstallments: number;
  /** Taxas da maquininha em % por número de parcelas (índice 0 = 1x). null = não informado. */
  rates: (number | null)[];
};

export const isConfigured = (c: InstallmentConfig = INSTALLMENTS) =>
  c.maxInstallments >= 1 && c.rates.some((r) => r != null && r >= 0);

export const installmentOptions = (c: InstallmentConfig = INSTALLMENTS) =>
  isConfigured(c)
    ? Array.from({ length: Math.floor(c.maxInstallments) }, (_, i) => i + 1).filter(
        (n) => c.rates[n - 1] != null,
      )
    : [];

/**
 * Valor da parcela e total com repasse da taxa da maquininha ao cliente:
 * total = preço ÷ (1 − taxa); parcela = total ÷ n. Sem configuração válida, retorna null.
 */
export function simulate(price: number | null, n: number, c: InstallmentConfig = INSTALLMENTS) {
  if (price == null || price <= 0 || !isConfigured(c) || n < 1 || n > c.maxInstallments) return null;
  const rate = c.rates[n - 1];
  if (rate == null || rate < 0 || rate >= 100) return null;
  const total = Math.round((price / (1 - rate / 100)) * 100) / 100;
  const installment = Math.round((total / n) * 100) / 100;
  return { installment, total };
}
