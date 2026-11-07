"use client";

import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatBlock } from "@/components/ui/StatBlock";
import { Badge } from "@/components/ui/Badge";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import { summarizeFixedCosts } from "@/lib/calculations/fixedCosts";
import { FIXED_COST_PERIOD_LABELS } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";
import { formatKRW } from "@/lib/format";
import type { FixedCostItem } from "@/types";

export default function FixedCostsPage() {
  const items = useAppStore((state) => state.tools.fixedCosts);
  const updateTool = useAppStore((state) => state.updateTool);
  const summary = summarizeFixedCosts(items);

  function addItem() {
    updateTool("fixedCosts", [
      ...items,
      { id: crypto.randomUUID(), name: "", amount: 0, period: "monthly" },
    ]);
  }

  function updateItem(id: string, patch: Partial<FixedCostItem>) {
    updateTool(
      "fixedCosts",
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(id: string) {
    updateTool("fixedCosts", items.filter((item) => item.id !== id));
  }

  return (
    <>
      <PageHeader
        title="고정비 결산"
        description="구독·보험·할부 등 매달 나가는 고정비를 정리합니다."
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
                <Plus size={14} /> 고정비 추가
              </button>
            }
          >
            고정비 목록
          </CardTitle>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  value={item.name}
                  placeholder="항목명"
                  onChange={(event) => updateItem(item.id, { name: event.target.value })}
                  className="h-11 flex-1 rounded-xl border border-border px-3 text-sm outline-none transition-colors focus:border-brand"
                />
                <select
                  value={item.period}
                  onChange={(event) =>
                    updateItem(item.id, {
                      period: event.target.value as FixedCostItem["period"],
                    })
                  }
                  className="h-11 rounded-xl border border-border bg-surface px-2 text-sm"
                >
                  {Object.entries(FIXED_COST_PERIOD_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="w-32">
                  <CurrencyInput
                    value={item.amount}
                    onChange={(value) => updateItem(item.id, { amount: value })}
                  />
                </div>
                <label className="flex items-center gap-1 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={item.cancelCandidate ?? false}
                    onChange={(event) =>
                      updateItem(item.id, { cancelCandidate: event.target.checked })
                    }
                  />
                  해지
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-lg p-2 text-muted transition-colors hover:bg-negative-soft hover:text-negative"
                  aria-label="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>결산</CardTitle>
          <div className="flex flex-col gap-3">
            <StatBlock label="월 합계" value={formatKRW(summary.monthlyTotal)} />
            <StatBlock label="연 합계" value={formatKRW(summary.annualTotal)} tone="negative" />
            {summary.cancelCandidates.length > 0 ? (
              <div className="rounded-xl bg-surface-muted p-4">
                <p className="mb-2 text-xs font-semibold text-muted">해지 후보</p>
                <ul className="flex flex-col gap-1.5">
                  {summary.cancelCandidates.map((item) => (
                    <li key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-brand-dark">{item.name || "(이름 없음)"}</span>
                      <span className="num text-muted">{formatKRW(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Badge tone="neutral">해지 후보로 표시된 고정비가 없습니다</Badge>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
