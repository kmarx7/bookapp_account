"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";

const STEPS = [
  {
    title: "개념 잡기",
    body: "왜 가계부가 아니라 결산인지, 학습 코스 1장에서 5분.",
    href: "/learn/ch01",
    action: "1장 보기",
  },
  {
    title: "이번 달 손익계산서",
    body: "실수령액·고정비·변동비를 넣으면 영업이익(순이익)이 자동 계산됩니다.",
    href: "/income",
    action: "손익계산서 입력",
  },
  {
    title: "재무상태표 등기",
    body: "자산과 부채를 적으면 자기자본(내 몸값)이 남습니다.",
    href: "/balance-sheet",
    action: "재무상태표 작성",
  },
];

const NEXT_LINKS = [
  { label: "장표 · PDF", href: "/income" },
  { label: "도구함 7종", href: "/tools" },
  { label: "회계 달력", href: "/calendar" },
  { label: "연간 감사의견", href: "/annual" },
];

/**
 * 홈의 사용법 안내.
 * 데이터가 하나도 없는 첫 사용자는 펼친 상태로, 이미 기록이 있으면 한 줄로 접힌 상태로 시작한다.
 */
export function OnboardingGuide() {
  const incomeCount = useAppStore((state) => state.incomeStatements.length);
  const balanceCount = useAppStore((state) => state.balanceSheets.length);
  const courseDone = useAppStore(
    (state) => state.courseProgress.completedSteps.length,
  );
  const [open, setOpen] = useState<boolean | null>(null);

  const isNew = incomeCount === 0 && balanceCount === 0 && courseDone === 0;
  const expanded = open ?? isNew;

  if (!expanded) {
    return (
      <button
        type="button"
        aria-expanded={false}
        onClick={() => setOpen(true)}
        className="mb-4 flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-brand"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-brand">
            이 앱은 가계부가 아니라 &lsquo;재무제표&rsquo;입니다
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted">
            사용법 보기 · 학습 코스 → 손익계산서 → 재무상태표
          </span>
        </span>
        <ChevronDown size={18} className="shrink-0 text-brand" />
      </button>
    );
  }

  return (
    <Card className="mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-brand">
            이 앱은 가계부가 아니라 &lsquo;재무제표&rsquo;입니다
          </h2>
          <p className="mt-1 text-sm text-muted">
            매달 손익을, 매년 자본을 남깁니다. 기록이 아니라 결산이 목적입니다.
          </p>
        </div>
        <button
          type="button"
          aria-expanded
          aria-label="사용법 접기"
          onClick={() => setOpen(false)}
          className="inline-flex min-h-8 min-w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-brand-soft"
        >
          <ChevronUp size={18} />
        </button>
      </div>

      <ol className="mt-4 flex flex-col gap-3">
        {STEPS.map((step, index) => (
          <li key={step.href} className="flex gap-3">
            <span className="num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-brand-dark">{step.title}</p>
              <p className="mt-0.5 text-xs text-muted">{step.body}</p>
              <Link
                href={step.href}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                {step.action}
                <ArrowRight size={13} />
              </Link>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted">그다음</span>
        {NEXT_LINKS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="inline-flex items-center rounded-lg bg-surface-muted px-2.5 py-1 text-brand transition-colors hover:bg-border"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-1 rounded-xl bg-surface-muted px-4 py-3 text-xs text-muted">
        <li>데이터는 이 브라우저에만 저장됩니다. 로그인하면 기기 간에 동기화됩니다.</li>
        <li>설정 → 데이터 백업(JSON)으로 주기적으로 내보내 두세요.</li>
      </ul>
    </Card>
  );
}
