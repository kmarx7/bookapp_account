export interface BepInput {
  fixedCost: number;
  variableCost: number;
  revenue: number;
}

export interface BepResult {
  contribution: number;
  contributionRatio: number;
  bepRevenue: number;
  safetyMargin: number;
  safetyMarginRatio: number;
  feasible: boolean;
}

export function calcBEP(input: BepInput): BepResult {
  const contribution = (input.revenue || 0) - (input.variableCost || 0);
  const contributionRatio =
    input.revenue === 0 ? 0 : contribution / input.revenue;

  const feasible = contributionRatio > 0;
  const bepRevenue = feasible
    ? (input.fixedCost || 0) / contributionRatio
    : Number.POSITIVE_INFINITY;
  const safetyMargin = input.revenue - bepRevenue;

  return {
    contribution,
    contributionRatio,
    bepRevenue,
    safetyMargin,
    safetyMarginRatio:
      input.revenue === 0 ? 0 : safetyMargin / input.revenue,
    feasible,
  };
}
