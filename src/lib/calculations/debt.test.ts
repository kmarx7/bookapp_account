import { describe, expect, it } from "vitest";
import { simulatePayoff, sortDebtsByRate } from "@/lib/calculations/debt";
import type { Debt } from "@/types";

const debt = (overrides: Partial<Debt>): Debt => ({
  id: overrides.id ?? "d",
  userId: "u",
  name: overrides.name ?? "부채",
  balance: overrides.balance ?? 1_000_000,
  annualRate: overrides.annualRate ?? 12,
  monthlyPayment: overrides.monthlyPayment ?? 100_000,
});

describe("sortDebtsByRate", () => {
  it("sorts by interest rate descending without mutating input", () => {
    const input = [
      debt({ id: "a", annualRate: 5 }),
      debt({ id: "b", annualRate: 20 }),
      debt({ id: "c", annualRate: 1 }),
    ];
    const sorted = sortDebtsByRate(input);
    expect(sorted.map((d) => d.id)).toEqual(["b", "a", "c"]);
    expect(input.map((d) => d.id)).toEqual(["a", "b", "c"]);
  });
});

describe("simulatePayoff", () => {
  it("returns immediately for a cleared balance", () => {
    const result = simulatePayoff(debt({ balance: 0 }));
    expect(result.months).toBe(0);
    expect(result.totalInterest).toBe(0);
  });

  it("flags infeasible debt when payment does not cover interest", () => {
    const result = simulatePayoff(
      debt({ balance: 1_000_000, annualRate: 24, monthlyPayment: 10_000 }),
    );
    expect(result.feasible).toBe(false);
  });

  it("shortens payoff and saves interest with extra payments", () => {
    const loan = debt({ balance: 5_000_000, annualRate: 8, monthlyPayment: 300_000 });
    const base = simulatePayoff(loan, 0);
    const accelerated = simulatePayoff(loan, 200_000);

    expect(accelerated.feasible).toBe(true);
    expect(accelerated.months).toBeLessThan(base.months);
    expect(accelerated.interestSaved).toBeGreaterThan(0);
  });
});
