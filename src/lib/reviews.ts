import { z } from "zod";

export const ANON_NAME = "Cliente anônimo";

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().default(""),
  displayName: z.string().trim().max(40).optional().default(""),
  website: z.string().max(0).optional().default(""), // honeypot: must stay empty
});
export type ReviewInput = z.input<typeof reviewSchema>;

export type PublicReview = { id: string; rating: number; comment: string | null; display_name: string | null; created_at: string };

export const shownName = (n: string | null | undefined) => (n && n.trim() ? n.trim() : ANON_NAME);

export function summarize(list: { rating: number }[]) {
  if (list.length === 0) return { count: 0, average: 0 };
  const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
  return { count: list.length, average: Math.round(avg * 10) / 10 };
}

const ADJ = ["Cliente", "Fã", "Amigo", "Visitante", "Usuário"];
const NOUN = ["Dourado", "Leal", "Feliz", "Conectado", "Satisfeito", "Premium", "Antenado"];
export function randomName(rand: () => number = Math.random) {
  const a = ADJ[Math.floor(rand() * ADJ.length)];
  const b = NOUN[Math.floor(rand() * NOUN.length)];
  return `${a} ${b} ${100 + Math.floor(rand() * 900)}`;
}

/** Max reviews accepted from the same connection within the window. */
export const RATE_LIMIT = { max: 3, windowMinutes: 60 };
