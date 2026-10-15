// Technical specs from Apple's official spec pages (apple.com/br/iphone/compare).
// Keyed by model line; storage, price and stock always come from the catalog.
export type IphoneSpec = {
  screen: string;
  screenIn: number;
  refresh: string;
  chip: string;
  chipGen: number; // higher = newer chip, used only for ranking
  cameras: string;
  cameraTier: number; // 1 dual 12MP … 5 triple 48MP
  videoHours: number; // Apple: max video playback
};

export const IPHONE_SPECS: Record<string, IphoneSpec> = {
  "iphone 13": { screen: '6,1" Super Retina XDR', screenIn: 6.1, refresh: "60 Hz", chip: "A15 Bionic", chipGen: 15, cameras: "Dupla 12 MP (grande-angular e ultra-angular)", cameraTier: 1, videoHours: 19 },
  "iphone 13 pro max": { screen: '6,7" Super Retina XDR com ProMotion', screenIn: 6.7, refresh: "até 120 Hz", chip: "A15 Bionic (GPU 5 núcleos)", chipGen: 15.5, cameras: "Tripla 12 MP com teleobjetiva 3x", cameraTier: 2, videoHours: 28 },
  "iphone 14": { screen: '6,1" Super Retina XDR', screenIn: 6.1, refresh: "60 Hz", chip: "A15 Bionic (GPU 5 núcleos)", chipGen: 15.5, cameras: "Dupla 12 MP (principal e ultra-angular)", cameraTier: 1, videoHours: 20 },
  "iphone 14 pro max": { screen: '6,7" Super Retina XDR com ProMotion', screenIn: 6.7, refresh: "até 120 Hz", chip: "A16 Bionic", chipGen: 16, cameras: "Tripla: principal 48 MP, ultra-angular 12 MP, teleobjetiva 3x", cameraTier: 3, videoHours: 29 },
  "iphone 15": { screen: '6,1" Super Retina XDR', screenIn: 6.1, refresh: "60 Hz", chip: "A16 Bionic", chipGen: 16, cameras: "Dupla: principal 48 MP e ultra-angular 12 MP", cameraTier: 2, videoHours: 20 },
  "iphone 15 pro max": { screen: '6,7" Super Retina XDR com ProMotion', screenIn: 6.7, refresh: "até 120 Hz", chip: "A17 Pro", chipGen: 17, cameras: "Tripla: principal 48 MP, ultra-angular 12 MP, teleobjetiva 5x", cameraTier: 4, videoHours: 29 },
  "iphone 16": { screen: '6,1" Super Retina XDR', screenIn: 6.1, refresh: "60 Hz", chip: "A18", chipGen: 18, cameras: "Dupla: Fusion 48 MP e ultra-angular 12 MP", cameraTier: 2, videoHours: 22 },
  "iphone 16 pro max": { screen: '6,9" Super Retina XDR com ProMotion', screenIn: 6.9, refresh: "até 120 Hz", chip: "A18 Pro", chipGen: 18.5, cameras: "Tripla: Fusion 48 MP, ultra-angular 48 MP, teleobjetiva 5x", cameraTier: 5, videoHours: 33 },
  "iphone 17": { screen: '6,3" Super Retina XDR com ProMotion', screenIn: 6.3, refresh: "até 120 Hz", chip: "A19", chipGen: 19, cameras: "Dupla: Fusion 48 MP e ultra-angular 48 MP", cameraTier: 3, videoHours: 30 },
  "iphone 17 pro": { screen: '6,3" Super Retina XDR com ProMotion', screenIn: 6.3, refresh: "até 120 Hz", chip: "A19 Pro", chipGen: 19.5, cameras: "Tripla 48 MP com teleobjetiva 4x", cameraTier: 5, videoHours: 31 },
  "iphone 17 pro max": { screen: '6,9" Super Retina XDR com ProMotion', screenIn: 6.9, refresh: "até 120 Hz", chip: "A19 Pro", chipGen: 19.5, cameras: "Tripla 48 MP com teleobjetiva 4x", cameraTier: 5, videoHours: 37 },
};

export function specFor(name: string): IphoneSpec | null {
  const m = name.toLowerCase().match(/iphone\s+\d+(\s+pro)?(\s+max)?/);
  return m ? IPHONE_SPECS[m[0].replace(/\s+/g, " ").trim()] ?? null : null;
}

export type Priority = "camera" | "bateria" | "desempenho" | "tela" | "custo";
export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "camera", label: "Câmera" },
  { value: "bateria", label: "Bateria" },
  { value: "desempenho", label: "Desempenho" },
  { value: "tela", label: "Tela" },
  { value: "custo", label: "Custo-benefício" },
];

type Rankable = { id: string; name: string; price: number | null };

const score = (s: IphoneSpec, pr: Priority, price: number) => {
  switch (pr) {
    case "camera": return s.cameraTier * 10 + s.chipGen / 10;
    case "bateria": return s.videoHours;
    case "desempenho": return s.chipGen;
    case "tela": return s.screenIn * 10 + (s.refresh.includes("120") ? 5 : 0);
    case "custo": return (s.chipGen + s.cameraTier * 2 + s.videoHours / 3) / (price / 1000);
  }
};

/** Up to 3 catalog iPhones within budget, best first for the priority. */
export function recommend<T extends Rankable>(items: T[], budget: number, pr: Priority): T[] {
  return items
    .filter((p) => p.price != null && p.price <= budget && specFor(p.name))
    .sort((a, b) => score(specFor(b.name)!, pr, b.price!) - score(specFor(a.name)!, pr, a.price!) || a.price! - b.price!)
    .slice(0, 3);
}

export function reason(s: IphoneSpec, pr: Priority): string {
  switch (pr) {
    case "camera": return `Câmera ${s.cameras.toLowerCase()}.`;
    case "bateria": return `Até ${s.videoHours} h de reprodução de vídeo, segundo a Apple.`;
    case "desempenho": return `Chip ${s.chip}.`;
    case "tela": return `Tela de ${s.screen}, ${s.refresh}.`;
    case "custo": return `Chip ${s.chip} e até ${s.videoHours} h de vídeo pelo menor preço da faixa.`;
  }
}
