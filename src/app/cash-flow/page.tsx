"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { MonthSwitcher } from "@/components/ui/MonthSwitcher";
import { StatBlock, toneForValue } from "@/components/ui/StatBlock";
import { FieldGroup, FieldRow } from "@/components/forms/FieldRow";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import { useSelectedMonth } from "@/hooks/useSelectedMonth";
import { useAppStore } from "@/store/useAppStore";
import {
  calcCashFlow,
  createCashFlow,
} from "@/lib/calculations/cashFlow";
import { formatKRW } from "@/lib/format";
import type { CashFlow, CashFlowSection } from "@/types";

const SECTIONS: { key: "operating" | "investing" | "financing"; title: string }[] = [
  { key: "operating", title: "영업활동" },
  { key: "investing", title: "투자활동" },
  { key: "financing", title: "재무활동" },
];

export default function CashFlowPage() {
  const { year, month, label, prev, next } = useSelectedMonth();
  const userId = useAppStore((state) => state.user?.id ?? "local");
  const record = useAppStore((state) =>
    state.cashFlows.find((item) => item.year === year && item.month === month),
  );
  const upsert = useAppStore((state) => state.upsertCashFlow);

  const current = record ?? createCashFlow(userId, year, month);
  const computed = calcCashFlow(current);

  function update(patch: Partial<CashFlow>) {
    upsert({ ...current, ...patch, userId, updatedAt: new Date().toISOString() });
  }

  function updateSection(
    key: "operating" | "investing" | "financing",
    patch: Partial<CashFlowSection>,
  ) {
    update({ [key]: { ...current[key], ...patch } } as Partial<CashFlow>);
  }

  return (
    <>
      <PageHeader
        title="월간 현금흐름표"
        description="영업·투자·재무활동의 현금 흐름을 정리합니다."
      />

      <div className="mb-4">
        <MonthSwitcher label={label} onPrev={prev} onNext={next} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>입력</CardTitle>
          <div className="flex flex-col gap-4">
            {SECTIONS.map((section) => (
              <FieldGroup key={section.key} title={section.title}>
                <FieldRow label="현금 유입">
                  <CurrencyInput
                    value={current[section.key].inflow}
                    onChange={(value) => updateSection(section.key, { inflow: value })}
                  />
                </FieldRow>
                <FieldRow label="현금 유출">
                  <CurrencyInput
                    value={current[section.key].outflow}
                    onChange={(value) => updateSection(section.key, { outflow: value })}
                  />
                </FieldRow>
              </FieldGroup>
            ))}
            <FieldGroup title="현금 잔고">
              <FieldRow label="기초 현금">
                <CurrencyInput
                  value={current.beginningCash}
                  onChange={(value) => update({ beginningCash: value })}
                />
              </FieldRow>
            </FieldGroup>
          </div>
        </Card>

        <Card className="lg:sticky lg:top-6 lg:self-start">
          <CardTitle>자동 계산 결과</CardTitle>
          <div className="flex flex-col gap-3">
            <StatBlock label="순영업현금흐름" value={formatKRW(computed.opNet)} tone={toneForValue(computed.opNet)} />
            <StatBlock label="순투자현금흐름" value={formatKRW(computed.invNet)} tone={toneForValue(computed.invNet)} />
            <StatBlock label="순재무현금흐름" value={formatKRW(computed.finNet)} tone={toneForValue(computed.finNet)} />
            <StatBlock label="순현금증가액" value={formatKRW(computed.netIncrease)} tone={toneForValue(computed.netIncrease)} />
            <StatBlock label="기말 현금잔고" value={formatKRW(computed.endingCash)} />
          </div>
        </Card>
      </div>
    </>
  );
}
