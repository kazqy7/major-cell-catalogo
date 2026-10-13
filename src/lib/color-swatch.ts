// Display-only swatch tones for color names typed by the admin.
// Never decides availability; unknown names fall back to a neutral ring.
const TONES: [RegExp, string][] = [
  [/meia-noite|midnight|preto|black|grafite|graphite|espacial/i, "#2b2c30"],
  [/estelar|starlight/i, "#f0e6d8"],
  [/branco|white|prata|silver/i, "#e8e8ea"],
  [/natural/i, "#bfb8ab"],
  [/deserto|desert|areia|bege/i, "#c8ab8c"],
  [/dourad|gold/i, "#e3cfa6"],
  [/laranja|orange|cobre|copper/i, "#d9773a"],
  [/vermelh|red/i, "#b3202c"],
  [/rosa|pink/i, "#f2c6cf"],
  [/roxo|lilás|lilas|purple|lavanda|lavender/i, "#c7b6dc"],
  [/azul.?(claro|céu|ceu)|sky|névoa|nevoa|mist|teal|turquesa/i, "#b9d3e1"],
  [/azul|blue|ultramarino|ultramarine/i, "#3d5a80"],
  [/verde.?(claro|menta)|mint|sálvia|salvia|sage/i, "#c7dccb"],
  [/verde|green/i, "#4c6b52"],
  [/amarel|yellow/i, "#f3e19a"],
  [/cinza|gray|grey|titânio|titanio/i, "#8e8e93"],
];

export function swatchTone(name: string): string | null {
  for (const [re, hex] of TONES) if (re.test(name)) return hex;
  return null;
}
