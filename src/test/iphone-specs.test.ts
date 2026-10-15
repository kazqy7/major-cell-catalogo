import { describe, expect, it } from "vitest";
import { recommend, specFor } from "@/lib/iphone-specs";

const items = [
  { id: "a", name: "iPhone 13", price: 3399 },
  { id: "b", name: "iPhone 16 Pro Max", price: 6500 },
  { id: "c", name: "iPhone 17 Pro Max", price: 7400 },
];

describe("iphone recommendations", () => {
  it("never recommends above budget", () => {
    expect(recommend(items, 7000, "bateria").map((p) => p.id)).toEqual(["b", "a"]);
  });
  it("matches Pro Max separately from base model", () => {
    expect(specFor("iPhone 17 Pro Max")?.screenIn).toBe(6.9);
    expect(specFor("iPhone 17")?.screenIn).toBe(6.3);
  });
});

import { differences, profilePhrases } from "@/lib/plain-compare";
describe("plain comparison", () => {
  const sel = items.slice(0, 2).map((i) => ({ ...i, spec: specFor(i.name)! }));
  it("only the cheaper model is called the cheaper option", () => {
    expect(profilePhrases(sel, sel[0]!)).toContain("Uma alternativa para quem quer gastar menos.");
    expect(profilePhrases(sel, sel[1]!)).not.toContain("Uma alternativa para quem quer gastar menos.");
  });
  it("lists at most 3 differences", () => {
    expect(differences(sel).length).toBeLessThanOrEqual(3);
  });
});
