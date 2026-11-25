"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartFigure } from "@/components/charts/ChartFigure";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatCompactKRW, formatKRW } from "@/lib/format";
import { chartColors, krwTooltip } from "@/lib/chartTheme";

const AXIS = { fontSize: 11, fill: chartColors.axis };

export function CashFlowBar({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const reduced = useReducedMotion();

  if (data.every((item) => item.value === 0)) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        아직 현금흐름 기록이 없습니다.
      </p>
    );
  }

  const description = data
    .map((item) => `${item.name} ${formatKRW(item.value)}`)
    .join(" / ");

  return (
    <ChartFigure title="활동별 순현금흐름" description={description}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
          <XAxis dataKey="name" tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value: number) => formatCompactKRW(value)}
          />
          <ReferenceLine y={0} stroke={chartColors.guide} />
          <Tooltip formatter={krwTooltip} />
          <Bar
            dataKey="value"
            name="순현금흐름"
            radius={[4, 4, 0, 0]}
            isAnimationActive={!reduced}
          >
            {data.map((item) => (
              <Cell
                key={item.name}
                fill={item.value < 0 ? chartColors.negative : chartColors.positive}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}
