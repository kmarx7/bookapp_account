import { describe, expect, it } from "vitest";
import { debtsFromBalanceSheet } from "@/lib/calculations/debt";
import { cashFlowSectionsFromIncomeStatement } from "@/lib/calculations/cashFlow";
import { createIncomeStatement } from "@/lib/calculations/incomeStatement";
import type { BalanceSheet } from "@/types";

function sheet(overrides: Partial<BalanceSheet> = {}): BalanceSheet {
  return {
    id: "b1",
    userId: "u1",
    baseDate: "2026-12-31T00:00:00.000Z",
    currentAssets: { cash: 0, savings: 0, stocks: 0, others: 0 },
    fixedAssets: { deposit: 0, pension: 0, others: 0 },
    debts: { studentLoan: 0, cardBalance: 0, overdraft: 0, otherLoans: 0 },
    updatedAt: "2026-12-31T00:00:00.000Z",
    ...overrides,
  };
}

describe("debtsFromBalanceSheet", () => {
  it("부채 칸을 이름 있는 항목으로 바꾸고 0원은 뺀다", () => {
    const rows = debtsFromBalanceSheet(
      sheet({
        debts: {
          studentLoan: 5_000_000,
          cardBalance: 0,
          overdraft: 500_000,
          otherLoans: 1_000_000,
        },
      }),
    );

    expect(rows).toEqual([
      { name: "학자금", balance: 5_000_000 },
      { name: "마이너스 통장", balance: 500_000 },
      { name: "기타 대출", balance: 1_000_000 },
    ]);
  });

  it("부채가 없으면 빈 배열", () => {
    expect(debtsFromBalanceSheet(sheet())).toEqual([]);
  });
});

describe("cashFlowSectionsFromIncomeStatement", () => {
  it("생활비는 영업, 학원·적립·투자는 투자, 부채 상환은 재무로 옮긴다", () => {
    const base = createIncomeStatement("u1", 2026, 11);
    const statement = {
      ...base,
      salaryNet: 3_000_000,
      otherIncome: 200_000,
      fixedCosts: { ...base.fixedCosts, rent: 500_000 },
      variableCosts: { ...base.variableCosts, food: 300_000 },
      investmentCosts: { ...base.investmentCosts, education: 100_000 },
      capitalAllocation: {
        savings: 200_000,
        investment: 100_000,
        debtRepayment: 400_000,
        remaining: 0,
      },
    };

    const imported = cashFlowSectionsFromIncomeStatement(statement);

    expect(imported.operating).toEqual({ inflow: 3_200_000, outflow: 800_000 });
    expect(imported.investingOutflow).toBe(400_000);
    expect(imported.financingOutflow).toBe(400_000);
  });
});
