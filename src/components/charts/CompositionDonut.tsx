"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { formatKRW, formatPercent } from "@/lib/format";
import type { CompositionSlice } from "@/components/charts/CompositionPie";

export type { CompositionSlice };

/**
 * CompositionDonut은 목록(범례)을 즉시 그리고 도넛만 동적 import 한다.
 * recharts는 이 동적 청크에만 존재하므로 라우트 프리페치에 실려 나가지 않는다.
 */
const LazyCompositionPie = dynamic(
  () => import("@/components/charts/CompositionPie").then((mod) => mod.CompositionPie),
  {
    ssr: false,
    loading: () => <div className="h-full w-full" aria-hidden="true" />,
  },
);

type PieProps = ComponentProps<typeof LazyCompositionPie>;

export function CompositionDonut({
  data,
  total,
  title = "구성 비율",
  emptyLabel = "표시할 데이터가 없습니다.",
}: {
  data: CompositionSlice[];
  total: number;
  title?: string;
  emptyLabel?: string;
}) {
  const slices = data.filter((slice) => (slice.value || 0) > 0);

  if (total <= 0 || slices.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">{emptyLabel}</p>
    );
  }

  const description = slices
    .map(
      (slice) =>
        `${slice.name} ${formatKRW(slice.value)} (${formatPercent(
          total ? slice.value / total : 0,
        )})`,
    )
    .join(" / ");

  const pieProps: PieProps = { slices };

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <figure
        className="m-0 h-44 w-44 shrink-0"
        role="img"
        aria-label={`${title}. ${description}`}
      >
        <div aria-hidden="true" className="h-full w-full">
          <LazyCompositionPie {...pieProps} />
        </div>
      </figure>
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
