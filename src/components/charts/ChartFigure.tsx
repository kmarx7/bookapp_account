"use client";

import type { ReactNode } from "react";

/**
 * 차트를 스크린리더에 설명 가능한 단일 이미지로 노출한다.
 * 내부 SVG는 aria-hidden 처리하고, 바깥 figure가 데이터 요약을 aria-label로 전달한다.
 */
export function ChartFigure({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <figure className="m-0" role="img" aria-label={`${title}. ${description}`}>
      <div aria-hidden="true">{children}</div>
    </figure>
  );
}
