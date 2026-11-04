import type { Debt } from "@/types";

export interface PayoffResult {
  feasible: boolean;
  months: number;
  payoffDate: string;
  totalInterest: number;
  baselineInterest: number;
  interestSaved: number;
}

const MAX_MONTHS = 1200;

function runPayoff(
  balance: number,
  monthlyRate: number,
  payment: number,
): { feasible: boolean; months: number; totalInterest: number } {
  if (balance <= 0) return { feasible: true, months: 0, totalInterest: 0 };
  if (payment <= 0) return { feasible: false, months: 0, totalInterest: 0 };

  let remaining = balance;
  let totalInterest = 0;
  let months = 0;

  while (remaining > 0 && months < MAX_MONTHS) {
    const interest = remaining * monthlyRate;
    const principal = payment - interest;
    if (principal <= 0) {
      return { feasible: false, months: 0, totalInterest: 0 };
    }
    totalInterest += interest;
    remaining = Math.max(0, remaining - principal);
    months += 1;
  }

  return { feasible: months < MAX_MONTHS, months, totalInterest };
}

export function sortDebtsByRate(debts: Debt[]): Debt[] {
  return [...debts].sort((a, b) => b.annualRate - a.annualRate);
}

export function simulatePayoff(debt: Debt, extraMonthly = 0): PayoffResult {
  const monthlyRate = (debt.annualRate || 0) / 100 / 12;
  const base = runPayoff(debt.balance, monthlyRate, debt.monthlyPayment);
  const accelerated = runPayoff(
    debt.balance,
    monthlyRate,
    debt.monthlyPayment + (extraMonthly || 0),
  );

  const payoffDate = new Date();
  if (accelerated.feasible) {
    payoffDate.setMonth(payoffDate.getMonth() + accelerated.months);
  }

  return {
    feasible: accelerated.feasible,
    months: accelerated.months,
    payoffDate: payoffDate.toISOString(),
    totalInterest: accelerated.totalInterest,
    baselineInterest: base.totalInterest,
    interestSaved: Math.max(0, base.totalInterest - accelerated.totalInterest),
  };
}
