"use client";

export type SheetView = "input" | "sheet";

const OPTIONS: { key: SheetView; label: string }[] = [
  { key: "input", label: "입력" },
  { key: "sheet", label: "장표" },
];

export function ViewTabs({
  view,
  onChange,
}: {
  view: SheetView;
  onChange: (view: SheetView) => void;
}) {
  return (
    <div
      className="print:hidden mb-4 inline-flex rounded-xl border border-border bg-surface p-1"
      role="group"
      aria-label="보기 방식"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          aria-pressed={view === option.key}
          onClick={() => onChange(option.key)}
          className={`h-8 rounded-lg px-3 text-xs font-medium transition-colors ${
            view === option.key
              ? "bg-brand text-white"
              : "text-muted hover:bg-brand-soft"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
