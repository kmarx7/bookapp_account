import { describe, expect, it } from "vitest";
import {
  COURSE_STEPS,
  COURSE_TOTAL,
  courseStats,
  resolveCompletion,
  stepById,
  stepIndex,
} from "@/lib/course";
import { DEFAULT_APP_DATA } from "@/lib/storage/schema";
import type { AppData } from "@/types";

function data(overrides: Partial<AppData> = {}): AppData {
  return { ...DEFAULT_APP_DATA, schemaVersion: 3, ...overrides };
}

describe("course content", () => {
  it("has prologue plus 16 chapters", () => {
    expect(COURSE_TOTAL).toBe(17);
    expect(stepById("prologue")).toBeDefined();
    expect(stepById("ch16")).toBeDefined();
  });

  it("has unique ids and complete fields", () => {
    const ids = COURSE_STEPS.map((step) => step.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const step of COURSE_STEPS) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.summary.length).toBeGreaterThan(0);
      expect(step.concepts.length).toBeGreaterThan(0);
      expect(step.practice.steps.length).toBeGreaterThan(0);
    }
  });

  it("orders steps with chapter numbers ascending", () => {
    const chapters = COURSE_STEPS.map((step) => step.chapter).filter(
      (value): value is number => value !== null,
    );
    expect(chapters).toEqual([...chapters].sort((a, b) => a - b));
    expect(chapters).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
  });

  it("resolves step index for navigation", () => {
    expect(stepIndex("prologue")).toBe(0);
    expect(stepIndex("ch01")).toBe(1);
  });
});

describe("course completion", () => {
  it("auto-completes data-backed steps", () => {
    expect(resolveCompletion(stepById("ch02")!, data())).toBe(false);
    expect(
      resolveCompletion(
        stepById("ch02")!,
        data({ incomeStatements: [{} as never] }),
      ),
    ).toBe(true);
  });

  it("marks manual steps complete from progress", () => {
    const step = stepById("ch08")!;
    expect(resolveCompletion(step, data())).toBe(false);
    expect(
      resolveCompletion(
        step,
        data({
          courseProgress: { completedSteps: ["ch08"], updatedAt: "" },
        }),
      ),
    ).toBe(true);
  });

  it("auto-completes tool-backed steps from saved tool input", () => {
    const base = data();
    expect(resolveCompletion(stepById("ch05")!, base)).toBe(false);
    expect(
      resolveCompletion(
        stepById("ch05")!,
        data({
          tools: {
            ...base.tools,
            fixedCosts: [{ id: "f", name: "구독", amount: 12_000, period: "monthly" }],
          },
        }),
      ),
    ).toBe(true);
  });

  it("reports progress and the next step", () => {
    const stats = courseStats(
      data({
        courseProgress: { completedSteps: ["prologue"], updatedAt: "" },
      }),
    );
    expect(stats.total).toBe(17);
    expect(stats.done).toBe(1);
    expect(stats.next?.id).toBe("ch01");
    expect(stats.ratio).toBeCloseTo(1 / 17, 6);
  });
});
