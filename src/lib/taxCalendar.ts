export type BusinessProfile =
  | "all"
  | "employee"
  | "sole-general"
  | "sole-simple"
  | "corporate";

export const BUSINESS_PROFILES: BusinessProfile[] = [
  "all",
  "employee",
  "sole-general",
  "sole-simple",
  "corporate",
];

export const BUSINESS_PROFILE_LABELS: Record<BusinessProfile, string> = {
  all: "전체 보기",
  employee: "근로자",
  "sole-general": "개인 일반과세",
  "sole-simple": "개인 간이과세",
  corporate: "법인",
};

export type DiaryTag = "tax" | "closing" | "living";

export const DIARY_TAG_LABELS: Record<DiaryTag, string> = {
  tax: "세금",
  closing: "결산",
  living: "생활",
};

const EMPLOYEE: BusinessProfile[] = ["employee"];
const SOLE: BusinessProfile[] = ["sole-general", "sole-simple"];
const BUSINESS: BusinessProfile[] = ["sole-general", "sole-simple", "corporate"];
const ALL: BusinessProfile[] = [
  "employee",
  "sole-general",
  "sole-simple",
  "corporate",
];

export interface DiaryEvent {
  id: string;
  month: number;
  day?: number;
  /** 달력 칸에 들어가는 짧은 이름 */
  short: string;
  title: string;
  note?: string;
  tag: DiaryTag;
  appliesTo: BusinessProfile[];
}

/**
 * 개인·법인 기준 참고 일정.
 * 제도와 대상에 따라 달라질 수 있어 화면에서 "참고용"임을 함께 표시한다.
 */
export const TAX_CALENDAR: DiaryEvent[] = [
  {
    id: "vat-2",
    month: 1,
    day: 25,
    short: "부가세",
    title: "부가세 2기 확정신고·납부",
    note: "개인·법인 사업자",
    tag: "tax",
    appliesTo: BUSINESS,
  },
  {
    id: "closing-prev",
    month: 1,
    short: "결산 마감",
    title: "전년 결산 마감 · 감사의견/서명",
    note: "연간 추적에서 마무리",
    tag: "closing",
    appliesTo: ALL,
  },
  {
    id: "year-end-tax",
    month: 2,
    day: 28,
    short: "연말정산",
    title: "연말정산 제출",
    note: "근로자는 2월 말까지 회사에 제출",
    tag: "tax",
    appliesTo: EMPLOYEE,
  },
  {
    id: "withholding",
    month: 3,
    day: 10,
    short: "지급명세서",
    title: "지급명세서 제출",
    note: "사업자·법인",
    tag: "tax",
    appliesTo: BUSINESS,
  },
  {
    id: "corporate-tax",
    month: 3,
    day: 31,
    short: "법인세",
    title: "법인세 신고·납부",
    note: "12월 결산 법인",
    tag: "tax",
    appliesTo: ["corporate"],
  },
  {
    id: "vat-1-corp",
    month: 4,
    day: 25,
    short: "부가세",
    title: "부가세 1기 확정신고·납부",
    note: "법인",
    tag: "tax",
    appliesTo: ["corporate"],
  },
  {
    id: "income-tax",
    month: 5,
    day: 31,
    short: "종소세",
    title: "종합소득세 신고·납부",
    note: "5/1~5/31, 개인사업자·프리랜서",
    tag: "tax",
    appliesTo: SOLE,
  },
  {
    id: "car-tax-1",
    month: 6,
    day: 30,
    short: "자동차세",
    title: "자동차세 1기 납부",
    note: "6/16~30 · 차량 보유자",
    tag: "living",
    appliesTo: ALL,
  },
  {
    id: "vat-1",
    month: 7,
    day: 25,
    short: "부가세",
    title: "부가세 1기 확정신고·납부",
    note: "개인 일반과세 사업자",
    tag: "tax",
    appliesTo: ["sole-general"],
  },
  {
    id: "property-tax-1",
    month: 7,
    day: 31,
    short: "재산세",
    title: "재산세 1기 납부",
    note: "7/16~31 · 주택 1기분",
    tag: "living",
    appliesTo: ALL,
  },
  {
    id: "property-tax-2",
    month: 9,
    day: 30,
    short: "재산세",
    title: "재산세 2기 납부",
    note: "9/16~30 · 나머지 1/2",
    tag: "living",
    appliesTo: ALL,
  },
  {
    id: "vat-2-corp",
    month: 10,
    day: 25,
    short: "부가세",
    title: "부가세 2기 확정신고·납부",
    note: "법인",
    tag: "tax",
    appliesTo: ["corporate"],
  },
  {
    id: "mid-payment",
    month: 11,
    day: 30,
    short: "중간예납",
    title: "종합소득세 중간예납",
    note: "개인 일반과세 사업자",
    tag: "tax",
    appliesTo: ["sole-general"],
  },
  {
    id: "car-tax-2",
    month: 12,
    day: 31,
    short: "자동차세",
    title: "자동차세 2기 납부",
    note: "12/16~31 · 차량 보유자",
    tag: "living",
    appliesTo: ALL,
  },
  {
    id: "closing-year",
    month: 12,
    short: "연말 결산",
    title: "연말 결산 · 12/31 재무상태표",
    note: "감사의견을 달고 서명",
    tag: "closing",
    appliesTo: ALL,
  },
];

/** 매달 반복하는 기본 루틴 */
export const MONTHLY_ROUTINE = {
  title: "월간 결산",
  note: "손익계산서 → 재무상태표 → 현금흐름표",
};

export interface DiaryFilter {
  profile: BusinessProfile;
  living: boolean;
}

function matchesFilter(event: DiaryEvent, filter: DiaryFilter): boolean {
  if (!filter.living && event.tag === "living") return false;
  if (filter.profile !== "all" && !event.appliesTo.includes(filter.profile)) {
    return false;
  }
  return true;
}

export function eventsForMonth(
  month: number,
  filter: DiaryFilter,
): DiaryEvent[] {
  return TAX_CALENDAR.filter(
    (event) => event.month === month && matchesFilter(event, filter),
  ).sort((a, b) => (a.day ?? 99) - (b.day ?? 99));
}

/** 완료 표시 키: 연도 + 일정 ID */
export function calendarKey(year: number, eventId: string): string {
  return `${year}:${eventId}`;
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function eventDate(event: DiaryEvent, year: number): Date {
  return new Date(
    year,
    event.month - 1,
    event.day ?? lastDayOfMonth(year, event.month),
  );
}

export interface NextDiaryEvent {
  event: DiaryEvent;
  date: Date;
  daysLeft: number;
}

/** 오늘 이후(오늘 포함) 가장 가까운 일정 */
export function nextEvent(
  from: Date,
  filter: DiaryFilter,
): NextDiaryEvent | null {
  const startOfToday = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate(),
  );
  let best: NextDiaryEvent | null = null;

  for (let offset = 0; offset < 12 && !best; offset += 1) {
    const cursor = new Date(from.getFullYear(), from.getMonth() + offset, 1);
    for (const event of eventsForMonth(cursor.getMonth() + 1, filter)) {
      const date = eventDate(event, cursor.getFullYear());
      if (date.getTime() < startOfToday.getTime()) continue;

      const daysLeft = Math.round(
        (date.getTime() - startOfToday.getTime()) / 86_400_000,
      );
      if (!best || date.getTime() < best.date.getTime()) {
        best = { event, date, daysLeft };
      }
    }
  }

  return best;
}
