"use client";

export function PercentInput({
  value,
  onChange,
  placeholder = "0",
  step = 0.1,
  className = "",
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  step?: number;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min={0}
        className="num h-11 w-full rounded-xl border border-border bg-surface px-3 pr-8 text-right text-sm text-brand-dark outline-none transition-colors focus:border-brand"
        value={Number.isFinite(value) ? value : ""}
        placeholder={placeholder}
        onChange={(event) => onChange(Number.parseFloat(event.target.value) || 0)}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
        %
      </span>
    </div>
  );
}
