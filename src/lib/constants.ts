import type {
  AuditOpinion,
  CapitalAllocation,
  CurrentAssets,
  DebtsBreakdown,
  FixedAssets,
  FixedCostItem,
  FixedCosts,
  InvestmentCosts,
  VariableCosts,
} from "@/types";

export const SCHEMA_VERSION = 5;
export const STORAGE_KEY = "bookapp-account";

export const FIXED_COST_LABELS: Record<keyof FixedCosts, string> = {
  rent: "월세",
  managementFee: "관리비",
  communication: "통신",
  insurance: "보험",
  subscriptions: "구독",
  installment: "할부",
};

export const VARIABLE_COST_LABELS: Record<keyof VariableCosts, string> = {
  food: "식비",
  transport: "교통",
  shopping: "쇼핑",
  leisure: "여가",
};

export const INVESTMENT_COST_LABELS: Record<keyof InvestmentCosts, string> = {
  education: "학원",
  books: "책",
  people: "사람",
};

export const CAPITAL_LABELS: Record<keyof CapitalAllocation, string> = {
  savings: "적금",
  investment: "투자",
  debtRepayment: "부채상환",
  remaining: "생활비 잔여",
};

export const CURRENT_ASSET_LABELS: Record<keyof CurrentAssets, string> = {
  cash: "통장 잔고",
  savings: "적금/예금",
  stocks: "주식/코인",
  others: "중고 물품 등",
};

export const FIXED_ASSET_LABELS: Record<keyof FixedAssets, string> = {
  deposit: "전세/보증금",
  pension: "퇴직연금",
  others: "기타 자산",
};

export const DEBT_LABELS: Record<keyof DebtsBreakdown, string> = {
  studentLoan: "학자금",
  cardBalance: "카드 잔액",
  overdraft: "마이너스 통장",
  otherLoans: "기타 대출",
};

export const AUDIT_OPINION_LABELS: Record<AuditOpinion, string> = {
  adequate: "적정",
  qualified: "한정",
  adverse: "부정",
  disclaimer: "의견거절",
};

export const DEFAULT_FIXED_COSTS: FixedCosts = {
  rent: 0,
  managementFee: 0,
  communication: 0,
  insurance: 0,
  subscriptions: 0,
  installment: 0,
};

export const DEFAULT_VARIABLE_COSTS: VariableCosts = {
  food: 0,
  transport: 0,
  shopping: 0,
  leisure: 0,
};

export const DEFAULT_INVESTMENT_COSTS: InvestmentCosts = {
  education: 0,
  books: 0,
  people: 0,
};

export const TOOL_NAMES = {
  bep: "손익분기점 계산기",
  payslip: "명세서 감사 도구",
  fixedCosts: "고정비 결산",
  expenseReview: "지출 감정평가",
  insurance: "보험 회계 분류",
  investments: "투자 포트폴리오",
  taxRefund: "연말정산 시뮬레이션",
} as const;

export const FIXED_COST_PERIOD_LABELS: Record<FixedCostItem["period"], string> = {
  monthly: "월",
  yearly: "연",
};
