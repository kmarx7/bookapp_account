"use client";

import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatBlock, toneForValue } from "@/components/ui/StatBlock";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import { summarizeInvestments } from "@/lib/calculations/investments";
import { useAppStore } from "@/store/useAppStore";
import { formatKRW, formatSignedPercent } from "@/lib/format";
import type { InvestmentItem } from "@/types";

export default function InvestmentsPage() {
  const items = useAppStore((state) => state.tools.investments);
  const updateTool = useAppStore((state) => state.updateTool);
  const summary = summarizeInvestments(items);

  function addItem() {
    updateTool("investments", [
      ...items,
      { id: crypto.randomUUID(), name: "", cost: 0, marketValue: 0 },
    ]);
  }

  function updateItem(id: string, patch: Partial<InvestmentItem>) {
    updateTool(
      "investments",
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(id: string) {
    updateTool("investments", items.filter((item) => item.id !== id));
  }

  return (
    <>
      <PageHeader
        title="투자 포트폴리오"
        description="주식 구매는 자산 교환입니다. 평가손익은 장부 위의 숫자입니다."
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
                <Plus size={14} /> 종목 추가
              </button>
            }
          >
            보유 종목
          </CardTitle>
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const gain = (item.marketValue || 0) - (item.cost || 0);
              return (
                <div key={item.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={item.name}
                      placeholder="종목 이름"
                      onChange={(event) => updateItem(item.id, { name: event.target.value })}
                      className="h-10 flex-1 rounded-xl border border-border px-3 text-sm outline-none transition-colors focus:border-brand"
                    />
                    <span className="num w-24 text-right text-xs text-muted">
                      {item.cost ? formatSignedPercent(gain / item.cost) : "-"}
                    </span>
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
                      <span className="text-xs text-muted">매수 금액</span>
                      <CurrencyInput
                        value={item.cost}
                        onChange={(value) => updateItem(item.id, { cost: value })}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-muted">현재 시가</span>
                      <CurrencyInput
                        value={item.marketValue}
                        onChange={(value) => updateItem(item.id, { marketValue: value })}
                      />
                    </label>
                  </div>
                  <p className="num mt-2 text-right text-xs text-muted">
                    평가손익 {formatKRW(gain)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="lg:sticky lg:top-6 lg:self-start">
          <CardTitle>포트폴리오 평가</CardTitle>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="매수 금액" value={formatKRW(summary.totalCost)} />
              <StatBlock label="현재 시가" value={formatKRW(summary.totalValue)} />
            </div>
            <StatBlock
              label="평가손익"
              value={formatKRW(summary.gain)}
              tone={toneForValue(summary.gain)}
              sub={`수익률 ${formatSignedPercent(summary.gainRate)}`}
            />
            <p className="rounded-xl bg-surface-muted px-4 py-3 text-xs text-muted">
              평가이익은 아직 현금이 아닙니다. 재무상태표의 투자자산에 <strong>현재 시가</strong>를
              반영하면 자산 총액과 자기자본이 그만큼 변합니다.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
