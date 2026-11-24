type SummaryBarTone = "default" | "pos" | "neg";

export interface SummaryBarItem {
  label: string;
  value: string;
  tone?: SummaryBarTone;
}

const VALUE_TONES: Record<SummaryBarTone, string> = {
  default: "text-white",
  pos: "text-emerald-300",
  neg: "text-red-300",
};

export function SummaryBar({
  items,
  operators = [],
  className = "",
}: {
  items: SummaryBarItem[];
  /** items 사이에 표시할 연산자. 길이는 items.length - 1이어야 한다. */
  operators?: string[];
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-2xl bg-brand px-4 py-3 text-white ${className}`}
    >
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`flex min-w-0 flex-1 items-center gap-2 ${
            index === items.length - 1 ? "justify-end" : ""
          }`}
        >
          {index > 0 ? (
            <span className="shrink-0 text-sm opacity-50" aria-hidden="true">
              {operators[index - 1] ?? "="}
            </span>
          ) : null}
          <div className={index === items.length - 1 ? "text-right" : ""}>
            <p className="text-[10px] font-medium opacity-75">{item.label}</p>
            <p
              className={`num text-base font-bold ${VALUE_TONES[item.tone ?? "default"]}`}
            >
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
