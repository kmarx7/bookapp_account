"use client";

import dynamic from "next/dynamic";

/**
 * recharts를 쓰는 차트를 동적 청크로 분리한다.
 * 정적으로 import 하면 라우트의 초기 청크(그리고 Next가 네비게이션 링크를 미리 받는
 * 프리페치)에 recharts 300KB+가 함께 실려 모든 페이지가 그 비용을 낸다.
 * 각 차트는 화면에 마운트될 때만 로드되고, 로딩 중에는 같은 높이의 자리만 차지한다(CLS 방지).
 */
const BAR_CHART_LOADING = () => <div className="h-[220px]" aria-hidden="true" />;

export const LazyMonthlyTrendChart = dynamic(
  () => import("@/components/charts/MonthlyTrendChart").then((mod) => mod.MonthlyTrendChart),
  { ssr: false, loading: BAR_CHART_LOADING },
);

export const LazyCashFlowBar = dynamic(
  () => import("@/components/charts/CashFlowBar").then((mod) => mod.CashFlowBar),
  { ssr: false, loading: BAR_CHART_LOADING },
);

export const LazyEquityLineChart = dynamic(
  () => import("@/components/charts/AnnualCharts").then((mod) => mod.EquityLineChart),
  { ssr: false, loading: BAR_CHART_LOADING },
);

export const LazyAssetDebtBarChart = dynamic(
  () => import("@/components/charts/AnnualCharts").then((mod) => mod.AssetDebtBarChart),
  { ssr: false, loading: BAR_CHART_LOADING },
);

export const LazyEquityRatioChart = dynamic(
  () => import("@/components/charts/AnnualCharts").then((mod) => mod.EquityRatioChart),
  { ssr: false, loading: BAR_CHART_LOADING },
);
