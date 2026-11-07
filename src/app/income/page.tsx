"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { MonthSwitcher } from "@/components/ui/MonthSwitcher";
import { StatBlock, toneForValue } from "@/components/ui/StatBlock";
import { FieldGroup, FieldRow } from "@/components/forms/FieldRow";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import { Sheet, SheetGroup, SheetRow } from "@/components/statement/Sheet";
import { ViewTabs, type SheetView } from "@/components/statement/ViewTabs";
import { CompositionDonut } from "@/components/charts/CompositionDonut";
import { useSelectedMonth } from "@/hooks/useSelectedMonth";
import { useAppStore } from "@/store/useAppStore";
import {
  calcIncomeStatement,
  createIncomeStatement,
  sumValues,
} from "@/lib/calculations/incomeStatement";
import {
  CAPITAL_LABELS,
  FIXED_COST_LABELS,
  INVESTMENT_COST_LABELS,
  VARIABLE_COST_LABELS,
} from "@/lib/constants";
import { formatKRW } from "@/lib/format";
import type { IncomeStatement } from "@/types";

export default function IncomePage() {
  const { year, month, label, prev, next } = useSelectedMonth();
  const userName = useAppStore((state) => state.user?.nickname);
  const userId = useAppStore((state) => state.user?.id ?? "local");
  const record = useAppStore((state) =>
    state.incomeStatements.find(
      (item) => item.year === year && item.month === month,
    ),
  );
  const upsert = useAppStore((state) => state.upsertIncomeStatement);
  const [view, setView] = useState<SheetView>("input");

  const current = record ?? createIncomeStatement(userId, year, month);
  const computed = calcIncomeStatement(current);

  function update(patch: Partial<IncomeStatement>) {
    upsert({ ...current, ...patch, userId, updatedAt: new Date().toISOString() });
  }

  return (
    <>
      <PageHeader
        title="월간 손익계산서"
        description="매출총이익에서 영업비용을 빼면 영업이익(순이익)이 됩니다."
      />

      <div className="mb-4">
        <MonthSwitcher label={label} onPrev={prev} onNext={next} />
      </div>

      <ViewTabs view={view} onChange={setView} />

      {view === "input" ? (
        <>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardTitle>입력</CardTitle>
            <div className="flex flex-col gap-4">
              <FieldGroup title="매출">
                <FieldRow label="실수령액">
                  <CurrencyInput
                    value={current.salaryNet}
                    onChange={(value) => update({ salaryNet: value })}
                  />
                </FieldRow>
                <FieldRow label="기타 수입">
                  <CurrencyInput
                    value={current.otherIncome}
                    onChange={(value) => update({ otherIncome: value })}
                  />
                </FieldRow>
              </FieldGroup>

              <FieldGroup title="고정비">
                {(Object.keys(FIXED_COST_LABELS) as (keyof typeof FIXED_COST_LABELS)[]).map(
                  (key) => (
                    <FieldRow key={key} label={FIXED_COST_LABELS[key]}>
                      <CurrencyInput
                        value={current.fixedCosts[key]}
                        onChange={(value) =>
                          update({
                            fixedCosts: { ...current.fixedCosts, [key]: value },
                          })
                        }
                      />
                    </FieldRow>
                  ),
                )}
              </FieldGroup>

              <FieldGroup title="변동비">
                {(Object.keys(VARIABLE_COST_LABELS) as (keyof typeof VARIABLE_COST_LABELS)[]).map(
                  (key) => (
                    <FieldRow key={key} label={VARIABLE_COST_LABELS[key]}>
                      <CurrencyInput
                        value={current.variableCosts[key]}
                        onChange={(value) =>
                          update({
                            variableCosts: { ...current.variableCosts, [key]: value },
                          })
                        }
                      />
                    </FieldRow>
                  ),
                )}
              </FieldGroup>

              <FieldGroup title="투자비">
                {(Object.keys(INVESTMENT_COST_LABELS) as (keyof typeof INVESTMENT_COST_LABELS)[]).map(
                  (key) => (
                    <FieldRow key={key} label={INVESTMENT_COST_LABELS[key]}>
                      <CurrencyInput
                        value={current.investmentCosts[key]}
                        onChange={(value) =>
                          update({
                            investmentCosts: {
                              ...current.investmentCosts,
                              [key]: value,
                            },
                          })
                        }
                      />
                    </FieldRow>
                  ),
                )}
              </FieldGroup>

              <FieldGroup title="자본 처리">
                {(Object.keys(CAPITAL_LABELS) as (keyof typeof CAPITAL_LABELS)[]).map(
                  (key) => (
                    <FieldRow key={key} label={CAPITAL_LABELS[key]}>
                      <CurrencyInput
                        value={current.capitalAllocation[key]}
                        onChange={(value) =>
                          update({
                            capitalAllocation: {
                              ...current.capitalAllocation,
                              [key]: value,
                            },
                          })
                        }
                      />
                    </FieldRow>
                  ),
                )}
              </FieldGroup>
            </div>
          </Card>

          <Card className="lg:sticky lg:top-6 lg:self-start">
            <CardTitle>자동 계산 결과</CardTitle>
            <div className="flex flex-col gap-3">
              <StatBlock label="매출총이익" value={formatKRW(computed.grossProfit)} />
              <div className="grid grid-cols-3 gap-3">
                <StatBlock label="고정비" value={formatKRW(computed.fixedTotal)} tone="negative" />
                <StatBlock label="변동비" value={formatKRW(computed.variableTotal)} tone="negative" />
                <StatBlock label="투자비" value={formatKRW(computed.investmentTotal)} tone="negative" />
              </div>
              <StatBlock label="영업비용 소계" value={formatKRW(computed.totalExpenses)} tone="negative" />
              <StatBlock
                label="영업이익(순이익)"
                value={formatKRW(computed.operatingIncome)}
                tone={toneForValue(computed.operatingIncome)}
                sub={computed.operatingIncome < 0 ? "적자 — 비용이 매출을 초과했습니다" : "흑자"}
              />
            </div>
          </Card>
        </div>
        <Card className="mt-4">
          <CardTitle hint="고정비 · 변동비 · 투자비">비용 구조</CardTitle>
          <CompositionDonut
            title="비용 구조"
            total={computed.totalExpenses}
            data={[
              { name: "고정비", value: computed.fixedTotal, color: "#1b2a4a" },
              { name: "변동비", value: computed.variableTotal, color: "#4b6a9b" },
              { name: "투자비", value: computed.investmentTotal, color: "#15803d" },
            ]}
          />
        </Card>
        </>
      ) : (
        <Sheet
          title="월간 손익계산서"
          meta={`${year}년 ${month}월 결산`}
          userName={userName}
        >
          <tbody>
            <SheetGroup label="매출" />
            <SheetRow label="월급 실수령액" value={formatKRW(current.salaryNet)} indent />
            <SheetRow label="기타 수입" value={formatKRW(current.otherIncome)} indent />
            <SheetRow label="매출총이익 소계" value={formatKRW(computed.grossProfit)} strong />
          </tbody>
          <tbody>
            <SheetGroup label="영업비용 · 고정비" />
            {(Object.keys(FIXED_COST_LABELS) as (keyof typeof FIXED_COST_LABELS)[]).map((key) => (
              <SheetRow
                key={key}
                label={FIXED_COST_LABELS[key]}
                value={formatKRW(current.fixedCosts[key])}
                indent
              />
            ))}
            <SheetRow label="고정비 소계" value={formatKRW(computed.fixedTotal)} strong />
          </tbody>
          <tbody>
            <SheetGroup label="영업비용 · 변동비" />
            {(Object.keys(VARIABLE_COST_LABELS) as (keyof typeof VARIABLE_COST_LABELS)[]).map((key) => (
              <SheetRow
                key={key}
                label={VARIABLE_COST_LABELS[key]}
                value={formatKRW(current.variableCosts[key])}
                indent
              />
            ))}
            <SheetRow label="변동비 소계" value={formatKRW(computed.variableTotal)} strong />
          </tbody>
          <tbody>
            <SheetGroup label="영업비용 · 투자비" />
            {(Object.keys(INVESTMENT_COST_LABELS) as (keyof typeof INVESTMENT_COST_LABELS)[]).map((key) => (
              <SheetRow
                key={key}
                label={INVESTMENT_COST_LABELS[key]}
                value={formatKRW(current.investmentCosts[key])}
                indent
              />
            ))}
            <SheetRow label="투자비 소계" value={formatKRW(computed.investmentTotal)} strong />
          </tbody>
          <tbody>
            <SheetRow
              label="영업비용 소계"
              value={formatKRW(computed.totalExpenses)}
              strong
              tone="negative"
            />
            <SheetRow
              label="영업이익(순이익)"
              value={formatKRW(computed.operatingIncome)}
              strong
              tone={computed.operatingIncome < 0 ? "negative" : "positive"}
            />
          </tbody>
          <tbody>
            <SheetGroup label="자본 처리" />
            {(Object.keys(CAPITAL_LABELS) as (keyof typeof CAPITAL_LABELS)[]).map((key) => (
              <SheetRow
                key={key}
                label={CAPITAL_LABELS[key]}
                value={formatKRW(current.capitalAllocation[key])}
                indent
              />
            ))}
            <SheetRow
              label="자본 처리 소계"
              value={formatKRW(sumValues(current.capitalAllocation))}
              strong
            />
          </tbody>
        </Sheet>
      )}
    </>
  );
}
