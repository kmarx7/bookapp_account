import type { ExpenseItem } from "@/types";

const INVESTMENT_KEYWORDS = [
  "투자",
  "주식",
  "적금",
  "예금",
  "학원",
  "교육",
  "책",
  "자격증",
  "세미나",
  "강의",
];

const MAINTENANCE_KEYWORDS = [
  "보험",
  "통신",
  "구독",
  "관리비",
  "유지",
  "수리",
  "정비",
  "렌탈",
  "수선",
];

export function classifyExpense(name: string): ExpenseItem["category"] {
  const target = name.toLowerCase();
  if (INVESTMENT_KEYWORDS.some((keyword) => target.includes(keyword))) {
    return "investment";
  }
  if (MAINTENANCE_KEYWORDS.some((keyword) => target.includes(keyword))) {
    return "maintenance";
  }
  return "cost";
}

export interface ExpenseSummary {
  total: number;
  byCategory: Record<ExpenseItem["category"], number>;
  ratio: Record<ExpenseItem["category"], number>;
}

export function summarizeExpenses(items: ExpenseItem[]): ExpenseSummary {
  const byCategory: Record<ExpenseItem["category"], number> = {
    cost: 0,
    maintenance: 0,
    investment: 0,
  };

  for (const item of items) {
    byCategory[item.category] += item.amount || 0;
  }

  const total = byCategory.cost + byCategory.maintenance + byCategory.investment;

  return {
    total,
    byCategory,
    ratio: {
      cost: total === 0 ? 0 : byCategory.cost / total,
      maintenance: total === 0 ? 0 : byCategory.maintenance / total,
      investment: total === 0 ? 0 : byCategory.investment / total,
    },
  };
}
