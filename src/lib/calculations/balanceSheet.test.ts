import { describe, expect, it } from "vitest";
import { calcBalanceSheet } from "@/lib/calculations/balanceSheet";

describe("calcBalanceSheet", () => {
  it("computes equity and equity ratio", () => {
    const result = calcBalanceSheet({
      currentAssets: {
        cash: 1_000_000,
        savings: 5_000_000,
        stocks: 2_000_000,
        others: 300_000,
      },
      fixedAssets: { deposit: 10_000_000, pension: 3_000_000, others: 0 },
      debts: {
        studentLoan: 2_000_000,
        cardBalance: 500_000,
        overdraft: 0,
        otherLoans: 0,
      },
    });

    expect(result.totalAssets).toBe(21_300_000);
    expect(result.totalDebts).toBe(2_500_000);
    expect(result.equity).toBe(18_800_000);
    expect(result.equityRatio).toBeCloseTo(18_800_000 / 21_300_000, 6);
  });

  it("avoids division by zero when there are no assets", () => {
    const result = calcBalanceSheet({
      currentAssets: { cash: 0, savings: 0, stocks: 0, others: 0 },
      fixedAssets: { deposit: 0, pension: 0, others: 0 },
      debts: { studentLoan: 0, cardBalance: 0, overdraft: 0, otherLoans: 0 },
    });
    expect(result.equityRatio).toBe(0);
  });
});
