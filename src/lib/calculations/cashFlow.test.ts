import { describe, expect, it } from "vitest";
import { calcCashFlow } from "@/lib/calculations/cashFlow";

describe("calcCashFlow", () => {
  it("rolls beginning cash into ending cash", () => {
    const result = calcCashFlow({
      operating: { inflow: 3_200_000, outflow: 2_000_000 },
      investing: { inflow: 0, outflow: 500_000 },
      financing: { inflow: 0, outflow: 300_000 },
      beginningCash: 1_000_000,
    });

    expect(result.opNet).toBe(1_200_000);
    expect(result.invNet).toBe(-500_000);
    expect(result.finNet).toBe(-300_000);
    expect(result.netIncrease).toBe(400_000);
    expect(result.endingCash).toBe(1_400_000);
  });
});
