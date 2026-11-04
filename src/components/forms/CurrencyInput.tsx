"use client";

import { formatNumber, parseAmount } from "@/lib/format";

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
  id,
  className = "",
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        inputMode="numeric"
        disabled={disabled}
        className="num h-11 w-full rounded-xl border border-border bg-surface px-3 pr-8 text-right text-sm text-brand-dark outline-none transition-colors focus:border-brand disabled:opacity-60"
        value={value ? formatNumber(value) : ""}
        placeholder={placeholder}
        onChange={(event) => onChange(parseAmount(event.target.value))}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
        원
      </span>
    </div>
  );
}
