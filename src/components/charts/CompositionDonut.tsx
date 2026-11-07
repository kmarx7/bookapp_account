"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatKRW, formatPercent } from "@/lib/format";

export interface CompositionSlice {
  name: string;
  value: number;
  color: string;
}

export function CompositionDonut({
  data,
  total,
  emptyLabel = "표시할 데이터가 없습니다.",
}: {
  data: CompositionSlice[];
  total: number;
  emptyLabel?: string;
}) {
  const slices = data.filter((slice) => (slice.value || 0) > 0);

  if (total <= 0 || slices.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">{emptyLabel}</p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {slices.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatKRW(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex w-full flex-col gap-2">
        {slices.map((slice) => (
          <li key={slice.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-brand-dark">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: slice.color }}
              />
              {slice.name}
            </span>
            <span className="num text-muted">
              {formatKRW(slice.value)} · {formatPercent(total ? slice.value / total : 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
