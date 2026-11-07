"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatBlock } from "@/components/ui/StatBlock";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import { FieldRow } from "@/components/forms/FieldRow";
import { refundEffect, type RefundUse } from "@/lib/calculations/taxRefund";
import { formatKRW } from "@/lib/format";

const USE_OPTIONS: { value: RefundUse; label: string }[] = [
  { value: "spend", label: "소비" },
  { value: "asset", label: "자산 (적금·투자)" },
  { value: "debt", label: "부채 상환" },
];

const CHECKS = ["이직", "연봉 인상", "보험 가입/해지", "병원비 증가"];

export default function TaxRefundPage() {
  const [lastYear, setLastYear] = useState(0);
  const [expected, setExpected] = useState(0);
  const [use, setUse] = useState<RefundUse>("debt");
  const [checks, setChecks] = useState<string[]>([]);

  const effect = refundEffect(expected, use);

  function toggleCheck(label: string) {
    setChecks((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label],
    );
  }

  return (
    <>
      <PageHeader
        title="연말정산 시뮬레이션"
        description="환급금은 보너스가 아니라 원가 반품입니다. 쓰기 전에 용처를 정하세요."
        backHref="/tools"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>입력</CardTitle>
          <div className="flex flex-col gap-4">
            <div className="divide-y divide-border">
              <FieldRow label="작년 환급액 (추납이면 음수)">
                <CurrencyInput value={lastYear} onChange={setLastYear} />
              </FieldRow>
              <FieldRow label="올해 예상 환급액">
                <CurrencyInput value={expected} onChange={setExpected} />
              </FieldRow>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-muted">올해 변동 사항</p>
              <div className="flex flex-wrap gap-2">
                {CHECKS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleCheck(label)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                      checks.includes(label)
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-surface text-muted hover:bg-brand-soft"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-muted">환급금 용처</p>
              <div className="flex flex-wrap gap-2">
                {USE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setUse(option.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                      use === option.value
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-surface text-muted hover:bg-brand-soft"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>자기자본 영향</CardTitle>
          <div className="flex flex-col gap-3">
            <StatBlock label="예상 환급액" value={formatKRW(expected)} />
            <StatBlock
              label="자기자본 증가"
              value={formatKRW(effect.equityDelta)}
              tone={effect.equityDelta > 0 ? "positive" : "neutral"}
              sub={effect.description}
            />
            <StatBlock label="작년 대비" value={formatKRW(expected - lastYear)} />
            <p className="rounded-xl bg-surface-muted px-4 py-3 text-xs text-muted">
              공제는 소득을 줄이고, 세액공제는 세금에서 직접 뺍니다. 영수증을 챙기지
              않으면 공제를 못 받으니, 올해는 병원·약국·교육비 영수증을 모아두세요.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
