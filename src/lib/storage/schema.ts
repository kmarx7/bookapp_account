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
};

export function migrate(persistedVersion: number, persisted: unknown): AppData {
  const source = (persisted ?? {}) as Partial<AppData>;

  switch (persistedVersion) {
    case 0:
    case SCHEMA_VERSION:
    default:
      return normalize(source);
  }
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
  };
}
