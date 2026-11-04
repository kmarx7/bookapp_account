import { describe, expect, it } from "vitest";
import { parseBackup } from "@/lib/storage/backup";
import { DEFAULT_APP_DATA, migrate } from "@/lib/storage/schema";

describe("parseBackup", () => {
  it("returns normalized data for a valid payload", () => {
    const payload = JSON.stringify({
      ...DEFAULT_APP_DATA,
      user: {
        id: "u1",
        nickname: "이모 대표",
        foundedAt: "2026-01-01",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });
    const parsed = parseBackup(payload);
    expect(parsed?.user?.nickname).toBe("이모 대표");
    expect(parsed?.incomeStatements).toEqual([]);
  });

  it("returns null for malformed JSON", () => {
    expect(parseBackup("{ not json")).toBeNull();
  });
});

describe("migrate", () => {
  it("fills defaults for missing collections", () => {
    const result = migrate(0, { user: null });
    expect(result.schemaVersion).toBe(DEFAULT_APP_DATA.schemaVersion);
    expect(result.incomeStatements).toEqual([]);
    expect(result.debts).toEqual([]);
  });
});
