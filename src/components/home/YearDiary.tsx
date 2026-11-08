"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle } from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";
import { setCalendarPrefs, useCalendarPrefs } from "@/lib/calendarPrefs";
import {
  BUSINESS_PROFILES,
  BUSINESS_PROFILE_LABELS,
  DIARY_TAG_LABELS,
  MONTHLY_ROUTINE,
  calendarKey,
  eventsForMonth,
  nextEvent,
  type BusinessProfile,
} from "@/lib/taxCalendar";

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

function ddayLabel(daysLeft: number): string {
  if (daysLeft <= 0) return "오늘";
  return `D-${daysLeft}`;
}

/**
 * 홈의 1년 회계 달력.
 * 월을 누르면 홈의 선택 월이 바뀌고, 아래 상세에서 일정 확인·완료 표시를 할 수 있다.
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
  const doneKeys = useAppStore((state) => state.calendarDone);
  const toggleCalendarDone = useAppStore((state) => state.toggleCalendarDone);
  const prefs = useCalendarPrefs();

  const today = useMemo(() => new Date(), []);
  const isThisYear = today.getFullYear() === year;
  const filter = { profile: prefs.profile, living: prefs.living };

  const doneSet = useMemo(() => new Set(doneKeys), [doneKeys]);
  const events = eventsForMonth(selectedMonth, filter);
  const upcoming = nextEvent(today, filter);
  const eventsDone = events.filter((event) =>
    doneSet.has(calendarKey(year, event.id)),
  ).length;

  const hasIncome = incomeStatements.some(
    (item) => item.year === year && item.month === selectedMonth,
  );
  const hasCashFlow = cashFlows.some(
    (item) => item.year === year && item.month === selectedMonth,
  );

  return (
    <Card>
      <CardTitle hint={`${year}년 · 월별 회계 일정`}>1년 회계 달력</CardTitle>

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        <label className="flex items-center gap-1.5">
          내 상황
          <select
            value={prefs.profile}
            onChange={(event) =>
              setCalendarPrefs({
                profile: event.target.value as BusinessProfile,
              })
            }
            className="h-8 rounded-lg border border-border bg-surface px-2 text-xs text-brand-dark outline-none focus:border-brand"
          >
            {BUSINESS_PROFILES.map((profile) => (
              <option key={profile} value={profile}>
                {BUSINESS_PROFILE_LABELS[profile]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={prefs.living}
            onChange={(event) =>
              setCalendarPrefs({ living: event.target.checked })
            }
          />
          생활 세금(자동차·재산) 표시
        </label>
      </div>

      <p className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-brand-soft px-3 py-2 text-xs text-brand">
        <span className="font-semibold">다음 일정</span>
        {upcoming ? (
          <>
            <span>
              {upcoming.event.month}월 {upcoming.event.day ?? "말일"}일 ·{" "}
              {upcoming.event.title}
            </span>
            <span className="ml-auto font-semibold">
              {ddayLabel(upcoming.daysLeft)}
            </span>
          </>
        ) : (
          <span>표시할 일정이 없습니다.</span>
        )}
      </p>

      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-12">
        {MONTHS.map((month) => {
          const monthEvents = eventsForMonth(month, filter);
          const selected = month === selectedMonth;
          const isCurrent = isThisYear && month === today.getMonth() + 1;
          const entered = incomeStatements.some(
            (item) => item.year === year && item.month === month,
          );
          const allDone =
            monthEvents.length > 0 &&
            monthEvents.every((event) =>
              doneSet.has(calendarKey(year, event.id)),
            );

          return (
            <button
              key={month}
              type="button"
              aria-pressed={selected}
              aria-label={`${month}월${
                monthEvents.length > 0
                  ? ` · ${monthEvents.map((event) => event.short).join(", ")}`
                  : ""
              }`}
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
                  key={event.id}
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

              <span className="mt-auto flex items-center gap-1">
                {allDone ? (
                  <span
                    className={`text-[10px] ${selected ? "text-white" : "text-positive"}`}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                ) : null}
                <span
                  aria-hidden="true"
                  className={`h-1 w-1 rounded-full ${
                    entered
                      ? selected
                        ? "bg-white"
                        : "bg-positive"
                      : "bg-transparent"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl bg-surface-muted p-3">
        <p className="text-sm font-semibold text-brand">
          {selectedMonth}월 일정
          {events.length > 0 ? (
            <span className="ml-2 text-xs font-normal text-muted">
              {eventsDone}/{events.length} 완료
            </span>
          ) : null}
          <span className="ml-2 text-xs font-normal text-muted">
            · 손익계산서 {hasIncome ? "있음" : "없음"} · 현금흐름표{" "}
            {hasCashFlow ? "있음" : "없음"}
          </span>
        </p>

        <ul className="mt-2 flex flex-col gap-2">
          {events.length === 0 ? (
            <li className="text-xs text-muted">
              이 달에 표시할 세금·결산 일정이 없습니다. 아래 월간 결산만 하면 됩니다.
            </li>
          ) : null}

          {events.map((event) => {
            const key = calendarKey(year, event.id);
            const done = doneSet.has(key);

            return (
              <li
                key={event.id}
                className="flex flex-wrap items-center gap-2 text-xs text-brand-dark"
              >
                <Badge tone={event.tag === "tax" ? "negative" : event.tag === "living" ? "neutral" : "brand"}>
                  {DIARY_TAG_LABELS[event.tag]}
                </Badge>
                <span className={done ? "text-muted line-through" : ""}>
                  {event.day ? `${event.day}일 · ` : ""}
                  {event.title}
                </span>
                {event.note ? (
                  <span className="text-muted">— {event.note}</span>
                ) : null}
                <button
                  type="button"
                  aria-pressed={done}
                  aria-label={`${event.title} ${done ? "완료 취소" : "완료로 표시"}`}
                  onClick={() => toggleCalendarDone(key)}
                  className={`ml-auto inline-flex min-h-7 items-center gap-1 rounded-lg px-2 text-[11px] transition-colors ${
                    done
                      ? "bg-positive-soft text-positive"
                      : "bg-surface text-muted hover:bg-brand-soft"
                  }`}
                >
                  {done ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                  {done ? "완료" : "완료로 표시"}
                </button>
              </li>
            );
          })}

          <li className="flex flex-wrap items-center gap-2 text-xs text-brand-dark">
            <Badge>루틴</Badge>
            <span>{MONTHLY_ROUTINE.title}</span>
            <span className="text-muted">— {MONTHLY_ROUTINE.note}</span>
          </li>
        </ul>

        <p className="mt-2 text-[11px] text-muted">
          개인·법인 기준 참고 일정입니다. 세부 일정과 대상은 국세청 홈택스에서
          확인하세요.
        </p>
      </div>
    </Card>
  );
}
