import { beforeEach, describe, expect, it } from "vitest";
import { selectIncomeStatement, useAppStore } from "@/store/useAppStore";
import { createIncomeStatement } from "@/lib/calculations/incomeStatement";
import { toAppData } from "@/lib/storage/schema";
import type { Debt, User } from "@/types";

const user: User = {
  id: "u1",
  nickname: "이모 대표",
  foundedAt: "2026-01-01",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  useAppStore.getState().resetAll();
});

describe("useAppStore", () => {
  it("selects income statements by year and month", () => {
    useAppStore.getState().setUser(user);
    useAppStore.getState().upsertIncomeStatement(createIncomeStatement("u1", 2026, 3));

    const found = selectIncomeStatement(useAppStore.getState(), 2026, 3);
    expect(found).toBeDefined();
    expect(found?.month).toBe(3);
  });

  it("updates an existing record instead of duplicating it", () => {
    const base = createIncomeStatement("u1", 2026, 3);
    useAppStore.getState().upsertIncomeStatement({ ...base, salaryNet: 1_000 });
    useAppStore.getState().upsertIncomeStatement({ ...base, salaryNet: 2_000 });

    expect(useAppStore.getState().incomeStatements).toHaveLength(1);
    expect(selectIncomeStatement(useAppStore.getState(), 2026, 3)?.salaryNet).toBe(2_000);
  });

  it("adds, updates and removes debts", () => {
    const debt: Debt = {
      id: "d1",
      userId: "u1",
      name: "학자금",
      balance: 1_000,
      annualRate: 5,
      monthlyPayment: 100,
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    useAppStore.getState().addDebt(debt);
    useAppStore.getState().updateDebt("d1", { balance: 500 });
    expect(useAppStore.getState().debts[0].balance).toBe(500);

    useAppStore.getState().removeDebt("d1");
    expect(useAppStore.getState().debts).toHaveLength(0);
  });

  it("exports only data fields through toAppData", () => {
    const keys = Object.keys(toAppData(useAppStore.getState())).sort();
    expect(keys).toEqual([
      "annualTrackings",
      "balanceSheets",
      "cashFlows",
      "courseProgress",
      "debts",
      "incomeStatements",
      "schemaVersion",
      "user",
    ]);
  });

  it("clears data on resetAll", () => {
    useAppStore.getState().setUser(user);
    useAppStore.getState().resetAll();
    expect(useAppStore.getState().user).toBeNull();
  });
});
