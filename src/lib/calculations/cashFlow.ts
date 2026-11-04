import type { CashFlow, CashFlowSection } from "@/types";

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
