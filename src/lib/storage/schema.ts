import type { AppData } from "@/types";
import { SCHEMA_VERSION } from "@/lib/constants";

export const DEFAULT_APP_DATA: AppData = {
  schemaVersion: SCHEMA_VERSION,
  user: null,
  incomeStatements: [],
  balanceSheets: [],
  cashFlows: [],
  debts: [],
  annualTrackings: [],
  courseProgress: { completedSteps: [], updatedAt: "" },
};

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
  };
}

export function normalize(source: Partial<AppData>): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    user: source.user ?? null,
    incomeStatements: source.incomeStatements ?? [],
    balanceSheets: source.balanceSheets ?? [],
    cashFlows: source.cashFlows ?? [],
    debts: source.debts ?? [],
    annualTrackings: source.annualTrackings ?? [],
    courseProgress: source.courseProgress ?? { completedSteps: [], updatedAt: "" },
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
  };
}
