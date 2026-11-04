import type {
  BalanceSheet,
  CurrentAssets,
  DebtsBreakdown,
  FixedAssets,
} from "@/types";
import { sumValues } from "@/lib/calculations/incomeStatement";

export interface BalanceSheetInput {
  currentAssets: CurrentAssets;
  fixedAssets: FixedAssets;
  debts: DebtsBreakdown;
}

export interface BalanceSheetComputed {
  totalCurrentAssets: number;
  totalFixedAssets: number;
  totalAssets: number;
  totalDebts: number;
  equity: number;
  equityRatio: number;
}

export function calcBalanceSheet(
  input: BalanceSheetInput,
): BalanceSheetComputed {
  const totalCurrentAssets = sumValues(input.currentAssets);
  const totalFixedAssets = sumValues(input.fixedAssets);
  const totalAssets = totalCurrentAssets + totalFixedAssets;
  const totalDebts = sumValues(input.debts);
  const equity = totalAssets - totalDebts;

  return {
    totalCurrentAssets,
    totalFixedAssets,
    totalAssets,
    totalDebts,
    equity,
    equityRatio: totalAssets === 0 ? 0 : equity / totalAssets,
  };
}

export function createBalanceSheet(userId: string): BalanceSheet {
  return {
    id: crypto.randomUUID(),
    userId,
    baseDate: new Date().toISOString(),
    currentAssets: { cash: 0, savings: 0, stocks: 0, others: 0 },
    fixedAssets: { deposit: 0, pension: 0, others: 0 },
    debts: { studentLoan: 0, cardBalance: 0, overdraft: 0, otherLoans: 0 },
    updatedAt: new Date().toISOString(),
  };
}
