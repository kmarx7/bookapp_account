"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { YearDiary } from "@/components/home/YearDiary";
import { useSelectedMonth } from "@/hooks/useSelectedMonth";

export default function CalendarPage() {
  const { year, month, goTo } = useSelectedMonth();

  return (
    <>
      <PageHeader
        title="회계 달력"
        description="월별 세금·결산 일정을 확인하고, 완료 표시와 예상·납부 금액을 기록합니다."
        action={
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="이전 해"
              onClick={() => goTo(year - 1, month)}
              className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-lg text-brand transition-colors hover:bg-brand-soft"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="num text-sm font-semibold text-brand">{year}년</span>
            <button
              type="button"
              aria-label="다음 해"
              onClick={() => goTo(year + 1, month)}
              className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-lg text-brand transition-colors hover:bg-brand-soft"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        }
      />

      <YearDiary
        year={year}
        selectedMonth={month}
        onSelect={(nextMonth) => goTo(year, nextMonth)}
      />
    </>
  );
}
