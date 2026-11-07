import type { InvestmentItem } from "@/types";

export interface InvestmentSummary {
  totalCost: number;
  totalValue: number;
  gain: number;
  gainRate: number;
}

export function summarizeInvestments(
  items: InvestmentItem[],
): InvestmentSummary {
  const totalCost = items.reduce((acc, item) => acc + (item.cost || 0), 0);
  const totalValue = items.reduce(
    (acc, item) => acc + (item.marketValue || 0),
    0,
  );
  const gain = totalValue - totalCost;

  return {
    totalCost,
    totalValue,
    gain,
    gainRate: totalCost === 0 ? 0 : gain / totalCost,
  };
}
