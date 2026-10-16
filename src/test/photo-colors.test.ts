import { describe, it, expect } from "vitest";
import { parsePhotoColors } from "@/lib/products";

describe("photo colors", () => {
  it("keeps only colors with a name and at least one photo", () => {
    const r = parsePhotoColors([
      { name: "Rosa", hex: "#f6d3d6", images: ["official/a.jpg", "official/b.jpg"] },
      { name: "Sem foto", images: [] },
      { name: "", images: ["official/c.jpg"] },
    ]);
    expect(r.map((c) => c.name)).toEqual(["Rosa"]);
    expect(r[0]!.images).toHaveLength(2);
  });
  it("ignores invalid hex values", () => {
    expect(parsePhotoColors([{ name: "X", hex: "red", images: ["official/a.jpg"] }])[0]!.hex).toBeNull();
  });
});
