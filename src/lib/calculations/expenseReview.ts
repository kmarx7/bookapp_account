import type {
  ExpenseCategory,
  ExpenseDraft,
  ExpenseItem,
  IncomeStatement,
} from "@/types";

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

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "cost",
  "maintenance",
  "investment",
];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  cost: "비용",
  maintenance: "유지보수비",
  investment: "투자",
};

export function classifyExpense(name: string): ExpenseCategory {
  const target = name.toLowerCase();
  if (INVESTMENT_KEYWORDS.some((keyword) => target.includes(keyword))) {
    return "investment";
  }
  if (MAINTENANCE_KEYWORDS.some((keyword) => target.includes(keyword))) {
    return "maintenance";
  }
  return "cost";
}

/** 저장된 초안을 표시용 항목으로 바꾼다. 수동 분류가 있으면 그것을 우선한다. */
export function resolveExpenseItems(drafts: ExpenseDraft[]): ExpenseItem[] {
  return drafts.map((draft) => ({
    ...draft,
    category: draft.category ?? classifyExpense(draft.name),
  }));
}

export interface ExpenseImportRow {
  name: string;
  amount: number;
  category: ExpenseCategory;
}

/**
 * 손익계산서의 지출을 "항목 + 금액"으로 펼친다.
 * 책의 실습(지난달 지출 중 10만 원 이상)에 맞춰 기본 임계값은 100,000원이다.
 */
export function expenseItemsFromStatement(
  statement: IncomeStatement,
  threshold = 100_000,
): ExpenseImportRow[] {
  const rows: ExpenseImportRow[] = [
    { name: "월세", amount: statement.fixedCosts.rent, category: "cost" },
    {
      name: "관리비",
      amount: statement.fixedCosts.managementFee,
      category: "maintenance",
    },
    {
      name: "통신",
      amount: statement.fixedCosts.communication,
      category: "maintenance",
    },
    {
      name: "보험",
      amount: statement.fixedCosts.insurance,
      category: "maintenance",
    },
    {
      name: "구독",
      amount: statement.fixedCosts.subscriptions,
      category: "maintenance",
    },
    { name: "할부", amount: statement.fixedCosts.installment, category: "cost" },
    { name: "식비", amount: statement.variableCosts.food, category: "cost" },
    { name: "교통", amount: statement.variableCosts.transport, category: "cost" },
    { name: "쇼핑", amount: statement.variableCosts.shopping, category: "cost" },
    { name: "여가", amount: statement.variableCosts.leisure, category: "cost" },
    {
      name: "학원",
      amount: statement.investmentCosts.education,
      category: "investment",
    },
    { name: "책", amount: statement.investmentCosts.books, category: "investment" },
    {
      name: "사람",
      amount: statement.investmentCosts.people,
      category: "investment",
    },
  ];

  return rows.filter((row) => (row.amount || 0) >= threshold);
}

export interface ExpenseSummary {
  total: number;
  byCategory: Record<ExpenseCategory, number>;
  ratio: Record<ExpenseCategory, number>;
  cut: { count: number; total: number };
}

export function summarizeExpenses(items: ExpenseItem[]): ExpenseSummary {
  const byCategory: Record<ExpenseCategory, number> = {
    cost: 0,
    maintenance: 0,
    investment: 0,
  };
  let cutTotal = 0;
  let cutCount = 0;

  for (const item of items) {
    byCategory[item.category] += item.amount || 0;
    if (item.cutCandidate && (item.amount || 0) > 0) {
      cutTotal += item.amount;
      cutCount += 1;
    }
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
    cut: { count: cutCount, total: cutTotal },
  };
}
