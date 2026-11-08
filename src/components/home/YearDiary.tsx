"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle } from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";
import {
  DIARY_TAG_LABELS,
  MONTHLY_ROUTINE,
  eventsForMonth,
} from "@/lib/taxCalendar";

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

/**
 * 홈의 1년 회계 달력. 월을 누르면 홈의 선택 월이 바뀌고,
 * 아래 상세에 그 달의 세금·결산 일정과 데이터 유무가 표시된다.
 */
export function YearDiary({
  year,
  selectedMonth,
  onSelect,
}: {
  year: number;
  selectedMonth: number;
  onSelect: (month: number) => void;
}) {
  const incomeStatements = useAppStore((state) => state.incomeStatements);
  const cashFlows = useAppStore((state) => state.cashFlows);
  const today = useMemo(() => new Date(), []);
  const isThisYear = today.getFullYear() === year;

  const events = eventsForMonth(selectedMonth);
  const hasIncome = incomeStatements.some(
    (item) => item.year === year && item.month === selectedMonth,
  );
  const hasCashFlow = cashFlows.some(
    (item) => item.year === year && item.month === selectedMonth,
  );

  return (
    <Card>
      <CardTitle hint={`${year}년 · 월별 회계 일정`}>1년 회계 달력</CardTitle>

      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-12">
        {MONTHS.map((month) => {
          const monthEvents = eventsForMonth(month);
          const selected = month === selectedMonth;
          const isCurrent = isThisYear && month === today.getMonth() + 1;
          const entered = incomeStatements.some(
            (item) => item.year === year && item.month === month,
          );

          return (
            <button
              key={month}
              type="button"
              aria-pressed={selected}
              aria-label={`${month}월${monthEvents.length > 0 ? ` · ${monthEvents.map((event) => event.short).join(", ")}` : ""}`}
              onClick={() => onSelect(month)}
              className={`flex min-h-16 flex-col items-start gap-0.5 rounded-xl border p-1.5 text-left transition-colors ${
                selected
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-surface hover:border-brand"
              }`}
            >
              <span className="flex items-center gap-1 text-[11px] font-semibold">
                {month}월
                {isCurrent ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                ) : null}
              </span>

              {monthEvents.slice(0, 2).map((event) => (
                <span
                  key={event.title}
                  className={`block w-full truncate text-[10px] leading-tight ${
                    selected ? "text-white/85" : "text-muted"
                  }`}
                >
                  {event.short}
                </span>
              ))}
              {monthEvents.length > 2 ? (
                <span className="text-[10px] opacity-70">
                  +{monthEvents.length - 2}
                </span>
              ) : null}

              <span
                aria-hidden="true"
                className={`mt-auto h-1 w-1 rounded-full ${
                  entered
                    ? selected
                      ? "bg-white"
                      : "bg-positive"
                    : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl bg-surface-muted p-3">
        <p className="text-sm font-semibold text-brand">
          {selectedMonth}월 일정 ·{" "}
          <span className="font-normal text-muted">
            손익계산서 {hasIncome ? "있음" : "없음"} · 현금흐름표{" "}
            {hasCashFlow ? "있음" : "없음"}
          </span>
        </p>

        <ul className="mt-2 flex flex-col gap-1.5">
          {events.map((event) => (
            <li
              key={event.title}
              className="flex flex-wrap items-center gap-2 text-xs text-brand-dark"
            >
              <Badge tone={event.tag === "tax" ? "negative" : "brand"}>
                {DIARY_TAG_LABELS[event.tag]}
              </Badge>
              <span>
                {event.day ? `${event.day}일 · ` : ""}
                {event.title}
              </span>
              {event.note ? (
                <span className="text-muted">— {event.note}</span>
              ) : null}
            </li>
          ))}
          <li className="flex flex-wrap items-center gap-2 text-xs text-brand-dark">
            <Badge>{DIARY_TAG_LABELS.routine}</Badge>
            <span>{MONTHLY_ROUTINE.title}</span>
            <span className="text-muted">— {MONTHLY_ROUTINE.note}</span>
          </li>
        </ul>

        <p className="mt-2 text-[11px] text-muted">
          개인(근로자·개인사업자) 기준 참고 일정입니다. 세부 일정과 대상은
          국세청 홈택스에서 확인하세요.
        </p>
      </div>
    </Card>
  );
}
