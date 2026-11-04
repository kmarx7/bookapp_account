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
import { formatDate, formatKRW } from "@/lib/format";
import type { BalanceSheet as BalanceSheetType } from "@/types";

export default function BalanceSheetPage() {
  const userId = useAppStore((state) => state.user?.id ?? "local");
  const balanceSheets = useAppStore((state) => state.balanceSheets);
  const upsert = useAppStore((state) => state.upsertBalanceSheet);
  const removeBalanceSheet = useAppStore((state) => state.removeBalanceSheet);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    </>
  );
}
