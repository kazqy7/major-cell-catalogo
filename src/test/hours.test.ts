import { describe, expect, it } from "vitest";
import { brasiliaNow, hourLines, isOpenNow } from "@/lib/hours";

const HOURS = [
  { days: [1, 2, 3, 4, 5], open: "09:00", close: "18:00" },
  { days: [6], open: "09:00", close: "13:30" },
];

describe("horário da loja", () => {
  it("junta dias seguidos e formata as horas", () => {
    expect(hourLines(HOURS)).toEqual([
      { days: "Segunda a sexta", time: "9h às 18h" },
      { days: "Sábado", time: "9h às 13h30" },
    ]);
  });

  it("usa o horário de Brasília, seja qual for o fuso do visitante", () => {
    // 2026-10-28 é uma quarta-feira; 15:00 UTC = 12:00 em Brasília.
    expect(brasiliaNow(new Date("2026-10-28T15:00:00Z"))).toEqual({ day: 3, minutes: 720 });
  });

  it("diz se está aberto agora", () => {
    expect(isOpenNow(new Date("2026-10-28T15:00:00Z"), HOURS)).toBe(true); // quarta, 12h
    expect(isOpenNow(new Date("2026-10-28T22:00:00Z"), HOURS)).toBe(false); // quarta, 19h
    expect(isOpenNow(new Date("2026-10-31T17:00:00Z"), HOURS)).toBe(false); // sábado, 14h
    expect(isOpenNow(new Date("2026-11-01T15:00:00Z"), HOURS)).toBe(false); // domingo
    expect(isOpenNow(new Date(), [])).toBeNull();
  });
});
