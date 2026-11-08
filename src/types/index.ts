export type AuditOpinion = "adequate" | "qualified" | "adverse" | "disclaimer";

export interface User {
  id: string;
  nickname: string;
  foundedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FixedCosts {
  rent: number;
  managementFee: number;
  communication: number;
  insurance: number;
  subscriptions: number;
  installment: number;
}

export interface VariableCosts {
  food: number;
  transport: number;
  shopping: number;
  leisure: number;
}

export interface InvestmentCosts {
  education: number;
  books: number;
  people: number;
}

export interface CapitalAllocation {
  savings: number;
  investment: number;
  debtRepayment: number;
  remaining: number;
}

export interface IncomeStatement {
  id: string;
  userId: string;
  year: number;
  month: number;
  salaryNet: number;
  otherIncome: number;
  fixedCosts: FixedCosts;
  variableCosts: VariableCosts;
  investmentCosts: InvestmentCosts;
  capitalAllocation: CapitalAllocation;
  updatedAt: string;
}

export interface CurrentAssets {
  cash: number;
  savings: number;
  stocks: number;
  others: number;
}

export interface FixedAssets {
  deposit: number;
  pension: number;
  others: number;
}

export interface DebtsBreakdown {
  studentLoan: number;
  cardBalance: number;
  overdraft: number;
  otherLoans: number;
}

export interface BalanceSheet {
  id: string;
  userId: string;
  baseDate: string;
  currentAssets: CurrentAssets;
  fixedAssets: FixedAssets;
  debts: DebtsBreakdown;
  updatedAt: string;
}

export interface CashFlowSection {
  inflow: number;
  outflow: number;
}

export interface CashFlow {
  id: string;
  userId: string;
  year: number;
  month: number;
  operating: CashFlowSection;
  investing: CashFlowSection;
  financing: CashFlowSection;
  beginningCash: number;
  updatedAt: string;
}

export interface Debt {
  id: string;
  userId: string;
  name: string;
  balance: number;
  annualRate: number;
  monthlyPayment: number;
  strategy?: string;
  updatedAt: string;
}

export interface AnnualTracking {
  id: string;
  userId: string;
  year: number;
  totalAssets: number;
  totalDebts: number;
  auditOpinion: AuditOpinion | null;
  signature?: string;
  signedAt?: string;
  updatedAt: string;
}

export interface CourseProgress {
  completedSteps: string[];
  updatedAt: string;
}

export interface AppData {
  schemaVersion: number;
  user: User | null;
  incomeStatements: IncomeStatement[];
  balanceSheets: BalanceSheet[];
  cashFlows: CashFlow[];
  debts: Debt[];
  annualTrackings: AnnualTracking[];
  courseProgress: CourseProgress;
  /** 회계 달력에서 "완료"로 표시한 일정 키(`${year}:${eventId}`) */
  calendarDone: string[];
  tools: ToolData;
}

export interface PayslipItem {
  id: string;
  name: string;
  amount: number;
  kind: "income" | "deduction";
}

export interface FixedCostItem {
  id: string;
  name: string;
  amount: number;
  period: "monthly" | "yearly";
  cancelCandidate?: boolean;
}

export type ExpenseCategory = "cost" | "maintenance" | "investment";

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  /** 비용 중 "줄여도 삶의 질이 안 변하는" 후보 */
  cutCandidate?: boolean;
}

export interface InsuranceItem {
  id: string;
  name: string;
  monthlyPremium: number;
  kind: "protection" | "savings" | "mixed";
  savingsMonthly: number;
  surrenderValue?: number;
}

export interface InvestmentItem {
  id: string;
  name: string;
  cost: number;
  marketValue: number;
}

export type RefundUse = "spend" | "asset" | "debt";

export interface ExpenseDraft {
  id: string;
  name: string;
  amount: number;
  /** 수동 분류. 없으면 이름으로 자동 분류한다(기존 저장 데이터 호환). */
  category?: ExpenseCategory;
  /** 줄일 후보 별표 */
  cutCandidate?: boolean;
}

export interface ToolData {
  bep: { fixedCost: number; variableCost: number; revenue: number };
  payslip: PayslipItem[];
  fixedCosts: FixedCostItem[];
  expenseReview: ExpenseDraft[];
  insurance: InsuranceItem[];
  investments: InvestmentItem[];
  taxRefund: {
    lastYear: number;
    expected: number;
    use: RefundUse;
    checks: string[];
  };
  updatedAt: string;
}
