"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle } from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";
import { setCalendarPrefs, useCalendarPrefs } from "@/lib/calendarPrefs";
import { formatKRW, formatNumber, parseAmount } from "@/lib/format";
import {
  BUSINESS_PROFILES,
  BUSINESS_PROFILE_LABELS,
  DIARY_TAG_LABELS,
  MONTHLY_ROUTINE,
  calendarKey,
  customEventToDiary,
  eventsForMonth,
  nextEvent,
  overdueEvents,
  type BusinessProfile,
} from "@/lib/taxCalendar";

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

function ddayLabel(daysLeft: number): string {
  if (daysLeft <= 0) return "오늘";
  return `D-${daysLeft}`;
}

function AmountField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-1 text-[11px] text-muted">
      {label}
      <input
        inputMode="numeric"
        value={value ? formatNumber(value) : ""}
        placeholder="0"
        onChange={(event) => onChange(parseAmount(event.target.value))}
        className="num h-8 w-20 rounded-lg border border-border bg-surface px-2 text-right text-xs text-brand-dark outline-none transition-colors focus:border-brand"
      />
      <span>원</span>
    </label>
  );
}

/**
 * 홈의 1년 회계 달력.
 * 월을 누르면 홈의 선택 월이 바뀌고, 아래 상세에서 완료 표시·금액 기록·내 일정 추가를 할 수 있다.
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
  const payments = useAppStore((state) => state.calendarPayments);
  const customEvents = useAppStore((state) => state.calendarCustom);
  const toggleCalendarDone = useAppStore((state) => state.toggleCalendarDone);
  const setCalendarPayment = useAppStore((state) => state.setCalendarPayment);
  const addCustomEvent = useAppStore((state) => state.addCustomEvent);
  const removeCustomEvent = useAppStore((state) => state.removeCustomEvent);
  const prefs = useCalendarPrefs();

  const [customTitle, setCustomTitle] = useState("");
  const [customDay, setCustomDay] = useState("");

  const today = useMemo(() => new Date(), []);
  const isThisYear = today.getFullYear() === year;
  const filter = { profile: prefs.profile, living: prefs.living };

  const doneSet = useMemo(() => new Set(doneKeys), [doneKeys]);
  const paymentById = useMemo(
    () => new Map(payments.map((item) => [item.id, item])),
    [payments],
  );
  const extra = useMemo(
    () => customEvents.map(customEventToDiary),
    [customEvents],
  );

  const events = eventsForMonth(selectedMonth, filter, extra);
  const upcoming = nextEvent(today, filter, extra);
  const overdue = overdueEvents(today, filter, doneSet, extra);
  const eventsDone = events.filter((event) =>
    doneSet.has(calendarKey(year, event.id)),
  ).length;

  const taxEvents = events.filter((event) => event.tag === "tax");
  const taxTotals = taxEvents.reduce(
    (acc, event) => {
      const payment = paymentById.get(calendarKey(year, event.id));
      return {
        expected: acc.expected + (payment?.expected ?? 0),
        paid: acc.paid + (payment?.paid ?? 0),
      };
    },
    { expected: 0, paid: 0 },
  );

  const hasIncome = incomeStatements.some(
    (item) => item.year === year && item.month === selectedMonth,
  );
  const hasCashFlow = cashFlows.some(
    (item) => item.year === year && item.month === selectedMonth,
  );

  function handleAddCustom(submit: FormEvent<HTMLFormElement>) {
    submit.preventDefault();
    const title = customTitle.trim();
    if (!title) return;

    const parsedDay = Number.parseInt(customDay, 10);
    const day =
      Number.isFinite(parsedDay) && parsedDay >= 1 && parsedDay <= 31
        ? parsedDay
        : undefined;

    addCustomEvent({
      id: `custom-${crypto.randomUUID()}`,
      month: selectedMonth,
      day,
      title,
    });
    setCustomTitle("");
    setCustomDay("");
  }

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

      <p className="mb-2 flex flex-wrap items-center gap-2 rounded-xl bg-brand-soft px-3 py-2 text-xs text-brand">
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

      {overdue.length > 0 ? (
        <p className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-negative-soft px-3 py-2 text-xs font-medium text-negative">
          <span>지난 일정 {overdue.length}건 미완료</span>
          <span className="font-normal">
            · {overdue[0].event.month}월 {overdue[0].event.title}
            {overdue.length > 1 ? ` 외 ${overdue.length - 1}건` : ""}
          </span>
        </p>
      ) : null}

      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-12">
        {MONTHS.map((month) => {
          const monthEvents = eventsForMonth(month, filter, extra);
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
            const payment = paymentById.get(key);

            return (
              <li
                key={event.id}
                className="flex flex-wrap items-center gap-2 text-xs text-brand-dark"
              >
                <Badge
                  tone={
                    event.tag === "tax"
                      ? "negative"
                      : event.tag === "living"
                        ? "neutral"
                        : event.tag === "custom"
                          ? "neutral"
                          : "brand"
                  }
                >
                  {DIARY_TAG_LABELS[event.tag]}
                </Badge>
                <span className={done ? "text-muted line-through" : ""}>
                  {event.day ? `${event.day}일 · ` : ""}
                  {event.title}
                </span>
                {event.note ? (
                  <span className="text-muted">— {event.note}</span>
                ) : null}

                {event.tag === "custom" ? (
                  <button
                    type="button"
                    aria-label={`${event.title} 삭제`}
                    onClick={() => removeCustomEvent(event.id)}
                    className="ml-auto inline-flex min-h-7 min-w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-negative-soft hover:text-negative"
                  >
                    <Trash2 size={13} />
                  </button>
                ) : null}

                <button
                  type="button"
                  aria-pressed={done}
                  aria-label={`${event.title} ${done ? "완료 취소" : "완료로 표시"}`}
                  onClick={() => toggleCalendarDone(key)}
                  className={`${event.tag === "custom" ? "" : "ml-auto "}inline-flex min-h-7 items-center gap-1 rounded-lg px-2 text-[11px] transition-colors ${
                    done
                      ? "bg-positive-soft text-positive"
                      : "bg-surface text-muted hover:bg-brand-soft"
                  }`}
                >
                  {done ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                  {done ? "완료" : "완료로 표시"}
                </button>

                {event.tag === "tax" ? (
                  <div className="flex w-full flex-wrap items-center gap-3 pl-1">
                    <AmountField
                      label="예상"
                      value={payment?.expected ?? 0}
                      onChange={(value) =>
                        setCalendarPayment(key, { expected: value })
                      }
                    />
                    <AmountField
                      label="납부"
                      value={payment?.paid ?? 0}
                      onChange={(value) =>
                        setCalendarPayment(key, { paid: value })
                      }
                    />
                  </div>
                ) : null}
              </li>
            );
          })}

          <li className="flex flex-wrap items-center gap-2 text-xs text-brand-dark">
            <Badge>루틴</Badge>
            <span>{MONTHLY_ROUTINE.title}</span>
            <span className="text-muted">— {MONTHLY_ROUTINE.note}</span>
          </li>
        </ul>

        {taxTotals.expected > 0 || taxTotals.paid > 0 ? (
          <p className="mt-2 text-[11px] text-muted">
            이 달 세금 · 예상 {formatKRW(taxTotals.expected)} · 납부{" "}
            {formatKRW(taxTotals.paid)}
          </p>
        ) : null}

        <form
          onSubmit={handleAddCustom}
          className="mt-3 flex flex-wrap items-center gap-2"
        >
          <input
            value={customTitle}
            onChange={(event) => setCustomTitle(event.target.value)}
            placeholder="내 일정 (예: 보험 갱신)"
            aria-label="내 일정 제목"
            className="h-8 min-w-32 flex-1 rounded-lg border border-border bg-surface px-2 text-xs text-brand-dark outline-none transition-colors focus:border-brand"
          />
          <input
            value={customDay}
            onChange={(event) => setCustomDay(event.target.value)}
            placeholder="일"
            aria-label="내 일정 날짜(일)"
            inputMode="numeric"
            className="num h-8 w-14 rounded-lg border border-border bg-surface px-2 text-center text-xs text-brand-dark outline-none transition-colors focus:border-brand"
          />
          <button
            type="submit"
            className="inline-flex h-8 items-center rounded-lg bg-brand px-3 text-xs font-medium text-white transition-colors hover:bg-brand-dark"
          >
            {selectedMonth}월에 추가
          </button>
        </form>

        <p className="mt-2 text-[11px] text-muted">
          개인·법인 기준 참고 일정입니다. 세부 일정과 대상은 국세청 홈택스에서
          확인하세요.
        </p>
      </div>
    </Card>
  );
}
