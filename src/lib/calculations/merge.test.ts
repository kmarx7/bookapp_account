import { describe, expect, it } from "vitest";
import { mergeAppData } from "@/lib/calculations/merge";
import { DEFAULT_APP_DATA } from "@/lib/storage/schema";
import type { AppData, Debt } from "@/types";

function debt(id: string, updatedAt: string, balance: number): Debt {
  return {
    id,
    userId: "u1",
    name: id,
    balance,
    annualRate: 0,
    monthlyPayment: 0,
    updatedAt,
  };
}

function data(overrides: Partial<AppData>): AppData {
  return { ...DEFAULT_APP_DATA, schemaVersion: 2, ...overrides };
}

describe("mergeAppData", () => {
  it("keeps the newer record by updatedAt", () => {
    const local = data({ debts: [debt("a", "2026-01-02T00:00:00.000Z", 200)] });
    const remote = data({ debts: [debt("a", "2026-01-01T00:00:00.000Z", 100)] });

    const merged = mergeAppData(local, remote);
    expect(merged.debts).toHaveLength(1);
    expect(merged.debts[0].balance).toBe(200);
  });

  it("takes the remote record when it is newer", () => {
    const local = data({ debts: [debt("a", "2026-01-01T00:00:00.000Z", 100)] });
    const remote = data({ debts: [debt("a", "2026-01-03T00:00:00.000Z", 300)] });

    const merged = mergeAppData(local, remote);
    expect(merged.debts[0].balance).toBe(300);
  });

  it("unions records that exist on only one side", () => {
    const local = data({ debts: [debt("a", "2026-01-01T00:00:00.000Z", 100)] });
    const remote = data({ debts: [debt("b", "2026-01-01T00:00:00.000Z", 200)] });

    const merged = mergeAppData(local, remote);
    expect(merged.debts.map((d) => d.id).sort()).toEqual(["a", "b"]);
  });

  it("merges user, preferring the newer", () => {
    const local = data({
      user: {
        id: "u1",
        nickname: "이모 대표",
        foundedAt: "2026-01-01",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });
    const remote = data({
      user: {
        id: "u1",
        nickname: "새 이름",
        foundedAt: "2026-01-01",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-02-01T00:00:00.000Z",
      },
    });

    expect(mergeAppData(local, remote).user?.nickname).toBe("새 이름");
    expect(mergeAppData(remote, local).user?.nickname).toBe("새 이름");
  });
});

describe("calendar checks", () => {
  it("완료 표시는 합집합으로 병합한다", () => {
    const local = data({ calendarDone: ["2026:vat-2"] });
    const remote = data({ calendarDone: ["2026:vat-2", "2026:income-tax"] });

    expect(new Set(mergeAppData(local, remote).calendarDone)).toEqual(
      new Set(["2026:vat-2", "2026:income-tax"]),
    );
  });
});
