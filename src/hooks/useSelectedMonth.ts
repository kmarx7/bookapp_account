"use client";

import { useCallback, useMemo, useState } from "react";

export interface SelectedMonth {
  year: number;
  month: number;
  label: string;
  prev: () => void;
  next: () => void;
}

export function useSelectedMonth(initial?: { year: number; month: number }): SelectedMonth {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(initial?.year ?? now.getFullYear());
  const [month, setMonth] = useState(initial?.month ?? now.getMonth() + 1);

  const prev = useCallback(() => {
    setMonth((currentMonth) => {
      if (currentMonth === 1) {
        setYear((currentYear) => currentYear - 1);
        return 12;
      }
      return currentMonth - 1;
    });
  }, []);

  const next = useCallback(() => {
    setMonth((currentMonth) => {
      if (currentMonth === 12) {
        setYear((currentYear) => currentYear + 1);
        return 1;
      }
      return currentMonth + 1;
    });
  }, []);

  return { year, month, label: `${year}년 ${month}월`, prev, next };
}
