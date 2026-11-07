import type { AppData, ToolData } from "@/types";
import { SCHEMA_VERSION } from "@/lib/constants";

export function createDefaultTools(): ToolData {
  return {
    bep: { fixedCost: 0, variableCost: 0, revenue: 0 },
    payslip: [{ id: "p1", name: "기본급", amount: 0, kind: "income" }],
    fixedCosts: [{ id: "f1", name: "", amount: 0, period: "monthly" }],
    expenseReview: [{ id: "e1", name: "", amount: 0 }],
    insurance: [
      { id: "i1", name: "", monthlyPremium: 0, kind: "protection", savingsMonthly: 0 },
    ],
    investments: [{ id: "v1", name: "", cost: 0, marketValue: 0 }],
    taxRefund: { lastYear: 0, expected: 0, use: "debt", checks: [] },
    updatedAt: "",
  };
}

export function createDefaultAppData(): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    user: null,
    incomeStatements: [],
    balanceSheets: [],
    cashFlows: [],
    debts: [],
    annualTrackings: [],
    courseProgress: { completedSteps: [], updatedAt: "" },
    tools: createDefaultTools(),
  };
}

export const DEFAULT_APP_DATA: AppData = createDefaultAppData();

export function migrate(persistedVersion: number, persisted: unknown): AppData {
  const normalized = normalize((persisted ?? {}) as Partial<AppData>);
  if (persistedVersion >= SCHEMA_VERSION) return normalized;
  return stampMissingTimestamps(normalized);
}

export function toAppData(source: AppData): AppData {
  return {
    schemaVersion: source.schemaVersion,
    user: source.user,
    incomeStatements: source.incomeStatements,
    balanceSheets: source.balanceSheets,
    cashFlows: source.cashFlows,
    debts: source.debts,
    annualTrackings: source.annualTrackings,
    courseProgress: source.courseProgress,
    tools: source.tools,
  };
}

export function normalize(source: Partial<AppData>): AppData {
  const defaults = createDefaultTools();
  return {
    schemaVersion: SCHEMA_VERSION,
    user: source.user ?? null,
    incomeStatements: source.incomeStatements ?? [],
    balanceSheets: source.balanceSheets ?? [],
    cashFlows: source.cashFlows ?? [],
    debts: source.debts ?? [],
    annualTrackings: source.annualTrackings ?? [],
    courseProgress: source.courseProgress ?? { completedSteps: [], updatedAt: "" },
    tools: source.tools ? { ...defaults, ...source.tools } : defaults,
  };
}

function stampMissingTimestamps(data: AppData): AppData {
  const stamp = new Date().toISOString();
  const legacy = <T extends { updatedAt?: string }>(item: T): T => ({
    ...item,
    updatedAt: item.updatedAt ?? stamp,
  });

  return {
    ...data,
    schemaVersion: SCHEMA_VERSION,
    user: data.user ? legacy(data.user) : null,
    debts: data.debts.map(legacy),
    annualTrackings: data.annualTrackings.map(legacy),
    courseProgress: data.courseProgress.updatedAt
      ? data.courseProgress
      : { ...data.courseProgress, updatedAt: stamp },
    tools: data.tools.updatedAt
      ? data.tools
      : { ...data.tools, updatedAt: stamp },
  };
}
