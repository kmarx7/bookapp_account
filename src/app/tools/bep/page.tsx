"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatBlock } from "@/components/ui/StatBlock";
import { FieldRow } from "@/components/forms/FieldRow";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import { calcBEP } from "@/lib/calculations/bep";
import { useAppStore } from "@/store/useAppStore";
import { formatKRW, formatPercent } from "@/lib/format";

export default function BepPage() {
  const bep = useAppStore((state) => state.tools.bep);
  const updateTool = useAppStore((state) => state.updateTool);
  const result = calcBEP(bep);

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
              <CurrencyInput
                value={bep.fixedCost}
                onChange={(value) => updateTool("bep", { ...bep, fixedCost: value })}
              />
            </FieldRow>
            <FieldRow label="변동비 (월)">
              <CurrencyInput
                value={bep.variableCost}
                onChange={(value) => updateTool("bep", { ...bep, variableCost: value })}
              />
            </FieldRow>
            <FieldRow label="매출 (월)">
              <CurrencyInput
                value={bep.revenue}
                onChange={(value) => updateTool("bep", { ...bep, revenue: value })}
              />
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
