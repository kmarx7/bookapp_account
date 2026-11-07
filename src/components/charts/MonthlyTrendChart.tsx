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
import { formatCompactKRW, formatKRW } from "@/lib/format";

export interface MonthlyPoint {
  label: string;
  gross: number;
  expense: number;
}

const AXIS = { fontSize: 11, fill: "#5f6773" };

export function MonthlyTrendChart({ data }: { data: MonthlyPoint[] }) {
  if (data.every((point) => point.gross === 0 && point.expense === 0)) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        아직 손익 기록이 없습니다. 손익계산서를 작성해 보세요.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ee" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(value: number) => formatCompactKRW(value)}
        />
        <Tooltip formatter={(value) => formatKRW(Number(value))} />
        <Bar dataKey="gross" name="매출" fill="#1b2a4a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="영업비용" fill="#c0392b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
