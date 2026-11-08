import { create } from "zustand";
import type {
  AnnualTracking,
  AppData,
  BalanceSheet,
  CashFlow,
  Debt,
  IncomeStatement,
  ToolData,
  User,
} from "@/types";
import { createDefaultAppData, createDefaultTools } from "@/lib/storage/schema";
import { storeCourseFocus } from "@/lib/course/focus";
import type { CourseResetScope } from "@/lib/course";

export interface AppState extends AppData {
  hydrated: boolean;
  hydrate: (data: AppData) => void;
  setUser: (user: Omit<User, "updatedAt">) => void;
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
  setStepComplete: (id: string, complete: boolean) => void;
  resetCourse: () => void;
  updateTool: <K extends keyof ToolData>(key: K, value: ToolData[K]) => void;
  importData: (data: AppData) => void;
  /**
   * 재무·학습 데이터를 초기화한다. 대표 정보(user)는 유지한다.
   * 프로필까지 지우면 온보딩으로 돌아가 백업 복원 전에 다시 설정해야 하는 함정이 생긴다.
   */
  resetFinancialData: () => void;
  /**
   * 코스에서 "실습하기"로 넘어온 stepId. 실습 화면에서 완료 조건과 복귀 링크를 보여주는 용도로만
   * 쓰이며 저장/동기화 대상이 아니다(toAppData에 포함되지 않는다).
   */
  courseFocus: string | null;
  setCourseFocus: (stepId: string | null) => void;
  /**
   * 한 실습 단계의 데이터만 초기화한다(대표 정보·다른 단계 데이터는 유지).
   * 수동 완료 표시도 함께 해제해 그 단계가 "미완료"로 돌아간다.
   */
  clearStepData: (stepId: string, scope: CourseResetScope) => void;
  /** 회계 달력 일정의 완료 표시를 켜고 끈다 */
  toggleCalendarDone: (key: string) => void;
}

const now = () => new Date().toISOString();

function upsertById<T extends { id: string }>(list: T[], value: T): T[] {
  const index = list.findIndex((item) => item.id === value.id);
  if (index === -1) return [...list, value];
  const next = [...list];
  next[index] = value;
  return next;
}

export const useAppStore = create<AppState>((set, get) => ({
  ...createDefaultAppData(),
  hydrated: false,

  hydrate: (data) => set({ ...data, hydrated: true }),

  setUser: (user) => set({ user: { ...user, updatedAt: now() } }),

  updateUser: (patch) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, ...patch, updatedAt: now() } });
  },

  upsertIncomeStatement: (value) =>
    set((state) => ({
      incomeStatements: upsertById(state.incomeStatements, {
        ...value,
        updatedAt: now(),
      }),
    })),

  upsertCashFlow: (value) =>
    set((state) => ({
      cashFlows: upsertById(state.cashFlows, { ...value, updatedAt: now() }),
    })),

  upsertBalanceSheet: (value) =>
    set((state) => ({
      balanceSheets: upsertById(state.balanceSheets, {
        ...value,
        updatedAt: now(),
      }),
    })),

  removeBalanceSheet: (id) =>
    set((state) => ({
      balanceSheets: state.balanceSheets.filter((sheet) => sheet.id !== id),
    })),

  addDebt: (value) =>
    set((state) => ({ debts: [...state.debts, { ...value, updatedAt: now() }] })),

  updateDebt: (id, patch) =>
    set((state) => ({
      debts: state.debts.map((debt) =>
        debt.id === id ? { ...debt, ...patch, updatedAt: now() } : debt,
      ),
    })),

  removeDebt: (id) =>
    set((state) => ({ debts: state.debts.filter((debt) => debt.id !== id) })),

  upsertAnnual: (value) =>
    set((state) => ({
      annualTrackings: upsertById(state.annualTrackings, {
        ...value,
        updatedAt: now(),
      }),
    })),

  updateAnnual: (id, patch) =>
    set((state) => ({
      annualTrackings: state.annualTrackings.map((row) =>
        row.id === id ? { ...row, ...patch, updatedAt: now() } : row,
      ),
    })),

  setStepComplete: (id, complete) =>
    set((state) => {
      const steps = new Set(state.courseProgress.completedSteps);
      if (complete) steps.add(id);
      else steps.delete(id);
      return {
        courseProgress: {
          completedSteps: [...steps],
          updatedAt: now(),
        },
      };
    }),

  resetCourse: () =>
    set({ courseProgress: { completedSteps: [], updatedAt: now() } }),

  updateTool: (key, value) =>
    set((state) => ({
      tools: { ...state.tools, [key]: value, updatedAt: now() } as ToolData,
    })),

  importData: (data) => set({ ...data, hydrated: true }),

  resetFinancialData: () =>
    set((state) => ({ ...createDefaultAppData(), user: state.user, hydrated: true })),

  courseFocus: null,

  setCourseFocus: (stepId) => {
    storeCourseFocus(stepId);
    set({ courseFocus: stepId });
  },

  toggleCalendarDone: (key) =>
    set((state) => {
      const done = new Set(state.calendarDone);
      if (done.has(key)) done.delete(key);
      else done.add(key);
      return { calendarDone: [...done] };
    }),

  clearStepData: (stepId, scope) => {
    const courseProgress = {
      completedSteps: get().courseProgress.completedSteps.filter(
        (id) => id !== stepId,
      ),
      updatedAt: now(),
    };

    if (scope === "manual") {
      set({ courseProgress });
      return;
    }

    if (scope.startsWith("tools.")) {
      const key = scope.slice("tools.".length) as keyof ToolData;
      const defaults = createDefaultTools();
      set({
        courseProgress,
        tools: { ...get().tools, [key]: defaults[key], updatedAt: now() },
      });
      return;
    }

    switch (scope) {
      case "incomeStatements":
        set({ courseProgress, incomeStatements: [] });
        return;
      case "balanceSheets":
        set({ courseProgress, balanceSheets: [] });
        return;
      case "cashFlows":
        set({ courseProgress, cashFlows: [] });
        return;
      case "debts":
        set({ courseProgress, debts: [] });
        return;
      case "annualTrackings":
        set({ courseProgress, annualTrackings: [] });
        return;
      default:
        set({ courseProgress });
    }
  },
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
