import { describe, expect, it } from "vitest";
import {
  annualRowsFromBalanceSheets,
  calcAnnualGrowth,
} from "@/lib/calculations/annual";
import type { BalanceSheet } from "@/types";

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

describe("annualRowsFromBalanceSheets", () => {
  function sheet(overrides: Partial<BalanceSheet>): BalanceSheet {
    return {
      id: crypto.randomUUID(),
      userId: "u1",
      baseDate: "2025-12-31T00:00:00.000Z",
      currentAssets: { cash: 0, savings: 0, stocks: 0, others: 0 },
      fixedAssets: { deposit: 0, pension: 0, others: 0 },
      debts: { studentLoan: 0, cardBalance: 0, overdraft: 0, otherLoans: 0 },
      updatedAt: "2025-12-31T00:00:00.000Z",
      ...overrides,
    };
  }

  it("연도별로 기준일이 가장 늦은 재무상태표를 쓴다", () => {
    const rows = annualRowsFromBalanceSheets([
      sheet({
        baseDate: "2025-06-30T00:00:00.000Z",
        currentAssets: { cash: 1_000_000, savings: 0, stocks: 0, others: 0 },
      }),
      sheet({
        baseDate: "2025-12-31T00:00:00.000Z",
        currentAssets: { cash: 5_000_000, savings: 0, stocks: 0, others: 0 },
        debts: { studentLoan: 2_000_000, cardBalance: 0, overdraft: 0, otherLoans: 0 },
      }),
      sheet({
        baseDate: "2026-12-31T00:00:00.000Z",
        fixedAssets: { deposit: 3_000_000, pension: 0, others: 0 },
      }),
    ]);

    expect(rows).toEqual([
      { year: 2025, totalAssets: 5_000_000, totalDebts: 2_000_000 },
      { year: 2026, totalAssets: 3_000_000, totalDebts: 0 },
    ]);
  });

  it("빈 재무상태표와 잘못된 날짜는 건너뛴다", () => {
    const rows = annualRowsFromBalanceSheets([
      sheet({}),
      sheet({
        baseDate: "not-a-date",
        currentAssets: { cash: 1, savings: 0, stocks: 0, others: 0 },
      }),
    ]);

    expect(rows).toEqual([]);
  });
});
