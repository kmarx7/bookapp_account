import { describe, expect, it } from "vitest";
import { calcBEP } from "@/lib/calculations/bep";
import {
  classifyExpense,
  expenseItemsFromStatement,
  resolveExpenseItems,
  summarizeExpenses,
} from "@/lib/calculations/expenseReview";
import { createIncomeStatement } from "@/lib/calculations/incomeStatement";
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

describe("expense review: 불러오기와 수동 분류", () => {
  it("expenseItemsFromStatement: 10만 원 이상 항목만 뽑는다", () => {
    const base = createIncomeStatement("u1", 2026, 11);
    const statement = {
      ...base,
      fixedCosts: { ...base.fixedCosts, rent: 500_000, communication: 60_000 },
      variableCosts: { ...base.variableCosts, food: 400_000 },
      investmentCosts: { ...base.investmentCosts, education: 100_000 },
    };

    const rows = expenseItemsFromStatement(statement);

    expect(rows.map((row) => row.name)).toEqual(["월세", "식비", "학원"]);
    expect(rows.find((row) => row.name === "월세")?.category).toBe("cost");
    expect(rows.find((row) => row.name === "학원")?.category).toBe("investment");
  });

  it("expenseItemsFromStatement: 임계값을 바꿀 수 있다", () => {
    const base = createIncomeStatement("u1", 2026, 11);
    const statement = {
      ...base,
      fixedCosts: { ...base.fixedCosts, communication: 60_000 },
    };

    expect(expenseItemsFromStatement(statement)).toHaveLength(0);
    expect(
      expenseItemsFromStatement(statement, 50_000).map((row) => row.name),
    ).toEqual(["통신"]);
  });

  it("resolveExpenseItems: 수동 분류가 자동 분류보다 우선한다", () => {
    const items = resolveExpenseItems([
      { id: "1", name: "적금 납입", amount: 300_000 },
      { id: "2", name: "적금 납입", amount: 100_000, category: "cost" },
    ]);

    expect(items[0].category).toBe("investment");
    expect(items[1].category).toBe("cost");
  });

  it("summarizeExpenses: 줄일 후보 합계를 계산한다", () => {
    const summary = summarizeExpenses([
      { id: "a", name: "구독", amount: 20_000, category: "maintenance", cutCandidate: true },
      { id: "b", name: "식비", amount: 300_000, category: "cost", cutCandidate: true },
      { id: "c", name: "학원", amount: 100_000, category: "investment" },
    ]);

    expect(summary.cut).toEqual({ count: 2, total: 320_000 });
    expect(summary.byCategory.cost).toBe(300_000);
  });
});
