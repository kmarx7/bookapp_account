"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Plus, Star, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatBlock } from "@/components/ui/StatBlock";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  expenseItemsFromStatement,
  resolveExpenseItems,
  summarizeExpenses,
} from "@/lib/calculations/expenseReview";
import { useAppStore } from "@/store/useAppStore";
import { formatKRW, formatPercent } from "@/lib/format";
import type { ExpenseCategory, ExpenseDraft } from "@/types";

const IMPORT_THRESHOLD = 100_000;

export default function ExpenseReviewPage() {
  const drafts = useAppStore((state) => state.tools.expenseReview);
  const updateTool = useAppStore((state) => state.updateTool);
  const incomeStatements = useAppStore((state) => state.incomeStatements);

  const [message, setMessage] = useState("");

  const latestIncome = useMemo(
    () =>
      [...incomeStatements].sort(
        (a, b) => b.year * 12 + b.month - (a.year * 12 + a.month),
      )[0],
    [incomeStatements],
  );

  const items = resolveExpenseItems(drafts);
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
    updateTool(
      "expenseReview",
      drafts.filter((draft) => draft.id !== id),
    );
  }

  function importFromIncome() {
    if (!latestIncome) {
      setMessage("불러올 손익계산서가 없습니다. 먼저 손익계산서를 작성해 주세요.");
      return;
    }

    const rows = expenseItemsFromStatement(latestIncome, IMPORT_THRESHOLD);
    // 비어 있는 기본 행은 정리하고, 이미 있는 항목명은 건너뛴다.
    const kept = drafts.filter(
      (draft) => draft.name.trim() !== "" || draft.amount > 0,
    );
    const existing = new Set(kept.map((draft) => draft.name.trim()));
    const added = rows
      .filter((row) => !existing.has(row.name))
      .map((row) => ({
        id: crypto.randomUUID(),
        name: row.name,
        amount: row.amount,
        category: row.category,
      }));

    if (rows.length === 0) {
      setMessage(
        `${latestIncome.year}년 ${latestIncome.month}월 손익계산서에 10만 원 이상 지출이 없습니다.`,
      );
      return;
    }
    if (added.length === 0) {
      setMessage("이미 모두 불러왔습니다.");
      return;
    }

    updateTool("expenseReview", [...kept, ...added]);
    setMessage(
      `${latestIncome.year}년 ${latestIncome.month}월 손익계산서에서 ${added.length}개 항목을 불러왔습니다.`,
    );
  }

  return (
    <>
      <PageHeader
        title="지출 감정평가"
        description="손익계산서에서 지출을 불러와 비용·유지보수비·투자로 분류합니다."
        backHref="/tools"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle
            hint={
              <span className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={importFromIncome}
                  className="inline-flex items-center gap-1 text-brand"
                >
                  <Download size={14} /> 불러오기
                </button>
                <button
                  type="button"
                  onClick={addDraft}
                  className="inline-flex items-center gap-1 text-brand"
                >
                  <Plus size={14} /> 지출 추가
                </button>
              </span>
            }
          >
            지출 항목
          </CardTitle>

          <div className="flex flex-col gap-2">
            {items.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                아직 항목이 없습니다. <strong>불러오기</strong>로 손익계산서의 지출을
                가져오거나 직접 추가하세요.
              </p>
            ) : null}

            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  value={item.name}
                  placeholder="예: 적금 납입, 통신비"
                  onChange={(event) => updateDraft(item.id, { name: event.target.value })}
                  className="h-11 flex-1 rounded-xl border border-border px-3 text-sm outline-none transition-colors focus:border-brand"
                />
                <select
                  value={item.category}
                  aria-label={`${item.name || "지출"} 분류`}
                  onChange={(event) =>
                    updateDraft(item.id, {
                      category: event.target.value as ExpenseCategory,
                    })
                  }
                  className="h-11 rounded-xl border border-border bg-surface px-2 text-xs outline-none transition-colors focus:border-brand"
                >
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {EXPENSE_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
                <div className="w-32">
                  <CurrencyInput
                    value={item.amount}
                    onChange={(value) => updateDraft(item.id, { amount: value })}
                  />
                </div>
                <button
                  type="button"
                  aria-pressed={item.cutCandidate ?? false}
                  aria-label={
                    item.cutCandidate ? "줄일 후보 해제" : "줄일 후보로 표시"
                  }
                  onClick={() =>
                    updateDraft(item.id, { cutCandidate: !item.cutCandidate })
                  }
                  className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-lg p-1.5 text-muted transition-colors hover:bg-brand-soft"
                >
                  <Star
                    size={16}
                    className={
                      item.cutCandidate ? "fill-negative text-negative" : "text-muted"
                    }
                  />
                </button>
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

          {message ? (
            <p className="mt-3 text-xs text-muted">{message}</p>
          ) : null}
          {!latestIncome ? (
            <p className="mt-2 text-xs text-muted">
              <Link href="/income" className="text-brand hover:underline">
                손익계산서 작성하러 가기
              </Link>{" "}
              — 작성해 두면 지출을 한 번에 불러올 수 있습니다.
            </p>
          ) : null}
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
            <StatBlock
              label="줄일 후보 (☆)"
              value={`${summary.cut.count}건`}
              sub={`${formatKRW(summary.cut.total)} · 전체의 ${formatPercent(
                summary.total === 0 ? 0 : summary.cut.total / summary.total,
              )}`}
              tone="negative"
            />
          </div>
        </Card>
      </div>
    </>
  );
}
