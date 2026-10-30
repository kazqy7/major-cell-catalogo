import { HOURS } from "@/config/store";

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const TZ = "America/Sao_Paulo";

/** "09:00" → "9h"; "18:30" → "18h30". */
const fmt = (hhmm: string) => {
  const [h, m] = hhmm.split(":");
  return `${Number(h)}h${m && m !== "00" ? m : ""}`;
};

/** Junta dias seguidos: [1,2,3,4,5] → "Segunda a sexta"; [6] → "Sábado". */
function dayRange(days: number[]) {
  const d = [...days].sort((a, b) => a - b);
  const runs: number[][] = [];
  for (const x of d) {
    const last = runs[runs.length - 1];
    if (last && x === last[last.length - 1]! + 1) last.push(x);
    else runs.push([x]);
  }
  return runs
    .map((r) => (r.length > 2 ? `${DAY_NAMES[r[0]!]} a ${DAY_NAMES[r[r.length - 1]!]!.toLowerCase()}` : r.map((x) => DAY_NAMES[x]).join(" e ")))
    .join(", ");
}

/** Linhas prontas para mostrar: "Segunda a sexta" · "9h às 18h". */
export const hourLines = (hours = HOURS) => hours.map((h) => ({ days: dayRange(h.days), time: `${fmt(h.open)} às ${fmt(h.close)}` }));

/** Dia da semana e minutos do dia no horário de Brasília, seja qual for o fuso do visitante. */
export function brasiliaNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":");
  return Number(h) * 60 + Number(m ?? 0);
};

/** A loja está aberta agora? null quando não há horário cadastrado. */
export function isOpenNow(date = new Date(), hours = HOURS): boolean | null {
  if (hours.length === 0) return null;
  const { day, minutes } = brasiliaNow(date);
  return hours.some((h) => h.days.includes(day) && minutes >= toMin(h.open) && minutes < toMin(h.close));
}
