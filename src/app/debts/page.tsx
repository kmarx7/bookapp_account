"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatBlock } from "@/components/ui/StatBlock";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import { PercentInput } from "@/components/forms/PercentInput";
import { useAppStore } from "@/store/useAppStore";
import { simulatePayoff, sortDebtsByRate } from "@/lib/calculations/debt";
import { formatDate, formatKRW } from "@/lib/format";
import type { Debt } from "@/types";

function blankDebt(userId: string): Debt {
  return {
    id: crypto.randomUUID(),
    userId,
    name: "",
    balance: 0,
    annualRate: 0,
    monthlyPayment: 0,
  };
}

export default function DebtsPage() {
  const userId = useAppStore((state) => state.user?.id ?? "local");
  const debts = useAppStore((state) => state.debts);
  const addDebt = useAppStore((state) => state.addDebt);
  const updateDebt = useAppStore((state) => state.updateDebt);
  const removeDebt = useAppStore((state) => state.removeDebt);
  const [extraPayment, setExtraPayment] = useState(0);

  const sorted = sortDebtsByRate(debts);

  return (
    <>
      <PageHeader
        title="부채관리"
        description="이자율이 높은 부채부터 갚는 것이 유리합니다."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => addDebt(blankDebt(userId))}
          >
            <Plus size={16} />
            부채 추가
          </Button>
        }
      />

      {debts.length === 0 ? (
        <EmptyState
          title="등록된 부채가 없습니다"
          description="학자금, 카드, 마이너스 통장 등을 등록해 상환 계획을 세워보세요."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map((debt, index) => {
            const simulation = simulatePayoff(debt, extraPayment);
            return (
              <Card key={debt.id}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {index === 0 ? <Badge tone="negative">최우선 상환</Badge> : null}
                    <input
                      value={debt.name}
                      placeholder="부채 이름"
                      onChange={(event) =>
                        updateDebt(debt.id, { name: event.target.value })
                      }
                      className="rounded-lg border border-transparent px-2 py-1 text-sm font-semibold text-brand outline-none transition-colors hover:border-border focus:border-brand"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDebt(debt.id)}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-negative-soft hover:text-negative"
                    aria-label="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-muted">잔액</span>
                    <CurrencyInput
                      value={debt.balance}
                      onChange={(value) => updateDebt(debt.id, { balance: value })}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-muted">연 이자율</span>
                    <PercentInput
                      value={debt.annualRate}
                      onChange={(value) => updateDebt(debt.id, { annualRate: value })}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-muted">월 상환액</span>
                    <CurrencyInput
                      value={debt.monthlyPayment}
                      onChange={(value) =>
                        updateDebt(debt.id, { monthlyPayment: value })
                      }
                    />
                  </label>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <StatBlock
                    label="완제 예상"
                    value={
                      simulation.feasible
                        ? formatDate(simulation.payoffDate)
                        : "상환 불가"
                    }
                    sub={simulation.feasible ? `${simulation.months}개월` : "월 상환액이 이자를 못 넘김"}
                  />
                  <StatBlock
                    label="총 이자(현재)"
                    value={formatKRW(simulation.totalInterest)}
                    tone="negative"
                  />
                  <StatBlock
                    label="이자 절약"
                    value={formatKRW(simulation.interestSaved)}
                    tone="positive"
                  />
                </div>

                <input
                  value={debt.strategy ?? ""}
                  placeholder="상환 전략 메모"
                  onChange={(event) =>
                    updateDebt(debt.id, { strategy: event.target.value })
                  }
                  className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-brand"
                />
              </Card>
            );
          })}

          <Card>
            <CardTitle hint="추가 상환 시뮬레이션">
              매달 얼마를 더 갚을까요?
            </CardTitle>
            <div className="flex flex-col gap-3">
              <div className="w-52">
                <CurrencyInput value={extraPayment} onChange={setExtraPayment} />
              </div>
              <p className="text-sm text-muted">
                {extraPayment > 0
                  ? `매달 ${formatKRW(extraPayment)}씩 추가 상환하면 위 완제 예상일과 이자 절약액이 반영됩니다.`
                  : "금액을 입력하면 각 부채의 완제일과 이자 절약액이 다시 계산됩니다."}
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
