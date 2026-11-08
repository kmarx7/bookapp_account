import { describe, expect, it } from "vitest";
import {
  BUSINESS_PROFILE_LABELS,
  BUSINESS_PROFILES,
  DIARY_TAG_LABELS,
  MONTHLY_ROUTINE,
  TAX_CALENDAR,
  calendarKey,
  eventDate,
  eventsForMonth,
  nextEvent,
} from "@/lib/taxCalendar";

const ALL_VIEW = { profile: "all" as const, living: true };

describe("tax calendar", () => {
  it("모든 일정이 유효한 달·날짜·ID를 가진다", () => {
    for (const event of TAX_CALENDAR) {
      expect(event.month).toBeGreaterThanOrEqual(1);
      expect(event.month).toBeLessThanOrEqual(12);
      expect(event.id.length).toBeGreaterThan(0);
      expect(event.short.length).toBeGreaterThan(0);
      expect(event.title.length).toBeGreaterThan(0);
      expect(event.appliesTo.length).toBeGreaterThan(0);
      if (event.day !== undefined) {
        expect(event.day).toBeGreaterThanOrEqual(1);
        expect(event.day).toBeLessThanOrEqual(31);
      }
    }
  });

  it("ID가 중복되지 않는다", () => {
    const ids = TAX_CALENDAR.map((event) => event.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("전체 보기에서는 부가세·연말정산·종소세·중간예납·생활 세금이 모두 보인다", () => {
    const shorts = [1, 2, 5, 6, 7, 11].flatMap((month) =>
      eventsForMonth(month, ALL_VIEW).map((event) => event.short),
    );

    expect(shorts).toContain("부가세");
    expect(shorts).toContain("연말정산");
    expect(shorts).toContain("종소세");
    expect(shorts).toContain("중간예납");
    expect(shorts).toContain("자동차세");
  });

  it("근로자는 연말정산만, 개인 일반과세는 부가세·종소세만 본다", () => {
    const employee = { profile: "employee" as const, living: true };
    expect(eventsForMonth(2, employee).map((event) => event.short)).toEqual([
      "연말정산",
    ]);
    // 근로자에게 7월은 생활 세금(재산세)만 남는다 (부가세 없음)
    expect(eventsForMonth(7, employee).map((event) => event.short)).toEqual([
      "재산세",
    ]);

    const sole = { profile: "sole-general" as const, living: true };
    expect(eventsForMonth(7, sole).map((event) => event.short)).toContain(
      "부가세",
    );
    expect(eventsForMonth(2, sole)).toEqual([]);
  });

  it("법인은 법인세와 4·10월 부가세를 본다", () => {
    const corporate = { profile: "corporate" as const, living: true };
    expect(eventsForMonth(3, corporate).map((event) => event.id)).toContain(
      "corporate-tax",
    );
    expect(eventsForMonth(4, corporate).map((event) => event.id)).toContain(
      "vat-1-corp",
    );
    expect(eventsForMonth(10, corporate).map((event) => event.id)).toContain(
      "vat-2-corp",
    );
  });

  it("생활 세금 표시를 끄면 자동차·재산세가 사라진다", () => {
    const noLiving = { profile: "all" as const, living: false };
    expect(eventsForMonth(6, noLiving)).toEqual([]);
    expect(eventsForMonth(7, noLiving).map((event) => event.short)).not.toContain(
      "재산세",
    );
  });

  it("같은 달 일정은 날짜 순으로 정렬한다", () => {
    const january = eventsForMonth(1, ALL_VIEW);
    expect(january[0].day).toBe(25);
    expect(january[1].day).toBeUndefined();
  });

  it("다음 일정과 남은 날짜를 계산한다", () => {
    const from = new Date(2026, 1, 1); // 2월 1일
    const next = nextEvent(from, { profile: "employee", living: false });

    expect(next?.event.id).toBe("year-end-tax");
    expect(next?.daysLeft).toBe(27);
  });

  it("오늘이 일정일이면 D-0으로 잡는다", () => {
    const from = new Date(2026, 4, 31); // 5월 31일 = 종합소득세
    const next = nextEvent(from, { profile: "sole-general", living: false });

    expect(next?.event.id).toBe("income-tax");
    expect(next?.daysLeft).toBe(0);
  });

  it("완료 키는 연도와 일정 ID로 만든다", () => {
    expect(calendarKey(2026, "vat-2")).toBe("2026:vat-2");
  });

  it("날짜가 없는 일정은 그 달 말일로 본다", () => {
    const closing = TAX_CALENDAR.find((event) => event.id === "closing-year")!;
    expect(eventDate(closing, 2026).getDate()).toBe(31);
  });

  it("프로필 라벨과 월간 루틴 문구가 준비되어 있다", () => {
    expect(BUSINESS_PROFILES).toHaveLength(5);
    expect(BUSINESS_PROFILE_LABELS["sole-general"]).toBe("개인 일반과세");
    expect(DIARY_TAG_LABELS.living).toBe("생활");
    expect(MONTHLY_ROUTINE.title.length).toBeGreaterThan(0);
  });
});
