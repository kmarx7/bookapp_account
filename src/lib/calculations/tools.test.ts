import { describe, expect, it } from "vitest";
import { calcBEP } from "@/lib/calculations/bep";
import { classifyExpense, summarizeExpenses } from "@/lib/calculations/expenseReview";
import { analyzePayslip } from "@/lib/calculations/payslip";
import { summarizeFixedCosts } from "@/lib/calculations/fixedCosts";

describe("calcBEP", () => {
  it("computes break-even revenue and safety margin", () => {
    const result = calcBEP({
      fixedCost: 1_000_000,
      variableCost: 600_000,
      revenue: 2_000_000,
    });

    expect(result.contribution).toBe(1_400_000);
    expect(result.contributionRatio).toBeCloseTo(0.7, 6);
    expect(result.bepRevenue).toBeCloseTo(1_428_571.43, 1);
    expect(result.safetyMarginRatio).toBeCloseTo(0.2857, 3);
    expect(result.feasible).toBe(true);
  });

  it("is infeasible when variable cost exceeds revenue", () => {
    expect(
      calcBEP({ fixedCost: 100_000, variableCost: 2_000_000, revenue: 1_000_000 })
        .feasible,
    ).toBe(false);
  });
});

describe("analyzePayslip", () => {
  it("separates income, deductions and net pay", () => {
    const result = analyzePayslip([
      { id: "1", name: "기본급", amount: 3_000_000, kind: "income" },
      { id: "2", name: "식대", amount: 200_000, kind: "income" },
      { id: "3", name: "소득세", amount: 150_000, kind: "deduction" },
      { id: "4", name: "4대보험", amount: 250_000, kind: "deduction" },
    ]);

    expect(result.gross).toBe(3_200_000);
    expect(result.totalDeduction).toBe(400_000);
    expect(result.net).toBe(2_800_000);
    expect(result.optimizationCandidates[0].name).toBe("4대보험");
  });
});

describe("summarizeFixedCosts", () => {
  it("normalizes yearly costs to monthly", () => {
    const summary = summarizeFixedCosts([
      { id: "1", name: "넷플릭스", amount: 12_000, period: "monthly" },
      { id: "2", name: "보험", amount: 1_200_000, period: "yearly" },
      { id: "3", name: "헬스", amount: 50_000, period: "monthly", cancelCandidate: true },
    ]);

    expect(summary.monthlyTotal).toBe(162_000);
    expect(summary.annualTotal).toBe(1_944_000);
    expect(summary.cancelCandidates.map((c) => c.id)).toEqual(["3"]);
  });
});

describe("classifyExpense", () => {
  it("classifies by keyword", () => {
    expect(classifyExpense("적금 납입")).toBe("investment");
    expect(classifyExpense("휴대폰 통신비")).toBe("maintenance");
    expect(classifyExpense("점심 식비")).toBe("cost");
  });

  it("summarizes expenses by category", () => {
    const summary = summarizeExpenses([
      { id: "1", name: "식비", amount: 400_000, category: "cost" },
      { id: "2", name: "통신", amount: 60_000, category: "maintenance" },
      { id: "3", name: "학원", amount: 300_000, category: "investment" },
    ]);
    expect(summary.total).toBe(760_000);
    expect(summary.ratio.investment).toBeCloseTo(300_000 / 760_000, 6);
  });
});
