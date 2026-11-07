import type { InsuranceItem } from "@/types";

export interface InsuranceSummary {
  monthlyCost: number;
  monthlyAsset: number;
  annualCost: number;
  annualAsset: number;
  surrenderValue: number;
}

export function summarizeInsurance(items: InsuranceItem[]): InsuranceSummary {
  let monthlyCost = 0;
  let monthlyAsset = 0;
  let surrenderValue = 0;

  for (const item of items) {
    const premium = item.monthlyPremium || 0;
    const savings =
      item.kind === "protection"
        ? 0
        : Math.min(item.savingsMonthly || 0, premium);
    monthlyAsset += savings;
    monthlyCost += premium - savings;
    surrenderValue += item.surrenderValue || 0;
  }

  return {
    monthlyCost,
    monthlyAsset,
    annualCost: monthlyCost * 12,
    annualAsset: monthlyAsset * 12,
    surrenderValue,
  };
}
