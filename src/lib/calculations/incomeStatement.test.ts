import { describe, expect, it } from "vitest";
import { calcIncomeStatement } from "@/lib/calculations/incomeStatement";

const sample = {
  salaryNet: 3_000_000,
  otherIncome: 200_000,
  fixedCosts: {
    rent: 600_000,
    managementFee: 100_000,
    communication: 50_000,
    insurance: 30_000,
    subscriptions: 20_000,
    installment: 0,
  },
  variableCosts: {
    food: 400_000,
    transport: 100_000,
    shopping: 150_000,
    leisure: 50_000,
  },
  investmentCosts: { education: 0, books: 20_000, people: 30_000 },
};

describe("calcIncomeStatement", () => {
  it("computes gross profit and operating income", () => {
    const result = calcIncomeStatement(sample);
    expect(result.grossProfit).toBe(3_200_000);
    expect(result.fixedTotal).toBe(800_000);
    expect(result.variableTotal).toBe(700_000);
    expect(result.investmentTotal).toBe(50_000);
    expect(result.totalExpenses).toBe(1_550_000);
    expect(result.operatingIncome).toBe(1_650_000);
  });

  it("returns negative operating income when expenses exceed revenue", () => {
    const result = calcIncomeStatement({
      ...sample,
      salaryNet: 100_000,
      otherIncome: 0,
    });
    expect(result.operatingIncome).toBeLessThan(0);
  });
});
