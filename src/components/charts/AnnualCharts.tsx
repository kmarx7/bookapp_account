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
import { formatNumber } from "@/lib/format";
import type { AnnualComputed } from "@/lib/calculations/annual";

const AXIS = { fontSize: 11, fill: "#6b7280" };

export function EquityLineChart({ data }: { data: AnnualComputed[] }) {
  return (
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
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AssetDebtBarChart({ data }: { data: AnnualComputed[] }) {
  return (
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
        <Bar dataKey="totalAssets" name="자산" fill="#1b2a4a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="totalDebts" name="부채" fill="#c0392b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EquityRatioChart({ data }: { data: AnnualComputed[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
        <Bar dataKey="equityRatio" name="자기자본 비율" fill="#15803d" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
