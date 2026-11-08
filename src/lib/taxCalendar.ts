export type DiaryTag = "tax" | "closing" | "routine";

export interface DiaryEvent {
  month: number;
  day?: number;
  /** 달력 칸에 들어가는 짧은 이름 */
  short: string;
  title: string;
  note?: string;
  tag: DiaryTag;
}

export const DIARY_TAG_LABELS: Record<DiaryTag, string> = {
  tax: "세금",
  closing: "결산",
  routine: "루틴",
};

/**
 * 개인(근로자·개인사업자) 기준 참고 일정.
 * 제도·대상에 따라 달라질 수 있으므로 화면에서 "참고용"임을 함께 표시한다.
 */
export const TAX_CALENDAR: DiaryEvent[] = [
  {
    month: 1,
    day: 25,
    short: "부가세",
    title: "부가세 2기 확정신고·납부",
    note: "개인 일반과세 사업자",
    tag: "tax",
  },
  {
    month: 1,
    short: "결산 마감",
    title: "전년 결산 마감 · 감사의견/서명",
    note: "연간 추적에서 마무리",
    tag: "closing",
  },
  {
    month: 2,
    day: 28,
    short: "연말정산",
    title: "연말정산 제출",
    note: "근로자는 2월 말까지 회사에 제출",
    tag: "tax",
  },
  {
    month: 3,
    day: 10,
    short: "지급명세서",
    title: "지급명세서 제출",
    note: "사업자·법인",
    tag: "tax",
  },
  {
    month: 5,
    day: 31,
    short: "종소세",
    title: "종합소득세 신고·납부",
    note: "5/1~5/31, 개인사업자·프리랜서",
    tag: "tax",
  },
  {
    month: 7,
    day: 25,
    short: "부가세",
    title: "부가세 1기 확정신고·납부",
    note: "개인 일반과세 사업자",
    tag: "tax",
  },
  {
    month: 11,
    day: 30,
    short: "중간예납",
    title: "종합소득세 중간예납",
    note: "해당자",
    tag: "tax",
  },
  {
    month: 12,
    short: "연말 결산",
    title: "연말 결산 · 12/31 재무상태표",
    note: "감사의견을 달고 서명",
    tag: "closing",
  },
];

/** 매달 반복하는 기본 루틴 */
export const MONTHLY_ROUTINE = {
  title: "월간 결산",
  note: "손익계산서 → 재무상태표 → 현금흐름표",
};

export function eventsForMonth(month: number): DiaryEvent[] {
  return TAX_CALENDAR.filter((event) => event.month === month).sort(
    (a, b) => (a.day ?? 99) - (b.day ?? 99),
  );
}
