import { formatKRW } from "@/lib/format";

/**
 * 차트 팔레트 단일 출처. globals.css @theme 토큰과 같은 값을 쓴다
 * (CSS 변수를 recharts prop에 넘길 수 없어 TS 상수로 둔다).
 */
export const chartColors = {
  /** --color-brand(#3730a3)를 거울링한다 */
  primary: "#3730a3",
  secondary: "#4b6a9b",
  tertiary: "#8fa3c4",
  positive: "#15803d",
  negative: "#c0392b",
  /** 축 라벨 회색 — 토큰(--color-muted)과 통일, 이전 하드코딩 #6b7280 대체 */
  axis: "#5f6773",
  grid: "#e2e6ee",
  guide: "#c9cfda",
} as const;

/** 비용 구성 도넛 슬라이스 순서: 고정비 · 변동비 · 투자비 */
export const expenseStructureColors = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.positive,
] as const;

/** 자산 구성 도넛 슬라이스 순서: 유동자산 · 고정자산 */
export const assetCompositionColors = [
  chartColors.primary,
  chartColors.secondary,
] as const;

/** 통화 툴팁 공통 포맷 — "1,234,567원" */
export const krwTooltip = (value: unknown) => formatKRW(Number(value));
