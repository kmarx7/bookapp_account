import type { AnnualTracking } from "@/types";

export interface AnnualRow {
  year: number;
  totalAssets: number;
  totalDebts: number;
}

export interface AnnualComputed extends AnnualRow {
  equity: number;
  growthRate: number;
}

export function equityOf(row: AnnualRow): number {
  return (row.totalAssets || 0) - (row.totalDebts || 0);
}

export function calcAnnualGrowth(rows: AnnualRow[]): AnnualComputed[] {
  const sorted = [...rows].sort((a, b) => a.year - b.year);

  return sorted.map((row, index) => {
    const equity = equityOf(row);
    if (index === 0) {
      return { ...row, equity, growthRate: 0 };
    }
    const prevEquity = equityOf(sorted[index - 1]);
    const growthRate =
      prevEquity === 0 ? 0 : (equity - prevEquity) / Math.abs(prevEquity);
    return { ...row, equity, growthRate };
  });
}

export function createAnnualTracking(
  userId: string,
  year: number,
): AnnualTracking {
  return {
    id: String(year),
    userId,
    year,
    totalAssets: 0,
    totalDebts: 0,
    auditOpinion: null,
  };
}
