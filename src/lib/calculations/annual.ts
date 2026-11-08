import type { AnnualTracking, BalanceSheet } from "@/types";
import { calcBalanceSheet } from "@/lib/calculations/balanceSheet";

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
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 재무상태표들을 연도별로 묶어 자산·부채 합계를 뽑는다.
 * 같은 연도에 여러 장이 있으면 기준일이 가장 늦은 장을 쓰고,
 * 비어 있는 장(자산·부채 0)과 잘못된 날짜는 건너뛴다.
 */
export function annualRowsFromBalanceSheets(
  sheets: BalanceSheet[],
): AnnualRow[] {
  const byYear = new Map<number, { time: number; row: AnnualRow }>();

  for (const sheet of sheets) {
    const time = Date.parse(sheet.baseDate);
    if (Number.isNaN(time)) continue;

    const totals = calcBalanceSheet(sheet);
    if (totals.totalAssets === 0 && totals.totalDebts === 0) continue;

    const year = new Date(time).getFullYear();
    const existing = byYear.get(year);
    if (existing && existing.time >= time) continue;

    byYear.set(year, {
      time,
      row: {
        year,
        totalAssets: totals.totalAssets,
        totalDebts: totals.totalDebts,
      },
    });
  }

  return [...byYear.values()]
    .map((entry) => entry.row)
    .sort((a, b) => a.year - b.year);
}
