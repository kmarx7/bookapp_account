"use client";

import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatBlock } from "@/components/ui/StatBlock";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import {
  classifyExpense,
  summarizeExpenses,
} from "@/lib/calculations/expenseReview";
import { useAppStore } from "@/store/useAppStore";
import { formatKRW, formatPercent } from "@/lib/format";
import type { ExpenseDraft, ExpenseItem } from "@/types";

const CATEGORY_LABELS: Record<ExpenseItem["category"], string> = {
  cost: "비용",
  maintenance: "유지보수비",
  investment: "투자",
};

export default function ExpenseReviewPage() {
  const drafts = useAppStore((state) => state.tools.expenseReview);
  const updateTool = useAppStore((state) => state.updateTool);

  const items: ExpenseItem[] = drafts.map((draft) => ({
    ...draft,
    category: classifyExpense(draft.name),
  }));
  const summary = summarizeExpenses(items);

  function addDraft() {
    updateTool("expenseReview", [
      ...drafts,
      { id: crypto.randomUUID(), name: "", amount: 0 },
    ]);
  }

  function updateDraft(id: string, patch: Partial<ExpenseDraft>) {
    updateTool(
      "expenseReview",
      drafts.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft)),
    );
  }

  function removeDraft(id: string) {
    updateTool("expenseReview", drafts.filter((draft) => draft.id !== id));
  }

  return (
    <>
      <PageHeader
        title="지출 감정평가"
        description="지출을 비용·유지보수비·투자로 자동 분류합니다."
        backHref="/tools"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle
            hint={
              <button
                type="button"
                onClick={addDraft}
                className="inline-flex items-center gap-1 text-brand"
              >
                <Plus size={14} /> 지출 추가
              </button>
            }
          >
            지출 항목
          </CardTitle>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  value={item.name}
                  placeholder="예: 적금 납입, 통신비"
                  onChange={(event) => updateDraft(item.id, { name: event.target.value })}
                  className="h-11 flex-1 rounded-xl border border-border px-3 text-sm outline-none transition-colors focus:border-brand"
                />
                <span className="w-20 text-center text-xs text-muted">
                  {CATEGORY_LABELS[item.category]}
                </span>
                <div className="w-32">
                  <CurrencyInput
                    value={item.amount}
                    onChange={(value) => updateDraft(item.id, { amount: value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeDraft(item.id)}
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
          <CardTitle>평가 결과</CardTitle>
          <div className="flex flex-col gap-3">
            <StatBlock label="총 지출" value={formatKRW(summary.total)} />
            <div className="grid grid-cols-3 gap-3">
              <StatBlock
                label="비용"
                value={formatPercent(summary.ratio.cost)}
                sub={formatKRW(summary.byCategory.cost)}
              />
              <StatBlock
                label="유지보수비"
                value={formatPercent(summary.ratio.maintenance)}
                sub={formatKRW(summary.byCategory.maintenance)}
              />
              <StatBlock
                label="투자"
                value={formatPercent(summary.ratio.investment)}
                sub={formatKRW(summary.byCategory.investment)}
                tone="positive"
              />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
