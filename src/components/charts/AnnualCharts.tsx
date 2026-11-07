"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartFigure } from "@/components/charts/ChartFigure";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatNumber } from "@/lib/format";
import type { AnnualComputed } from "@/lib/calculations/annual";

const AXIS = { fontSize: 11, fill: "#6b7280" };

function yearLabel(item: AnnualComputed): string {
  return `${item.year}년`;
}

export function EquityLineChart({ data }: { data: AnnualComputed[] }) {
  const reduced = useReducedMotion();
  const description = data
    .map((item) => `${yearLabel(item)} 자기자본 ${formatNumber(item.equity)}원`)
    .join(" / ");

  return (
    <ChartFigure title="연도별 자기자본 추이" description={description}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ee" vertical={false} />
          <XAxis dataKey="year" tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(value: number) => formatNumber(value)}
          />
          <Tooltip
            formatter={(value) => formatNumber(Number(value))}
            labelFormatter={(label) => `${label}년`}
          />
          <Line
            type="monotone"
            dataKey="equity"
            name="자기자본"
            stroke="#1b2a4a"
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={!reduced}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}

export function AssetDebtBarChart({ data }: { data: AnnualComputed[] }) {
  const reduced = useReducedMotion();
  const description = data
    .map(
      (item) =>
        `${yearLabel(item)} 자산 ${formatNumber(item.totalAssets)}원, 부채 ${formatNumber(item.totalDebts)}원`,
    )
    .join(" / ");

  return (
    <ChartFigure title="연도별 자산·부채" description={description}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ee" vertical={false} />
          <XAxis dataKey="year" tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(value: number) => formatNumber(value)}
          />
          <Tooltip formatter={(value) => formatNumber(Number(value))} />
          <Bar
            dataKey="totalAssets"
            name="자산"
            fill="#1b2a4a"
            radius={[4, 4, 0, 0]}
            isAnimationActive={!reduced}
          />
          <Bar
            dataKey="totalDebts"
            name="부채"
            fill="#c0392b"
            radius={[4, 4, 0, 0]}
            isAnimationActive={!reduced}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}

export function EquityRatioChart({ data }: { data: AnnualComputed[] }) {
  const reduced = useReducedMotion();
  // AnnualComputed에는 비율 필드가 없으므로 표시용으로 파생한다(자기자본/총자산).
  const rows = data.map((item) => ({
    ...item,
    equityRatio: item.totalAssets === 0 ? 0 : item.equity / item.totalAssets,
  }));
  const description = rows
    .map(
      (item) =>
        `${yearLabel(item)} 자기자본 비율 ${(item.equityRatio * 100).toFixed(1)}%`,
    )
    .join(" / ");

  return (
    <ChartFigure title="연도별 자기자본 비율" description={description}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ee" vertical={false} />
          <XAxis dataKey="year" tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(value: number) => `${Math.round(value * 100)}%`}
          />
          <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
          <Bar
            dataKey="equityRatio"
            name="자기자본 비율"
            fill="#15803d"
            radius={[4, 4, 0, 0]}
            isAnimationActive={!reduced}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}
