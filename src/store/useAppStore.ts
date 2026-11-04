import { create } from "zustand";
import type {
  AnnualTracking,
  AppData,
  BalanceSheet,
  CashFlow,
  Debt,
  IncomeStatement,
  User,
} from "@/types";
import { DEFAULT_APP_DATA } from "@/lib/storage/schema";

export interface AppState extends AppData {
  hydrated: boolean;
  hydrate: (data: AppData) => void;
  setUser: (user: User) => void;
  updateUser: (patch: Partial<User>) => void;
  upsertIncomeStatement: (value: IncomeStatement) => void;
  upsertCashFlow: (value: CashFlow) => void;
  upsertBalanceSheet: (value: BalanceSheet) => void;
  removeBalanceSheet: (id: string) => void;
  addDebt: (value: Debt) => void;
  updateDebt: (id: string, patch: Partial<Debt>) => void;
  removeDebt: (id: string) => void;
  upsertAnnual: (value: AnnualTracking) => void;
  updateAnnual: (id: string, patch: Partial<AnnualTracking>) => void;
  importData: (data: AppData) => void;
  resetAll: () => void;
}

function upsertById<T extends { id: string }>(list: T[], value: T): T[] {
  const index = list.findIndex((item) => item.id === value.id);
  if (index === -1) return [...list, value];
  const next = [...list];
  next[index] = value;
  return next;
}

export const useAppStore = create<AppState>((set, get) => ({
  ...DEFAULT_APP_DATA,
  hydrated: false,

  hydrate: (data) => set({ ...data, hydrated: true }),

  setUser: (user) => set({ user }),

  updateUser: (patch) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, ...patch } });
  },

  upsertIncomeStatement: (value) =>
    set((state) => ({
      incomeStatements: upsertById(state.incomeStatements, value),
    })),

  upsertCashFlow: (value) =>
    set((state) => ({ cashFlows: upsertById(state.cashFlows, value) })),

  upsertBalanceSheet: (value) =>
    set((state) => ({ balanceSheets: upsertById(state.balanceSheets, value) })),

  removeBalanceSheet: (id) =>
    set((state) => ({
      balanceSheets: state.balanceSheets.filter((sheet) => sheet.id !== id),
    })),

  addDebt: (value) => set((state) => ({ debts: [...state.debts, value] })),

  updateDebt: (id, patch) =>
    set((state) => ({
      debts: state.debts.map((debt) =>
        debt.id === id ? { ...debt, ...patch } : debt,
      ),
    })),

  removeDebt: (id) =>
    set((state) => ({ debts: state.debts.filter((debt) => debt.id !== id) })),

  upsertAnnual: (value) =>
    set((state) => ({
      annualTrackings: upsertById(state.annualTrackings, value),
    })),

  updateAnnual: (id, patch) =>
    set((state) => ({
      annualTrackings: state.annualTrackings.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    })),

  importData: (data) => set({ ...data, hydrated: true }),

  resetAll: () => set({ ...DEFAULT_APP_DATA, hydrated: true }),
}));

export function selectIncomeStatement(
  state: AppState,
  year: number,
  month: number,
): IncomeStatement | undefined {
  return state.incomeStatements.find(
    (item) => item.year === year && item.month === month,
  );
}

export function selectCashFlow(
  state: AppState,
  year: number,
  month: number,
): CashFlow | undefined {
  return state.cashFlows.find(
    (item) => item.year === year && item.month === month,
  );
}
