"use client";

import { useCallback, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";

export interface SelectedMonth {
  year: number;
  month: number;
  label: string;
  prev: () => void;
  next: () => void;
  /** 특정 연·월로 바로 이동 (달력에서 월을 고를 때) */
  goTo: (year: number, month: number) => void;
}

/**
 * 조회 중인 연·월은 zustand에 저장해 페이지·차트·최근 활동이 같은 달을 공유한다.
 * 아직 한 번도 지정하지 않았으면 initial(기본값: 이번 달)을 보여준다.
 */
export function useSelectedMonth(initial?: { year: number; month: number }): SelectedMonth {
  const selectedMonth = useAppStore((state) => state.selectedMonth);
  const setSelectedMonth = useAppStore((state) => state.setSelectedMonth);
  const now = useMemo(() => new Date(), []);
  const fallback = initial ?? { year: now.getFullYear(), month: now.getMonth() + 1 };
  const year = selectedMonth?.year ?? fallback.year;
  const month = selectedMonth?.month ?? fallback.month;

  const prev = useCallback(() => {
    if (month === 1) setSelectedMonth(year - 1, 12);
    else setSelectedMonth(year, month - 1);
  }, [year, month, setSelectedMonth]);

  const next = useCallback(() => {
    if (month === 12) setSelectedMonth(year + 1, 1);
    else setSelectedMonth(year, month + 1);
  }, [year, month, setSelectedMonth]);

  const goTo = useCallback(
    (nextYear: number, nextMonth: number) => {
      setSelectedMonth(nextYear, nextMonth);
    },
    [setSelectedMonth],
  );

  return { year, month, label: `${year}년 ${month}월`, prev, next, goTo };
}
