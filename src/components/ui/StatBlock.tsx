import type { ReactNode } from "react";

type Tone = "neutral" | "positive" | "negative";

const TONES: Record<Tone, string> = {
  neutral: "text-brand-dark",
  positive: "text-positive",
  negative: "text-negative",
};

export function StatBlock({
  label,
  value,
  tone = "neutral",
  sub,
}: {
  label: string;
  value: ReactNode;
  tone?: Tone;
  sub?: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-surface-muted px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`num mt-1 text-lg font-semibold ${TONES[tone]}`}>{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-muted">{sub}</p> : null}
    </div>
  );
}

export function toneForValue(value: number): Tone {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}
