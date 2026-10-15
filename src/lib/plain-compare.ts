// Plain-language descriptions for lay customers, derived only from Apple specs in iphone-specs.ts.
import type { IphoneSpec } from "@/lib/iphone-specs";

type Item = { name: string; price: number | null; spec: IphoneSpec };

const isMax = (items: Item[], it: Item, k: (s: IphoneSpec) => number) =>
  items.every((o) => o === it || k(it.spec) > k(o.spec));

const hasZoom = (s: IphoneSpec) => s.cameras.toLowerCase().includes("teleobjetiva");

export function plainFeatures(s: IphoneSpec, newest: boolean) {
  return [
    { label: "Tela", text: (s.screenIn >= 6.7 ? `Grande (${s.screen.split(" ")[0]}): mais confortável para vídeos e jogos.` : `Média (${s.screen.split(" ")[0]}): mais fácil de segurar com uma mão.`) + (s.refresh.includes("120") ? " Imagem mais suave ao rolar a tela." : "") },
    { label: "Câmeras", text: hasZoom(s) ? "Três câmeras, incluindo uma que aproxima objetos distantes sem perder qualidade." : s.cameraTier >= 2 ? "Duas câmeras, com a principal registrando mais detalhes." : "Duas câmeras que dão conta das fotos do dia a dia." },
    { label: "Bateria", text: `Até ${s.videoHours} horas assistindo vídeos longe da tomada, segundo a Apple.` },
    { label: "Velocidade", text: newest ? "O mais novo desta comparação: abre aplicativos e jogos com mais folga." : "Abre aplicativos e troca entre eles sem dificuldade no uso diário." },
  ];
}

/** Short "who is it for" phrases, only those true relative to the selection. */
export function profilePhrases(items: Item[], it: Item): string[] {
  const out: string[] = [];
  const priced = items.filter((o) => o.price != null);
  if (it.price != null && priced.length === items.length && priced.every((o) => o === it || it.price! < o.price!))
    out.push("Uma alternativa para quem quer gastar menos.");
  if (isMax(items, it, (s) => s.cameraTier)) out.push("Uma opção para quem gosta de fotografar e gravar vídeos.");
  if (isMax(items, it, (s) => s.screenIn)) out.push("Ideal para quem prefere uma tela grande para assistir a vídeos.");
  if (isMax(items, it, (s) => s.videoHours)) out.push("Aguenta mais tempo longe da tomada.");
  if (!out.length) out.push("Uma boa escolha para usar redes sociais, conversar e tirar fotos.");
  return out;
}

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const short = (n: string) => n.replace(/^iPhone\s+/i, "iPhone ");

/** Up to 3 practical differences between the cheapest selected model and the others. */
export function differences(items: Item[]): string[] {
  if (items.length < 2 || items.some((i) => i.price == null)) return [];
  const sorted = [...items].sort((a, b) => a.price! - b.price!);
  const cheap = sorted[0]!;
  const top = sorted[sorted.length - 1]!;
  const out: string[] = [];
  if (top.price! > cheap.price!)
    out.push(`No ${short(cheap.name)}, você paga ${brl(top.price! - cheap.price!)} a menos que o ${short(top.name)} e continua com recursos suficientes para o uso diário.`);
  const cam = items.find((i) => isMax(items, i, (s) => s.cameraTier));
  if (cam) out.push(`O ${short(cam.name)} tem câmeras mais completas, para quem gosta de fotografar.`);
  const big = items.find((i) => isMax(items, i, (s) => s.screenIn));
  if (big) out.push(`O ${short(big.name)} tem a tela maior: mais confortável para filmes, mas ocupa mais espaço no bolso.`);
  else {
    const bat = items.find((i) => isMax(items, i, (s) => s.videoHours));
    if (bat) out.push(`O ${short(bat.name)} aguenta mais tempo longe da tomada.`);
  }
  if (out.length === 1) out.push("Nos demais pontos, as diferenças são pequenas no uso do dia a dia.");
  return out.slice(0, 3);
}
