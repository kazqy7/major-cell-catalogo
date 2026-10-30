import { ADDRESS, INSTALLMENTS, POLICIES } from "@/config/store";

/**
 * Faixa de confiança: garantia, pagamento e loja física, lidos de src/config/store.ts.
 * Item sem informação cadastrada não aparece.
 */
export function TrustStrip() {
  const [card, ...others] = POLICIES.payments;
  const pay = others.map((o) => (/pix/i.test(o) && POLICIES.pixNote ? `${o} ${POLICIES.pixNote}` : o.toLowerCase()));
  const items: [string, string][] = [];
  if (POLICIES.warranty.iphone_novo) items.push([POLICIES.warranty.iphone_novo, "nos iPhones lacrados"]);
  if (POLICIES.warranty.xiaomi) items.push([POLICIES.warranty.xiaomi, "nos Xiaomi lacrados"]);
  if (POLICIES.warranty.iphone_seminovo)
    items.push([POLICIES.warranty.iphone_seminovo, POLICIES.androidSemiWarranty ? "nos seminovos, iPhone e Android" : "nos iPhones seminovos"]);
  if (card)
    items.push([
      /cart/i.test(card) && INSTALLMENTS.maxInstallments > 1 ? `${card} em até ${INSTALLMENTS.maxInstallments}x` : card,
      pay.length ? `${pay.slice(0, -1).join(", ")}${pay.length > 1 ? " ou " : ""}${pay[pay.length - 1]}` : "Formas de pagamento",
    ]);
  if (ADDRESS.street) items.push(["Loja física", `${ADDRESS.neighborhood}, ${ADDRESS.city}`]);
  if (items.length === 0) return null;
  return (
    <section aria-label="Garantia e pagamento" className="mx-auto max-w-7xl px-5 pt-14">
      <dl className={`grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-background ${items.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
        {items.map(([title, detail], i) => (
          <div key={title} className={`flex flex-col-reverse bg-card p-5 md:p-7 ${items.length % 2 && i === items.length - 1 ? "col-span-2 lg:col-span-1" : ""}`}>
            <dd className="mt-1 text-sm text-muted-foreground md:text-base">{detail}</dd>
            <dt className="text-base font-semibold text-foreground md:text-xl">{title}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
