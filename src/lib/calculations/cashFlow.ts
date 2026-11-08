import type { CashFlow, CashFlowSection, IncomeStatement } from "@/types";
import { calcIncomeStatement } from "@/lib/calculations/incomeStatement";

export interface CashFlowInput {
  operating: CashFlowSection;
  investing: CashFlowSection;
  financing: CashFlowSection;
  beginningCash: number;
}

export interface CashFlowComputed {
  opNet: number;
  invNet: number;
  finNet: number;
  netIncrease: number;
  endingCash: number;
}

export function sectionNet(section: CashFlowSection): number {
  return (section.inflow || 0) - (section.outflow || 0);
}

export function calcCashFlow(input: CashFlowInput): CashFlowComputed {
  const opNet = sectionNet(input.operating);
  const invNet = sectionNet(input.investing);
  const finNet = sectionNet(input.financing);
  const netIncrease = opNet + invNet + finNet;

  return {
    opNet,
    invNet,
    finNet,
    netIncrease,
    endingCash: (input.beginningCash || 0) + netIncrease,
  };
}

export function createCashFlow(
  userId: string,
  year: number,
  month: number,
): CashFlow {
  return {
    id: `${year}-${String(month).padStart(2, "0")}`,
    userId,
    year,
    month,
    operating: { inflow: 0, outflow: 0 },
    investing: { inflow: 0, outflow: 0 },
    financing: { inflow: 0, outflow: 0 },
    beginningCash: 0,
    updatedAt: new Date().toISOString(),
  };
}

export interface CashFlowImport {
  operating: CashFlowSection;
  investingOutflow: number;
  financingOutflow: number;
}

/**
 * 손익계산서 한 달치를 현금흐름 세 활동으로 옮긴다.
 * 생활비(고정+변동)는 영업, 학원·적립·투자로 나간 돈은 투자, 부채 상환은 재무로 본다.
 * 투자·재무의 "유입"은 손익계산서로 알 수 없으므로 건드리지 않는다.
 */
export function cashFlowSectionsFromIncomeStatement(
  statement: IncomeStatement,
): CashFlowImport {
  const income = calcIncomeStatement(statement);
  const allocation = statement.capitalAllocation ?? {
    savings: 0,
    investment: 0,
    debtRepayment: 0,
    remaining: 0,
  };

  return {
    operating: {
      inflow: (statement.salaryNet || 0) + (statement.otherIncome || 0),
      outflow: income.fixedTotal + income.variableTotal,
    },
    investingOutflow:
      income.investmentTotal +
      (allocation.savings || 0) +
      (allocation.investment || 0),
    financingOutflow: allocation.debtRepayment || 0,
  };
}
