import { formatPercent } from "@/lib/format";

export function Gauge({ ratio, label }: { ratio: number; label: string }) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));
  const percent = Math.round(clamped * 100);
  const tone =
    clamped >= 0.5
      ? "var(--color-positive)"
      : clamped >= 0.2
        ? "var(--color-brand)"
        : "var(--color-negative)";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted">
        <span>{label}</span>
        <span className="num font-semibold text-brand-dark">
          {formatPercent(clamped)}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percent}%`, background: tone }}
        />
      </div>
    </div>
  );
}
