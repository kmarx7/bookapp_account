import type { AppData } from "@/types";

interface Versioned {
  id: string;
  updatedAt?: string;
}

function newer<T extends Versioned>(a: T, b: T): T {
  return (b.updatedAt ?? "") > (a.updatedAt ?? "") ? b : a;
}

function mergeCollection<T extends Versioned>(base: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of base) map.set(item.id, item);
  for (const item of incoming) {
    const existing = map.get(item.id);
    map.set(item.id, existing ? newer(existing, item) : item);
  }
  return [...map.values()];
}

export function mergeAppData(local: AppData, remote: AppData): AppData {
  return {
    schemaVersion: Math.max(local.schemaVersion, remote.schemaVersion),
    user: mergeUser(local, remote),
    incomeStatements: mergeCollection(local.incomeStatements, remote.incomeStatements),
    balanceSheets: mergeCollection(local.balanceSheets, remote.balanceSheets),
    cashFlows: mergeCollection(local.cashFlows, remote.cashFlows),
    debts: mergeCollection(local.debts, remote.debts),
    annualTrackings: mergeCollection(local.annualTrackings, remote.annualTrackings),
    courseProgress: mergeCourseProgress(local, remote),
    tools: mergeTools(local, remote),
  };
}

function mergeTools(local: AppData, remote: AppData) {
  return (remote.tools.updatedAt ?? "") > (local.tools.updatedAt ?? "")
    ? remote.tools
    : local.tools;
}

function mergeUser(local: AppData, remote: AppData) {
  if (!local.user) return remote.user;
  if (!remote.user) return local.user;
  return newer(local.user, remote.user);
}

function mergeCourseProgress(local: AppData, remote: AppData) {
  const completedSteps = [
    ...new Set([
      ...local.courseProgress.completedSteps,
      ...remote.courseProgress.completedSteps,
    ]),
  ];
  const updatedAt =
    local.courseProgress.updatedAt > remote.courseProgress.updatedAt
      ? local.courseProgress.updatedAt
      : remote.courseProgress.updatedAt;
  return { completedSteps, updatedAt };
}
