"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatBlock } from "@/components/ui/StatBlock";
import { FieldRow } from "@/components/forms/FieldRow";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import { calcBEP } from "@/lib/calculations/bep";
import { formatKRW, formatPercent } from "@/lib/format";

export default function BepPage() {
  const [fixedCost, setFixedCost] = useState(1_000_000);
  const [variableCost, setVariableCost] = useState(600_000);
  const [revenue, setRevenue] = useState(2_000_000);
  const result = calcBEP({ fixedCost, variableCost, revenue });

  return (
    <>
      <PageHeader
        title="손익분기점 계산기"
        description="매출이 비용과 같아지는 지점(BEP)과 안전마진을 계산합니다."
        backHref="/tools"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>입력</CardTitle>
          <div className="divide-y divide-border">
            <FieldRow label="고정비 (월)">
              <CurrencyInput value={fixedCost} onChange={setFixedCost} />
            </FieldRow>
            <FieldRow label="변동비 (월)">
              <CurrencyInput value={variableCost} onChange={setVariableCost} />
            </FieldRow>
            <FieldRow label="매출 (월)">
              <CurrencyInput value={revenue} onChange={setRevenue} />
            </FieldRow>
          </div>
        </Card>
        <Card>
          <CardTitle>결과</CardTitle>
          {result.feasible ? (
            <div className="flex flex-col gap-3">
              <StatBlock label="공헌이익" value={formatKRW(result.contribution)} />
              <StatBlock label="공헌이익률" value={formatPercent(result.contributionRatio)} />
              <StatBlock label="손익분기 매출" value={formatKRW(result.bepRevenue)} />
              <StatBlock
                label="안전마진"
                value={formatKRW(result.safetyMargin)}
                tone={result.safetyMargin >= 0 ? "positive" : "negative"}
                sub={`안전마진율 ${formatPercent(result.safetyMarginRatio)}`}
              />
            </div>
          ) : (
            <p className="text-sm text-muted">
              변동비가 매출을 초과해 손익분기점을 계산할 수 없습니다.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
