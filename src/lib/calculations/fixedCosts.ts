import type { FixedCostItem } from "@/types";

export interface FixedCostSummary {
  monthlyTotal: number;
  annualTotal: number;
  cancelCandidates: FixedCostItem[];
}

export function monthlyAmount(item: FixedCostItem): number {
  return item.period === "yearly" ? (item.amount || 0) / 12 : item.amount || 0;
}

export function summarizeFixedCosts(items: FixedCostItem[]): FixedCostSummary {
  const monthlyTotal = items.reduce(
    (acc, item) => acc + monthlyAmount(item),
    0,
  );

  return {
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    cancelCandidates: items.filter((item) => item.cancelCandidate),
  };
}
