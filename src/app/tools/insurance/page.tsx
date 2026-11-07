"use client";

import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatBlock } from "@/components/ui/StatBlock";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import { summarizeInsurance } from "@/lib/calculations/insurance";
import { useAppStore } from "@/store/useAppStore";
import { formatKRW } from "@/lib/format";
import type { InsuranceItem } from "@/types";

const KIND_LABELS: Record<InsuranceItem["kind"], string> = {
  protection: "보장성만",
  savings: "저축성만",
  mixed: "혼합",
};

export default function InsurancePage() {
  const items = useAppStore((state) => state.tools.insurance);
  const updateTool = useAppStore((state) => state.updateTool);
  const summary = summarizeInsurance(items);

  function addItem() {
    updateTool("insurance", [
      ...items,
      {
        id: crypto.randomUUID(),
        name: "",
        monthlyPremium: 0,
        kind: "protection",
        savingsMonthly: 0,
      },
    ]);
  }

  function updateItem(id: string, patch: Partial<InsuranceItem>) {
    updateTool(
      "insurance",
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(id: string) {
    updateTool("insurance", items.filter((item) => item.id !== id));
  }

  return (
    <>
      <PageHeader
        title="보험 회계 분류"
        description="보장성은 비용, 저축성은 자산. 혼합은 분리해서 봅니다."
        backHref="/tools"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle
            hint={
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 text-brand"
              >
                <Plus size={14} /> 보험 추가
              </button>
            }
          >
            보험 목록
          </CardTitle>
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={item.name}
                    placeholder="보험 이름"
                    onChange={(event) => updateItem(item.id, { name: event.target.value })}
                    className="h-10 flex-1 rounded-xl border border-border px-3 text-sm outline-none transition-colors focus:border-brand"
                  />
                  <select
                    value={item.kind}
                    onChange={(event) =>
                      updateItem(item.id, {
                        kind: event.target.value as InsuranceItem["kind"],
                      })
                    }
                    className="h-10 rounded-xl border border-border bg-surface px-2 text-sm"
                  >
                    {Object.entries(KIND_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-lg p-2 text-muted transition-colors hover:bg-negative-soft hover:text-negative"
                    aria-label="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-muted">월 보험료</span>
                    <CurrencyInput
                      value={item.monthlyPremium}
                      onChange={(value) => updateItem(item.id, { monthlyPremium: value })}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-muted">월 적립금(자산)</span>
                    <CurrencyInput
                      value={item.savingsMonthly}
                      onChange={(value) => updateItem(item.id, { savingsMonthly: value })}
                    />
                  </label>
                  <label className="col-span-2 flex flex-col gap-1">
                    <span className="text-xs text-muted">해약환급금 (참고, 선택)</span>
                    <CurrencyInput
                      value={item.surrenderValue ?? 0}
                      onChange={(value) => updateItem(item.id, { surrenderValue: value })}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:sticky lg:top-6 lg:self-start">
          <CardTitle>분류 결과</CardTitle>
          <div className="flex flex-col gap-3">
            <StatBlock label="월 비용 (보장료)" value={formatKRW(summary.monthlyCost)} tone="negative" />
            <StatBlock label="월 자산 이체 (적립금)" value={formatKRW(summary.monthlyAsset)} tone="positive" />
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="연 비용" value={formatKRW(summary.annualCost)} tone="negative" />
              <StatBlock label="연 자산 이체" value={formatKRW(summary.annualAsset)} />
            </div>
            <StatBlock label="해약환급금 합계 (자산)" value={formatKRW(summary.surrenderValue)} />
            <p className="rounded-xl bg-surface-muted px-4 py-3 text-xs text-muted">
              보험료를 전부 비용으로 보지 마세요. 적립금은 나중에 돌아오는 자산입니다.
              다만 유동성이 낮고 물가상승률의 영향을 받습니다.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
