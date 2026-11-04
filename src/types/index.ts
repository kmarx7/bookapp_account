export type AuditOpinion = "adequate" | "qualified" | "adverse" | "disclaimer";

export interface User {
  id: string;
  nickname: string;
  foundedAt: string;
  createdAt: string;
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
}

export interface AppData {
  schemaVersion: number;
  user: User | null;
  incomeStatements: IncomeStatement[];
  balanceSheets: BalanceSheet[];
  cashFlows: CashFlow[];
  debts: Debt[];
  annualTrackings: AnnualTracking[];
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

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: "cost" | "maintenance" | "investment";
}
