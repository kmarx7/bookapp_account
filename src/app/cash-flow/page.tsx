"use client";

import { useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { MonthSwitcher } from "@/components/ui/MonthSwitcher";
import { StatBlock, toneForValue } from "@/components/ui/StatBlock";
import { FieldGroup, FieldRow } from "@/components/forms/FieldRow";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import { Sheet, SheetGroup, SheetRow } from "@/components/statement/Sheet";
import { ViewTabs, type SheetView } from "@/components/statement/ViewTabs";
import { SummaryBar } from "@/components/statement/SummaryBar";
import { SampleDataCard } from "@/components/statement/SampleDataCard";
import { LazyCashFlowBar as CashFlowBar } from "@/components/charts/lazy";
import { useSelectedMonth } from "@/hooks/useSelectedMonth";
import { useAppStore } from "@/store/useAppStore";
import {
  calcCashFlow,
  cashFlowSectionsFromIncomeStatement,
  createCashFlow,
} from "@/lib/calculations/cashFlow";
import { formatKRW } from "@/lib/format";
import type { CashFlow, CashFlowSection } from "@/types";

const SECTIONS: {
  key: "operating" | "investing" | "financing";
  title: string;
  netLabel: string;
}[] = [
  { key: "operating", title: "영업활동", netLabel: "순영업현금흐름" },
  { key: "investing", title: "투자활동", netLabel: "순투자현금흐름" },
  { key: "financing", title: "재무활동", netLabel: "순재무현금흐름" },
];

export default function CashFlowPage() {
  const { year, month, label, prev, next } = useSelectedMonth();
  const userName = useAppStore((state) => state.user?.nickname);
  const userId = useAppStore((state) => state.user?.id ?? "local");
  const record = useAppStore((state) =>
    state.cashFlows.find((item) => item.year === year && item.month === month),
  );
  const upsert = useAppStore((state) => state.upsertCashFlow);
  const statement = useAppStore((state) =>
    state.incomeStatements.find(
      (item) => item.year === year && item.month === month,
    ),
  );
  const [view, setView] = useState<SheetView>("input");
  const [message, setMessage] = useState("");

  const current = record ?? createCashFlow(userId, year, month);
  const computed = calcCashFlow(current);

  const hasData =
    current.operating.inflow !== 0 ||
    current.operating.outflow !== 0 ||
    current.investing.inflow !== 0 ||
    current.investing.outflow !== 0 ||
    current.financing.inflow !== 0 ||
    current.financing.outflow !== 0 ||
    current.beginningCash !== 0;

  function update(patch: Partial<CashFlow>) {
    upsert({ ...current, ...patch, userId, updatedAt: new Date().toISOString() });
  }

  function applySample() {
    update({
      operating: { inflow: 3_350_000, outflow: 2_560_000 },
      investing: { inflow: 0, outflow: 300_000 },
      financing: { inflow: 0, outflow: 230_000 },
      beginningCash: 1_200_000,
    });
  }

  function updateSection(
    key: "operating" | "investing" | "financing",
    patch: Partial<CashFlowSection>,
  ) {
    update({ [key]: { ...current[key], ...patch } } as Partial<CashFlow>);
  }

  function importFromIncome() {
    if (!statement) {
      setMessage(`${label} 손익계산서가 없습니다. 먼저 손익계산서를 작성해 주세요.`);
      return;
    }

    const imported = cashFlowSectionsFromIncomeStatement(statement);
    update({
      operating: imported.operating,
      investing: { ...current.investing, outflow: imported.investingOutflow },
      financing: { ...current.financing, outflow: imported.financingOutflow },
    });
    setMessage(
      `${label} 손익계산서에서 영업·투자·재무 현금흐름을 불러왔습니다.`,
    );
  }

  const sectionNet = {
    operating: computed.opNet,
    investing: computed.invNet,
    financing: computed.finNet,
  };

  return (
    <>
      <PageHeader
        title="월간 현금흐름표"
        description="영업·투자·재무활동의 현금 흐름을 정리합니다."
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <MonthSwitcher label={label} onPrev={prev} onNext={next} />
        <button
          type="button"
          onClick={importFromIncome}
          className="inline-flex h-9 items-center gap-1 rounded-xl bg-brand-soft px-3 text-xs font-medium text-brand transition-colors hover:bg-border"
        >
          <Download size={14} /> 불러오기
        </button>
      </div>

      {message ? (
        <p className="mb-3 text-xs text-muted">{message}</p>
      ) : null}
      {!statement ? (
        <p className="mb-3 text-xs text-muted">
          <Link href="/income" className="text-brand hover:underline">
            {label} 손익계산서 작성하러 가기
          </Link>{" "}
          — 작성해 두면 영업·투자·재무 현금흐름을 한 번에 불러올 수 있습니다.
        </p>
      ) : null}

      <ViewTabs view={view} onChange={setView} />

      {view === "input" ? (
        <>
        <SummaryBar
          className="mb-3 lg:hidden"
          items={[
            { label: "기초 현금", value: formatKRW(current.beginningCash) },
            {
              label: "순증가(순현금흐름)",
              value: formatKRW(computed.netIncrease),
            },
            {
              label: "기말 현금잔고",
              value: formatKRW(computed.endingCash),
              tone: computed.netIncrease < 0 ? "neg" : "pos",
            },
          ]}
          operators={["+"]}
        />
        {!hasData ? (
          <div className="mb-3">
            <SampleDataCard onApply={applySample} />
          </div>
        ) : null}
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
              <StatBlock label="순영업현금흐름" value={formatKRW(computed.opNet)} tone={toneForValue(computed.opNet)} placeholder={!hasData} />
              <StatBlock label="순투자현금흐름" value={formatKRW(computed.invNet)} tone={toneForValue(computed.invNet)} placeholder={!hasData} />
              <StatBlock label="순재무현금흐름" value={formatKRW(computed.finNet)} tone={toneForValue(computed.finNet)} placeholder={!hasData} />
              <StatBlock label="순현금증가액" value={formatKRW(computed.netIncrease)} tone={toneForValue(computed.netIncrease)} placeholder={!hasData} />
              <StatBlock label="기말 현금잔고" value={formatKRW(computed.endingCash)} placeholder={!hasData} />
            </div>
          </Card>
        </div>
        <Card className="mt-4">
          <CardTitle hint="영업 · 투자 · 재무">활동별 순현금흐름</CardTitle>
          <CashFlowBar
            data={[
              { name: "영업", value: computed.opNet },
              { name: "투자", value: computed.invNet },
              { name: "재무", value: computed.finNet },
            ]}
          />
        </Card>
        </>
      ) : (
        <Sheet
          title="월간 현금흐름표"
          meta={`${year}년 ${month}월`}
          userName={userName}
        >
          {SECTIONS.map((section) => (
            <tbody key={section.key}>
              <SheetGroup label={section.title} />
              <SheetRow label="현금 유입" value={formatKRW(current[section.key].inflow)} indent />
              <SheetRow
                label="현금 유출"
                value={formatKRW(current[section.key].outflow)}
                indent
                tone="negative"
              />
              <SheetRow
                label={section.netLabel}
                value={formatKRW(sectionNet[section.key])}
                strong
                tone={sectionNet[section.key] < 0 ? "negative" : "positive"}
              />
            </tbody>
          ))}
          <tbody>
            <SheetRow
              label="순현금증가액"
              value={formatKRW(computed.netIncrease)}
              strong
              tone={computed.netIncrease < 0 ? "negative" : "positive"}
            />
            <SheetRow label="기초 현금잔고" value={formatKRW(current.beginningCash)} />
            <SheetRow label="기말 현금잔고" value={formatKRW(computed.endingCash)} strong />
          </tbody>
        </Sheet>
      )}
    </>
  );
}
