import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppData, Debt } from "@/types";

/**
 * Supabase 클라이언트를 대역으로 바꿔 "로그인 직후 pull → merge → push → hydrate"
 * 경로를 네트워크 없이 검증한다. (실제 서버 통신은 검증하지 않는다)
 */
const remote = vi.hoisted(() => {
  const maybeSingle = vi.fn();
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const upsert = vi.fn();
  const from = vi.fn(() => ({ select, upsert }));
  return { from, select, eq, maybeSingle, upsert };
});

vi.mock("@/lib/supabase/client", () => ({
  getSupabase: () => ({ from: remote.from }),
  isSupabaseEnabled: true,
}));

import { pullRemote, pushRemote, syncWithRemote } from "@/lib/sync/sync";
import { DEFAULT_APP_DATA, toAppData } from "@/lib/storage/schema";
import { useAppStore } from "@/store/useAppStore";

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
  return { ...DEFAULT_APP_DATA, ...overrides };
}

beforeEach(() => {
  remote.from.mockClear();
  remote.select.mockClear();
  remote.eq.mockClear();
  remote.maybeSingle.mockReset();
  remote.upsert.mockReset();
  useAppStore.setState({ ...DEFAULT_APP_DATA, hydrated: true });
});

describe("pullRemote (로그인 직후 원격 조회)", () => {
  it("원격 행이 없으면 null을 돌려준다", async () => {
    remote.maybeSingle.mockResolvedValue({ data: null, error: null });

    expect(await pullRemote("u1")).toBeNull();
    expect(remote.from).toHaveBeenCalledWith("app_data");
    expect(remote.eq).toHaveBeenCalledWith("user_id", "u1");
  });

  it("원격 데이터를 정규화해 돌려준다", async () => {
    remote.maybeSingle.mockResolvedValue({
      data: { data: { debts: [debt("a", "2026-01-02T00:00:00.000Z", 100)] } },
      error: null,
    });

    const pulled = await pullRemote("u1");
    expect(pulled?.debts).toHaveLength(1);
    expect(pulled?.schemaVersion).toBe(DEFAULT_APP_DATA.schemaVersion);
    expect(pulled?.tools.bep.fixedCost).toBe(0);
  });

  it("오류면 던진다(호출 측이 로컬을 보존할 수 있게)", async () => {
    remote.maybeSingle.mockResolvedValue({
      data: null,
      error: new Error("permission denied"),
    });

    await expect(pullRemote("u1")).rejects.toThrow("permission denied");
  });
});

describe("pushRemote", () => {
  it("user_id와 data, updated_at을 upsert 한다", async () => {
    remote.upsert.mockResolvedValue({ error: null });
    const payload = data({ debts: [debt("a", "2026-01-02T00:00:00.000Z", 100)] });

    await pushRemote("u1", payload);

    expect(remote.upsert).toHaveBeenCalledTimes(1);
    const row = remote.upsert.mock.calls[0][0] as Record<string, unknown>;
    expect(row.user_id).toBe("u1");
    expect(row.data).toEqual(payload);
    expect(typeof row.updated_at).toBe("string");
  });

  it("오류를 던진다", async () => {
    remote.upsert.mockResolvedValue({ error: new Error("write denied") });
    await expect(pushRemote("u1", DEFAULT_APP_DATA)).rejects.toThrow("write denied");
  });
});

describe("syncWithRemote", () => {
  it("원격이 더 새로우면 원격 값으로 병합해 push한다", async () => {
    remote.maybeSingle.mockResolvedValue({
      data: { data: { debts: [debt("a", "2026-01-05T00:00:00.000Z", 900)] } },
      error: null,
    });
    remote.upsert.mockResolvedValue({ error: null });

    const local = data({ debts: [debt("a", "2026-01-01T00:00:00.000Z", 100)] });
    const merged = await syncWithRemote(local, "u1");

    expect(merged.debts[0].balance).toBe(900);
    const pushed = remote.upsert.mock.calls[0][0] as { data: AppData };
    expect(pushed.data.debts[0].balance).toBe(900);
  });

  it("원격 행이 없으면 로컬을 그대로 올린다", async () => {
    remote.maybeSingle.mockResolvedValue({ data: null, error: null });
    remote.upsert.mockResolvedValue({ error: null });

    const local = data({ debts: [debt("a", "2026-01-01T00:00:00.000Z", 100)] });
    const merged = await syncWithRemote(local, "u1");

    expect(merged).toEqual(local);
    const pushed = remote.upsert.mock.calls[0][0] as { data: AppData };
    expect(pushed.data.debts).toHaveLength(1);
  });

  it("학습 진행률은 합집합으로 병합한다", async () => {
    remote.upsert.mockResolvedValue({ error: null });

    const local = data({
      courseProgress: { completedSteps: ["step-1", "step-2"], updatedAt: "2026-01-01T00:00:00.000Z" },
    });
    remote.maybeSingle.mockResolvedValue({
      data: {
        data: {
          courseProgress: {
            completedSteps: ["step-2", "step-3"],
            updatedAt: "2026-01-02T00:00:00.000Z",
          },
        },
      },
      error: null,
    });

    const merged = await syncWithRemote(local, "u1");
    expect([...merged.courseProgress.completedSteps].sort()).toEqual([
      "step-1",
      "step-2",
      "step-3",
    ]);
  });

  it("pull 결과를 스토어에 반영하면 로컬·원격 레코드가 합쳐진다", async () => {
    remote.maybeSingle.mockResolvedValue({
      data: { data: { debts: [debt("remote", "2026-01-05T00:00:00.000Z", 500)] } },
      error: null,
    });
    remote.upsert.mockResolvedValue({ error: null });

    useAppStore.getState().addDebt(debt("local", "2026-01-01T00:00:00.000Z", 100));
    const merged = await syncWithRemote(toAppData(useAppStore.getState()), "u1");
    useAppStore.getState().hydrate(merged);

    expect(useAppStore.getState().debts.map((item) => item.id).sort()).toEqual([
      "local",
      "remote",
    ]);
  });
});
