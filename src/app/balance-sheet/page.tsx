"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatBlock, toneForValue } from "@/components/ui/StatBlock";
import { Gauge } from "@/components/ui/Gauge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, FieldRow } from "@/components/forms/FieldRow";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import { Sheet, SheetGroup, SheetRow } from "@/components/statement/Sheet";
import { ViewTabs, type SheetView } from "@/components/statement/ViewTabs";
import { CompositionDonut } from "@/components/charts/CompositionDonut";
import { useAppStore } from "@/store/useAppStore";
import {
  calcBalanceSheet,
  createBalanceSheet,
} from "@/lib/calculations/balanceSheet";
import {
  CURRENT_ASSET_LABELS,
  DEBT_LABELS,
  FIXED_ASSET_LABELS,
} from "@/lib/constants";
import { formatDate, formatKRW, formatPercent } from "@/lib/format";
import type { BalanceSheet as BalanceSheetType } from "@/types";

export default function BalanceSheetPage() {
  const userName = useAppStore((state) => state.user?.nickname);
  const userId = useAppStore((state) => state.user?.id ?? "local");
  const balanceSheets = useAppStore((state) => state.balanceSheets);
  const upsert = useAppStore((state) => state.upsertBalanceSheet);
  const removeBalanceSheet = useAppStore((state) => state.removeBalanceSheet);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<SheetView>("input");

  const latest = useMemo(
    () =>
      [...balanceSheets].sort((a, b) => b.baseDate.localeCompare(a.baseDate))[0],
    [balanceSheets],
  );
  const current =
    balanceSheets.find((item) => item.id === selectedId) ?? latest;

  if (!current) {
    return (
      <>
        <PageHeader title="재무상태표" description="자산 − 부채 = 자기자본" />
        <EmptyState
          title="아직 등기된 재무상태표가 없습니다"
          description="자산과 부채를 입력하면 자기자본과 비율이 자동 계산됩니다."
          action={
            <Button
              onClick={() => {
                const next = createBalanceSheet(userId);
                upsert(next);
                setSelectedId(next.id);
              }}
            >
              <Plus size={16} />
              첫 등기 시작
            </Button>
          }
        />
      </>
    );
  }

  const computed = calcBalanceSheet(current);

  function update(patch: Partial<BalanceSheetType>) {
    if (!current) return;
    upsert({ ...current, ...patch, userId, updatedAt: new Date().toISOString() });
  }

  return (
    <>
      <PageHeader
        title="재무상태표"
        description={`기준일 ${formatDate(current.baseDate)} · 자산 − 부채 = 자기자본`}
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const next = createBalanceSheet(userId);
              upsert(next);
              setSelectedId(next.id);
            }}
          >
            <Plus size={16} />
            새 결산
          </Button>
        }
      />

      {balanceSheets.length > 1 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {[...balanceSheets]
            .sort((a, b) => b.baseDate.localeCompare(a.baseDate))
            .map((sheet) => (
              <button
                key={sheet.id}
                type="button"
                onClick={() => setSelectedId(sheet.id)}
                className={`num rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  sheet.id === current.id
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-surface text-muted hover:bg-brand-soft"
                }`}
              >
                {formatDate(sheet.baseDate)}
              </button>
            ))}
        </div>
      ) : null}

      <ViewTabs view={view} onChange={setView} />

      {view === "input" ? (
        <>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardTitle hint="입력">자산 / 부채</CardTitle>
            <div className="flex flex-col gap-4">
              <FieldGroup title="유동자산">
                {(Object.keys(CURRENT_ASSET_LABELS) as (keyof typeof CURRENT_ASSET_LABELS)[]).map(
                  (key) => (
                    <FieldRow key={key} label={CURRENT_ASSET_LABELS[key]}>
                      <CurrencyInput
                        value={current.currentAssets[key]}
                        onChange={(value) =>
                          update({
                            currentAssets: { ...current.currentAssets, [key]: value },
                          })
                        }
                      />
                    </FieldRow>
                  ),
                )}
              </FieldGroup>

              <FieldGroup title="고정자산">
                {(Object.keys(FIXED_ASSET_LABELS) as (keyof typeof FIXED_ASSET_LABELS)[]).map(
                  (key) => (
                    <FieldRow key={key} label={FIXED_ASSET_LABELS[key]}>
                      <CurrencyInput
                        value={current.fixedAssets[key]}
                        onChange={(value) =>
                          update({
                            fixedAssets: { ...current.fixedAssets, [key]: value },
                          })
                        }
                      />
                    </FieldRow>
                  ),
                )}
              </FieldGroup>

              <FieldGroup title="부채">
                {(Object.keys(DEBT_LABELS) as (keyof typeof DEBT_LABELS)[]).map((key) => (
                  <FieldRow key={key} label={DEBT_LABELS[key]}>
                    <CurrencyInput
                      value={current.debts[key]}
                      onChange={(value) =>
                        update({ debts: { ...current.debts, [key]: value } })
                      }
                    />
                  </FieldRow>
                ))}
              </FieldGroup>

              <div className="flex justify-end">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    removeBalanceSheet(current.id);
                    setSelectedId(null);
                  }}
                >
                  <Trash2 size={14} />
                  이 결산 삭제
                </Button>
              </div>
            </div>
          </Card>

          <Card className="lg:sticky lg:top-6 lg:self-start">
            <CardTitle>자동 계산 결과</CardTitle>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <StatBlock label="유동자산" value={formatKRW(computed.totalCurrentAssets)} />
                <StatBlock label="고정자산" value={formatKRW(computed.totalFixedAssets)} />
              </div>
              <StatBlock label="자산 총계" value={formatKRW(computed.totalAssets)} />
              <StatBlock label="부채 총계" value={formatKRW(computed.totalDebts)} tone="negative" />
              <StatBlock
                label="자기자본"
                value={formatKRW(computed.equity)}
                tone={toneForValue(computed.equity)}
              />
              <div className="pt-2">
                <Gauge ratio={computed.equityRatio} label="자기자본 비율" />
              </div>
            </div>
          </Card>
        </div>
        <Card className="mt-4">
          <CardTitle hint="유동자산 · 고정자산">자산 구성</CardTitle>
          <CompositionDonut
            total={computed.totalAssets}
            data={[
              { name: "유동자산", value: computed.totalCurrentAssets, color: "#1b2a4a" },
              { name: "고정자산", value: computed.totalFixedAssets, color: "#4b6a9b" },
            ]}
          />
        </Card>
        </>
      ) : (
        <Sheet
          title="재무상태표"
          meta={`기준일 ${formatDate(current.baseDate)}`}
          userName={userName}
        >
          <tbody>
            <SheetGroup label="Ⅰ. 유동자산" />
            {(Object.keys(CURRENT_ASSET_LABELS) as (keyof typeof CURRENT_ASSET_LABELS)[]).map((key) => (
              <SheetRow
                key={key}
                label={CURRENT_ASSET_LABELS[key]}
                value={formatKRW(current.currentAssets[key])}
                indent
              />
            ))}
            <SheetRow label="유동자산 소계" value={formatKRW(computed.totalCurrentAssets)} strong />
          </tbody>
          <tbody>
            <SheetGroup label="Ⅱ. 고정자산" />
            {(Object.keys(FIXED_ASSET_LABELS) as (keyof typeof FIXED_ASSET_LABELS)[]).map((key) => (
              <SheetRow
                key={key}
                label={FIXED_ASSET_LABELS[key]}
                value={formatKRW(current.fixedAssets[key])}
                indent
              />
            ))}
            <SheetRow label="고정자산 소계" value={formatKRW(computed.totalFixedAssets)} strong />
          </tbody>
          <tbody>
            <SheetRow label="자산 총액" value={formatKRW(computed.totalAssets)} strong />
          </tbody>
          <tbody>
            <SheetGroup label="부채" />
            {(Object.keys(DEBT_LABELS) as (keyof typeof DEBT_LABELS)[]).map((key) => (
              <SheetRow
                key={key}
                label={DEBT_LABELS[key]}
                value={formatKRW(current.debts[key])}
                indent
              />
            ))}
            <SheetRow label="부채 총액" value={formatKRW(computed.totalDebts)} strong tone="negative" />
          </tbody>
          <tbody>
            <SheetRow
              label="자기자본 (자산 − 부채)"
              value={formatKRW(computed.equity)}
              strong
              tone={computed.equity < 0 ? "negative" : "positive"}
            />
            <SheetRow label="자기자본 비율" value={formatPercent(computed.equityRatio)} />
          </tbody>
        </Sheet>
      )}
    </>
  );
}
