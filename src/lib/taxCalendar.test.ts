import { describe, expect, it } from "vitest";
import {
  DIARY_TAG_LABELS,
  MONTHLY_ROUTINE,
  TAX_CALENDAR,
  eventsForMonth,
} from "@/lib/taxCalendar";

describe("tax calendar", () => {
  it("모든 일정이 1~12월 안에 있고 이름이 비어 있지 않다", () => {
    for (const event of TAX_CALENDAR) {
      expect(event.month).toBeGreaterThanOrEqual(1);
      expect(event.month).toBeLessThanOrEqual(12);
      expect(event.title.length).toBeGreaterThan(0);
      expect(event.short.length).toBeGreaterThan(0);
      if (event.day !== undefined) {
        expect(event.day).toBeGreaterThanOrEqual(1);
        expect(event.day).toBeLessThanOrEqual(31);
      }
    }
  });

  it("부가세·연말정산·종합소득세 일정을 포함한다", () => {
    expect(eventsForMonth(1).map((event) => event.short)).toContain("부가세");
    expect(eventsForMonth(2).map((event) => event.short)).toContain("연말정산");
    expect(eventsForMonth(5).map((event) => event.short)).toContain("종소세");
    expect(eventsForMonth(7).map((event) => event.short)).toContain("부가세");
    expect(eventsForMonth(11).map((event) => event.short)).toContain("중간예납");
  });

  it("같은 달의 일정은 날짜 순으로 정렬한다", () => {
    const january = eventsForMonth(1);
    expect(january[0].day).toBe(25);
    expect(january[1].day).toBeUndefined();
  });

  it("일정이 없는 달은 빈 배열을 돌려준다", () => {
    expect(eventsForMonth(4)).toEqual([]);
  });

  it("태그 라벨과 월간 루틴 문구가 준비되어 있다", () => {
    expect(DIARY_TAG_LABELS.tax).toBe("세금");
    expect(DIARY_TAG_LABELS.closing).toBe("결산");
    expect(MONTHLY_ROUTINE.title.length).toBeGreaterThan(0);
  });
});
