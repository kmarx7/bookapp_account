"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartFigure } from "@/components/charts/ChartFigure";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatCompactKRW, formatKRW } from "@/lib/format";
import { chartColors, krwTooltip } from "@/lib/chartTheme";

export interface MonthlyPoint {
  label: string;
  gross: number;
  expense: number;
}

const AXIS = { fontSize: 11, fill: chartColors.axis };

export function MonthlyTrendChart({ data }: { data: MonthlyPoint[] }) {
  const reduced = useReducedMotion();

  if (data.every((point) => point.gross === 0 && point.expense === 0)) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        아직 손익 기록이 없습니다. 손익계산서를 작성해 보세요.
      </p>
    );
  }

  const description = data
    .map(
      (point) =>
        `${point.label} 매출 ${formatKRW(point.gross)}, 영업비용 ${formatKRW(point.expense)}`,
    )
    .join(" / ");

  return (
    <ChartFigure title="최근 6개월 손익 추이" description={description}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value: number) => formatCompactKRW(value)}
          />
          <Tooltip formatter={krwTooltip} />
          <Bar
            dataKey="gross"
            name="매출"
            fill={chartColors.primary}
            radius={[4, 4, 0, 0]}
            isAnimationActive={!reduced}
          />
          <Bar
            dataKey="expense"
            name="영업비용"
            fill={chartColors.negative}
            radius={[4, 4, 0, 0]}
            isAnimationActive={!reduced}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}
