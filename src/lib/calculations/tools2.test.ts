import { describe, expect, it } from "vitest";
import { summarizeInsurance } from "@/lib/calculations/insurance";
import { summarizeInvestments } from "@/lib/calculations/investments";
import { refundEffect } from "@/lib/calculations/taxRefund";
import type { InsuranceItem, InvestmentItem } from "@/types";

describe("summarizeInsurance", () => {
  it("splits premium into cost and asset portions", () => {
    const items: InsuranceItem[] = [
      {
        id: "1",
        name: "실손",
        monthlyPremium: 70_000,
        kind: "protection",
        savingsMonthly: 0,
      },
      {
        id: "2",
        name: "종신",
        monthlyPremium: 180_000,
        kind: "mixed",
        savingsMonthly: 150_000,
        surrenderValue: 12_000_000,
      },
    ];

    const summary = summarizeInsurance(items);
    expect(summary.monthlyCost).toBe(100_000);
    expect(summary.monthlyAsset).toBe(150_000);
    expect(summary.annualCost).toBe(1_200_000);
    expect(summary.surrenderValue).toBe(12_000_000);
  });

  it("never lets savings exceed the premium", () => {
    const summary = summarizeInsurance([
      {
        id: "1",
        name: "저축",
        monthlyPremium: 100_000,
        kind: "savings",
        savingsMonthly: 300_000,
      },
    ]);
    expect(summary.monthlyCost).toBe(0);
    expect(summary.monthlyAsset).toBe(100_000);
  });
});

describe("summarizeInvestments", () => {
  it("computes valuation gain and rate", () => {
    const items: InvestmentItem[] = [
      { id: "1", name: "삼성전자", cost: 2_000_000, marketValue: 2_400_000 },
      { id: "2", name: "코인", cost: 500_000, marketValue: 300_000 },
    ];

    const summary = summarizeInvestments(items);
    expect(summary.totalCost).toBe(2_500_000);
    expect(summary.totalValue).toBe(2_700_000);
    expect(summary.gain).toBe(200_000);
    expect(summary.gainRate).toBeCloseTo(0.08, 6);
  });

  it("avoids division by zero", () => {
    expect(summarizeInvestments([]).gainRate).toBe(0);
  });
});

describe("refundEffect", () => {
  it("turns an asset/debt use into equity growth", () => {
    expect(refundEffect(600_000, "asset").equityDelta).toBe(600_000);
    expect(refundEffect(600_000, "debt").equityDelta).toBe(600_000);
    expect(refundEffect(600_000, "spend").equityDelta).toBe(0);
  });
});
