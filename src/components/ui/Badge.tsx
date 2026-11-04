import type { ReactNode } from "react";

type Tone = "neutral" | "positive" | "negative" | "brand";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-muted text-muted",
  positive: "bg-positive-soft text-positive",
  negative: "bg-negative-soft text-negative",
  brand: "bg-brand-soft text-brand",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
