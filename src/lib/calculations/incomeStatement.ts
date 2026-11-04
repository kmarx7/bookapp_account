import type {
  FixedCosts,
  IncomeStatement,
  InvestmentCosts,
  VariableCosts,
} from "@/types";
import {
  DEFAULT_FIXED_COSTS,
  DEFAULT_INVESTMENT_COSTS,
  DEFAULT_VARIABLE_COSTS,
} from "@/lib/constants";

export interface IncomeStatementInput {
  salaryNet: number;
  otherIncome: number;
  fixedCosts: FixedCosts;
  variableCosts: VariableCosts;
  investmentCosts: InvestmentCosts;
}

export interface IncomeStatementComputed {
  grossProfit: number;
  fixedTotal: number;
  variableTotal: number;
  investmentTotal: number;
  totalExpenses: number;
  operatingIncome: number;
}

export function sumValues<T extends object>(source: T): number {
  return Object.values(source).reduce<number>(
    (acc, value) => acc + (typeof value === "number" ? value : 0),
    0,
  );
}

export function calcIncomeStatement(
  input: IncomeStatementInput,
): IncomeStatementComputed {
  const grossProfit = (input.salaryNet || 0) + (input.otherIncome || 0);
  const fixedTotal = sumValues(input.fixedCosts);
  const variableTotal = sumValues(input.variableCosts);
  const investmentTotal = sumValues(input.investmentCosts);
  const totalExpenses = fixedTotal + variableTotal + investmentTotal;

  return {
    grossProfit,
    fixedTotal,
    variableTotal,
    investmentTotal,
    totalExpenses,
    operatingIncome: grossProfit - totalExpenses,
  };
}

export function createIncomeStatement(
  userId: string,
  year: number,
  month: number,
): IncomeStatement {
  return {
    id: `${year}-${String(month).padStart(2, "0")}`,
    userId,
    year,
    month,
    salaryNet: 0,
    otherIncome: 0,
    fixedCosts: { ...DEFAULT_FIXED_COSTS },
    variableCosts: { ...DEFAULT_VARIABLE_COSTS },
    investmentCosts: { ...DEFAULT_INVESTMENT_COSTS },
    capitalAllocation: {
      savings: 0,
      investment: 0,
      debtRepayment: 0,
      remaining: 0,
    },
    updatedAt: new Date().toISOString(),
  };
}
