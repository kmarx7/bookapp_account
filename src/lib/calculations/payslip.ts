import type { PayslipItem } from "@/types";

export interface PayslipLine {
  id: string;
  name: string;
  amount: number;
  ratio: number;
}

export interface PayslipAnalysis {
  gross: number;
  totalDeduction: number;
  net: number;
  deductionRatio: number;
  deductions: PayslipLine[];
  optimizationCandidates: PayslipLine[];
}

export function analyzePayslip(items: PayslipItem[]): PayslipAnalysis {
  const income = items.filter((item) => item.kind === "income");
  const deductions = items.filter((item) => item.kind === "deduction");

  const gross = income.reduce((acc, item) => acc + (item.amount || 0), 0);
  const totalDeduction = deductions.reduce(
    (acc, item) => acc + (item.amount || 0),
    0,
  );

  const lines: PayslipLine[] = deductions
    .map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount || 0,
      ratio: totalDeduction === 0 ? 0 : (item.amount || 0) / totalDeduction,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    gross,
    totalDeduction,
    net: gross - totalDeduction,
    deductionRatio: gross === 0 ? 0 : totalDeduction / gross,
    deductions: lines,
    optimizationCandidates: lines.slice(0, 3),
  };
}
