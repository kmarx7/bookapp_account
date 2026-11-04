"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function MonthSwitcher({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-2 py-1.5">
      <button
        type="button"
        onClick={onPrev}
        aria-label="이전 달"
        className="rounded-lg p-2 text-muted transition-colors hover:bg-brand-soft"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="num text-sm font-semibold text-brand">{label}</span>
      <button
        type="button"
        onClick={onNext}
        aria-label="다음 달"
        className="rounded-lg p-2 text-muted transition-colors hover:bg-brand-soft"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
