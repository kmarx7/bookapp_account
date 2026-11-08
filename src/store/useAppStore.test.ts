import { beforeEach, describe, expect, it } from "vitest";
import { selectIncomeStatement, useAppStore } from "@/store/useAppStore";
import { createIncomeStatement } from "@/lib/calculations/incomeStatement";
import { createDefaultAppData, toAppData } from "@/lib/storage/schema";
import type { Debt, User } from "@/types";

const user: User = {
  id: "u1",
  nickname: "이모 대표",
  foundedAt: "2026-01-01",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  useAppStore.setState({ ...createDefaultAppData(), hydrated: true });
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
      "tools",
      "user",
    ]);
  });

  it("tracks the course practice focus without persisting it", () => {
    useAppStore.getState().setCourseFocus("ch02");
    expect(useAppStore.getState().courseFocus).toBe("ch02");
    expect(Object.keys(toAppData(useAppStore.getState()))).not.toContain(
      "courseFocus",
    );
    useAppStore.getState().setCourseFocus(null);
    expect(useAppStore.getState().courseFocus).toBeNull();
  });

  it("resets financial data while keeping the representative profile", () => {
    useAppStore.getState().setUser(user);
    useAppStore.getState().addDebt({
      id: "d9",
      userId: "u1",
      name: "카드론",
      balance: 1_000,
      annualRate: 0,
      monthlyPayment: 0,
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    useAppStore.getState().setStepComplete("step-1", true);

    useAppStore.getState().resetFinancialData();

    const state = useAppStore.getState();
    expect(state.debts).toHaveLength(0);
    expect(state.courseProgress.completedSteps).toEqual([]);
    expect(state.user?.nickname).toBe("이모 대표");
  });
});

describe("clearStepData", () => {
  it("clears only the income statements and unmarks the step", () => {
    useAppStore.getState().setUser(user);
    useAppStore.getState().upsertIncomeStatement(createIncomeStatement("u1", 2026, 11));
    useAppStore.getState().addDebt({
      id: "d1",
      userId: "u1",
      name: "카드",
      balance: 100,
      annualRate: 0,
      monthlyPayment: 0,
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    useAppStore.getState().setStepComplete("ch02", true);

    useAppStore.getState().clearStepData("ch02", "incomeStatements");

    const state = useAppStore.getState();
    expect(state.incomeStatements).toHaveLength(0);
    expect(state.debts).toHaveLength(1);
    expect(state.user?.nickname).toBe("이모 대표");
    expect(state.courseProgress.completedSteps).not.toContain("ch02");
  });

  it("clears only the targeted tool", () => {
    useAppStore.getState().updateTool("fixedCosts", [
      { id: "f", name: "구독", amount: 12_000, period: "monthly" },
    ]);
    useAppStore.getState().updateTool("payslip", [
      { id: "p", name: "기본급", amount: 3_000_000, kind: "income" },
    ]);

    useAppStore.getState().clearStepData("ch05", "tools.fixedCosts");

    const state = useAppStore.getState();
    expect(state.tools.fixedCosts.every((item) => item.amount === 0)).toBe(true);
    expect(state.tools.payslip.some((item) => item.amount > 0)).toBe(true);
  });

  it("only unmarks the manual step", () => {
    useAppStore.getState().setStepComplete("ch08", true);
    useAppStore.getState().clearStepData("ch08", "manual");
    expect(useAppStore.getState().courseProgress.completedSteps).not.toContain(
      "ch08",
    );
  });
});
