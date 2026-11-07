"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatKRW } from "@/lib/format";

export interface CompositionSlice {
  name: string;
  value: number;
  color: string;
}

/**
 * 도넛 그래프만 담당한다. CompositionDonut이 이 모듈을 동적 import 하므로
 * recharts는 차트가 실제로 마운트될 때만 내려받는다.
 */
export function CompositionPie({ slices }: { slices: CompositionSlice[] }) {
  const reduced = useReducedMotion();

  return (
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
          isAnimationActive={!reduced}
        >
          {slices.map((slice) => (
            <Cell key={slice.name} fill={slice.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatKRW(Number(value))} />
      </PieChart>
    </ResponsiveContainer>
  );
}
