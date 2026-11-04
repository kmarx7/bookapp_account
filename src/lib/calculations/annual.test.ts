import { describe, expect, it } from "vitest";
import { calcAnnualGrowth } from "@/lib/calculations/annual";

describe("calcAnnualGrowth", () => {
  it("computes year-over-year equity growth", () => {
    const rows = calcAnnualGrowth([
      { year: 2025, totalAssets: 14_000_000, totalDebts: 2_000_000 },
      { year: 2024, totalAssets: 10_000_000, totalDebts: 2_000_000 },
    ]);

    expect(rows.map((r) => r.year)).toEqual([2024, 2025]);
    expect(rows[0].equity).toBe(8_000_000);
    expect(rows[0].growthRate).toBe(0);
    expect(rows[1].equity).toBe(12_000_000);
    expect(rows[1].growthRate).toBeCloseTo(0.5, 6);
  });
});
