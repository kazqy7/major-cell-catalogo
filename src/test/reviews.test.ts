import { describe, expect, it } from "vitest";
import { reviewSchema, shownName, summarize, randomName } from "@/lib/reviews";

describe("store reviews", () => {
  it("accepts ratings 1-5 only", () => {
    expect(reviewSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 6 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 3.5 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 5 }).success).toBe(true);
  });
  it("shows Cliente anônimo without a name", () => {
    expect(shownName("")).toBe("Cliente anônimo");
    expect(shownName(null)).toBe("Cliente anônimo");
  });
  it("averages real ratings", () => {
    expect(summarize([{ rating: 5 }, { rating: 4 }])).toEqual({ count: 2, average: 4.5 });
    expect(summarize([])).toEqual({ count: 0, average: 0 });
  });
  it("random names fit the 40-char limit", () => {
    expect(randomName().length).toBeLessThanOrEqual(40);
  });
});
