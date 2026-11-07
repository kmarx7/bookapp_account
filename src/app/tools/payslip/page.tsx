"use client";

import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatBlock } from "@/components/ui/StatBlock";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import { analyzePayslip } from "@/lib/calculations/payslip";
import { useAppStore } from "@/store/useAppStore";
import { formatKRW, formatPercent } from "@/lib/format";
import type { PayslipItem } from "@/types";

export default function PayslipPage() {
  const items = useAppStore((state) => state.tools.payslip);
  const updateTool = useAppStore((state) => state.updateTool);
  const result = analyzePayslip(items);

  function addItem() {
    updateTool("payslip", [
      ...items,
      { id: crypto.randomUUID(), name: "", amount: 0, kind: "deduction" },
    ]);
  }

  function updateItem(id: string, patch: Partial<PayslipItem>) {
    updateTool(
      "payslip",
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(id: string) {
    updateTool("payslip", items.filter((item) => item.id !== id));
  }

  return (
    <>
      <PageHeader
        title="명세서 감사 도구"
        description="명세서 항목을 입력하면 원가 구조와 최적화 후보를 보여줍니다."
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
                <Plus size={14} /> 항목 추가
              </button>
            }
          >
            명세서 항목
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
                  value={item.kind}
                  onChange={(event) =>
                    updateItem(item.id, {
                      kind: event.target.value as PayslipItem["kind"],
                    })
                  }
                  className="h-11 rounded-xl border border-border bg-surface px-2 text-sm"
                >
                  <option value="income">수입</option>
                  <option value="deduction">공제</option>
                </select>
                <div className="w-32">
                  <CurrencyInput
                    value={item.amount}
                    onChange={(value) => updateItem(item.id, { amount: value })}
                  />
                </div>
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
          <CardTitle>분석 결과</CardTitle>
          <div className="flex flex-col gap-3">
            <StatBlock label="총 급여(수입)" value={formatKRW(result.gross)} />
            <StatBlock label="총 공제" value={formatKRW(result.totalDeduction)} tone="negative" />
            <StatBlock label="실수령액" value={formatKRW(result.net)} tone="positive" />
            <StatBlock label="공제 비율" value={formatPercent(result.deductionRatio)} />
            {result.optimizationCandidates.length > 0 ? (
              <div className="rounded-xl bg-surface-muted p-4">
                <p className="mb-2 text-xs font-semibold text-muted">최적화 후보 (공제 상위)</p>
                <ul className="flex flex-col gap-1.5">
                  {result.optimizationCandidates.map((line) => (
                    <li key={line.id} className="flex items-center justify-between text-sm">
                      <span className="text-brand-dark">{line.name || "(이름 없음)"}</span>
                      <span className="num text-muted">
                        {formatKRW(line.amount)} · {formatPercent(line.ratio)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </>
  );
}
