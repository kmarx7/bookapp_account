"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatBlock, toneForValue } from "@/components/ui/StatBlock";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { MonthSwitcher } from "@/components/ui/MonthSwitcher";
import { Gauge } from "@/components/ui/Gauge";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { courseStats } from "@/lib/course";
import { LazyMonthlyTrendChart as MonthlyTrendChart } from "@/components/charts/lazy";
import { YearDiary } from "@/components/home/YearDiary";
import { useSelectedMonth } from "@/hooks/useSelectedMonth";
import { useAppStore } from "@/store/useAppStore";
import { calcBalanceSheet } from "@/lib/calculations/balanceSheet";
import { calcIncomeStatement } from "@/lib/calculations/incomeStatement";
import { AUDIT_OPINION_LABELS } from "@/lib/constants";
import { formatKRW, formatPercent, formatDate } from "@/lib/format";

export default function HomePage() {
  const { year, month, label, prev, next, goTo } = useSelectedMonth();
  const user = useAppStore((state) => state.user);
  const income = useAppStore((state) =>
    state.incomeStatements.find((item) => item.year === year && item.month === month),
  );
  const balanceSheet = useAppStore((state) =>
    [...state.balanceSheets].sort((a, b) => b.baseDate.localeCompare(a.baseDate))[0],
  );
  const annual = useAppStore((state) =>
    state.annualTrackings.find((item) => item.year === year),
  );
  const incomeStatements = useAppStore((state) => state.incomeStatements);
  const cashFlows = useAppStore((state) => state.cashFlows);
  const learn = courseStats(useAppStore());

  const trend = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(base.getFullYear(), base.getMonth() - 5 + index, 1);
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const record = incomeStatements.find(
        (item) => item.year === y && item.month === m,
      );
      const computedIncome = record ? calcIncomeStatement(record) : null;
      return {
        label: `${m}월`,
        gross: computedIncome?.grossProfit ?? 0,
        expense: computedIncome?.totalExpenses ?? 0,
      };
    });
  }, [incomeStatements]);

  const incomeComputed = income ? calcIncomeStatement(income) : null;
  const balanceComputed = balanceSheet ? calcBalanceSheet(balanceSheet) : null;

  const recent = [...incomeStatements]
    .map((item) => ({ id: item.id, label: `${item.year}년 ${item.month}월 손익계산서`, at: item.updatedAt }))
    .concat(
      cashFlows.map((item) => ({ id: `cf-${item.id}`, label: `${item.year}년 ${item.month}월 현금흐름표`, at: item.updatedAt })),
    )
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title={`${user?.nickname ?? "대표"}님의 결산`}
        description={user ? `설립일 ${formatDate(user.foundedAt)}` : undefined}
      />

      <div className="mb-4">
        <YearDiary
          year={year}
          selectedMonth={month}
          onSelect={(nextMonth) => goTo(year, nextMonth)}
        />
      </div>

      <div className="mb-4">
        <MonthSwitcher label={label} onPrev={prev} onNext={next} />
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardTitle hint={`${learn.done} / ${learn.total} 완료`}>학습 코스</CardTitle>
          <Gauge ratio={learn.ratio} label="코스 진행" />
          {learn.next ? (
            <Link
              href={`/learn/${learn.next.id}`}
              className="mt-4 flex items-center justify-between rounded-xl bg-brand-soft px-4 py-3 transition-colors hover:bg-border"
            >
              <span className="text-sm font-medium text-brand">
                다음 실습 · {learn.next.title}
              </span>
              <ChevronRight size={18} className="text-brand" />
            </Link>
          ) : (
            <p className="mt-4 text-sm text-positive">
              17개 실습을 모두 완료했습니다.
            </p>
          )}
        </Card>

        <Card>
          <CardTitle hint="손익계산서">이번 달 요약</CardTitle>
          {incomeComputed ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatBlock label="매출총이익" value={formatKRW(incomeComputed.grossProfit)} />
              <StatBlock label="영업비용" value={formatKRW(incomeComputed.totalExpenses)} tone="negative" />
              <StatBlock
                label="영업이익(순이익)"
                value={formatKRW(incomeComputed.operatingIncome)}
                tone={toneForValue(incomeComputed.operatingIncome)}
              />
            </div>
          ) : (
            <EmptyState
              title="이번 달 손익계산서가 없습니다"
              description="매출과 비용을 입력하면 순이익이 자동으로 계산됩니다."
              action={
                <Link
                  href="/income"
                  className="inline-flex h-9 items-center rounded-xl bg-brand px-3 text-sm text-white"
                >
                  손익계산서 작성
                </Link>
              }
            />
          )}
        </Card>

        <Card>
          <CardTitle hint="최근 6개월">손익 추이</CardTitle>
          <MonthlyTrendChart data={trend} />
        </Card>

        <Card>
          <CardTitle
            hint={balanceSheet ? `기준일 ${formatDate(balanceSheet.baseDate)}` : undefined}
          >
            재무상태표 요약
          </CardTitle>
          {balanceComputed ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatBlock label="자산" value={formatKRW(balanceComputed.totalAssets)} />
                <StatBlock label="부채" value={formatKRW(balanceComputed.totalDebts)} tone="negative" />
                <StatBlock
                  label="자기자본"
                  value={formatKRW(balanceComputed.equity)}
                  tone={toneForValue(balanceComputed.equity)}
                />
              </div>
              <Gauge ratio={balanceComputed.equityRatio} label="자기자본 비율" />
            </div>
          ) : (
            <EmptyState
              title="아직 재무상태표가 없습니다"
              description="자산과 부채를 등기하면 자기자본이 계산됩니다."
              action={
                <Link
                  href="/balance-sheet"
                  className="inline-flex h-9 items-center rounded-xl bg-brand px-3 text-sm text-white"
                >
                  재무상태표 작성
                </Link>
              }
            />
          )}
        </Card>

        <Card>
          <CardTitle hint={`${year}년`}>감사의견 상태</CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              {annual?.auditOpinion
                ? `올해 의견: ${AUDIT_OPINION_LABELS[annual.auditOpinion]}`
                : "아직 감사의견을 작성하지 않았습니다."}
            </p>
            <Badge tone={annual?.auditOpinion ? "positive" : "neutral"}>
              {annual?.auditOpinion ? AUDIT_OPINION_LABELS[annual.auditOpinion] : "미작성"}
            </Badge>
          </div>
          <Link
            href="/annual"
            className="mt-4 inline-flex text-sm font-medium text-brand hover:underline"
          >
            연간 추적에서 서명하기 →
          </Link>
        </Card>

        <Card>
          <CardTitle>최근 활동</CardTitle>
          {recent.length > 0 ? (
            <ul className="flex flex-col divide-y divide-border">
              {recent.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-brand-dark">{item.label}</span>
                  <span className="num text-xs text-muted">{formatDate(item.at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">아직 기록이 없습니다.</p>
          )}
        </Card>

        <Card>
          <CardTitle>자기자본 비율 게이지</CardTitle>
          <p className="text-sm text-muted">
            {balanceComputed
              ? `현재 자기자본 비율은 ${formatPercent(balanceComputed.equityRatio)}입니다.`
              : "재무상태표를 작성하면 비율이 표시됩니다."}
          </p>
        </Card>

        <InstallPrompt />
      </div>

      <Link
        href="/income"
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform hover:scale-105 print:hidden md:bottom-8 md:right-8"
        aria-label="빠른 입력"
      >
        <Plus size={24} />
      </Link>
    </>
  );
}
