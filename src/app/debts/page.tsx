"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatBlock } from "@/components/ui/StatBlock";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import { PercentInput } from "@/components/forms/PercentInput";
import { Sheet } from "@/components/statement/Sheet";
import { ViewTabs, type SheetView } from "@/components/statement/ViewTabs";
import { useAppStore } from "@/store/useAppStore";
import {
  debtsFromBalanceSheet,
  simulatePayoff,
  sortDebtsByRate,
} from "@/lib/calculations/debt";
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
    updatedAt: new Date().toISOString(),
  };
}

export default function DebtsPage() {
  const userName = useAppStore((state) => state.user?.nickname);
  const userId = useAppStore((state) => state.user?.id ?? "local");
  const debts = useAppStore((state) => state.debts);
  const addDebt = useAppStore((state) => state.addDebt);
  const updateDebt = useAppStore((state) => state.updateDebt);
  const removeDebt = useAppStore((state) => state.removeDebt);
  const balanceSheets = useAppStore((state) => state.balanceSheets);
  const [extraPayment, setExtraPayment] = useState(0);
  const [message, setMessage] = useState("");
  const [view, setView] = useState<SheetView>("input");

  const latestSheet = [...balanceSheets].sort(
    (a, b) => Date.parse(b.baseDate) - Date.parse(a.baseDate),
  )[0];

  function importFromSheet() {
    if (!latestSheet) {
      setMessage("불러올 재무상태표가 없습니다. 먼저 재무상태표를 작성해 주세요.");
      return;
    }

    const rows = debtsFromBalanceSheet(latestSheet);
    if (rows.length === 0) {
      setMessage(`${formatDate(latestSheet.baseDate)} 재무상태표에 부채가 없습니다.`);
      return;
    }

    const existing = new Set(debts.map((debt) => debt.name.trim()));
    const added = rows.filter((row) => !existing.has(row.name));
    if (added.length === 0) {
      setMessage("이미 모두 불러왔습니다.");
      return;
    }

    for (const row of added) {
      addDebt({ ...blankDebt(userId), name: row.name, balance: row.balance });
    }
    setMessage(
      `${formatDate(latestSheet.baseDate)} 재무상태표에서 ${added.length}건을 불러왔습니다. 이자율·월 상환액을 채워 주세요.`,
    );
  }

  const sorted = sortDebtsByRate(debts);
  const totalBalance = sorted.reduce((acc, debt) => acc + (debt.balance || 0), 0);
  const totalMonthly = sorted.reduce((acc, debt) => acc + (debt.monthlyPayment || 0), 0);
  const totalSaved = sorted.reduce(
    (acc, debt) => acc + simulatePayoff(debt, extraPayment).interestSaved,
    0,
  );

  return (
    <>
      <PageHeader
        title="부채관리"
        description="이자율이 높은 부채부터 갚는 것이 유리합니다."
        action={
          <span className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={importFromSheet}>
              <Download size={16} />
              불러오기
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => addDebt(blankDebt(userId))}
            >
              <Plus size={16} />
              부채 추가
            </Button>
          </span>
        }
      />

      {message ? (
        <p className="mb-3 text-xs text-muted">{message}</p>
      ) : null}
      {!latestSheet ? (
        <p className="mb-3 text-xs text-muted">
          <Link href="/balance-sheet" className="text-brand hover:underline">
            재무상태표 작성하러 가기
          </Link>{" "}
          — 부채 칸을 채워두면 여기서 한 번에 불러올 수 있습니다.
        </p>
      ) : null}

      {debts.length === 0 ? (
        <EmptyState
          title="등록된 부채가 없습니다"
          description="학자금, 카드, 마이너스 통장 등을 등록해 상환 계획을 세워보세요."
        />
      ) : (
        <>
          <ViewTabs view={view} onChange={setView} />

          {view === "input" ? (
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
                        className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-lg p-1.5 text-muted transition-colors hover:bg-negative-soft hover:text-negative"
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
          ) : (
            <Sheet
              title="부채 이자율 정렬 및 상환 계획표"
              meta={`${sorted.length}건 · 이자율 높은 순`}
              userName={userName}
              note={
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <StatBlock label="총 잔액" value={formatKRW(totalBalance)} />
                  <StatBlock label="월 상환 합계" value={formatKRW(totalMonthly)} />
                  <StatBlock
                    label="추가 상환 시 이자 절약"
                    value={formatKRW(totalSaved)}
                    tone="positive"
                  />
                </div>
              }
            >
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="py-2 pr-2 font-medium">순위</th>
                  <th className="py-2 pr-2 font-medium">부채명</th>
                  <th className="py-2 pr-2 text-right font-medium">잔액</th>
                  <th className="py-2 pr-2 text-right font-medium">연 이자율</th>
                  <th className="py-2 text-right font-medium">월 상환액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((debt, index) => (
                  <tr key={debt.id} className="text-brand-dark">
                    <td className="num py-2 pr-2">{index + 1}순위</td>
                    <td className="py-2 pr-2">{debt.name || "-"}</td>
                    <td className="num py-2 pr-2 text-right">{formatKRW(debt.balance)}</td>
                    <td className="num py-2 pr-2 text-right">{debt.annualRate}%</td>
                    <td className="num py-2 text-right">{formatKRW(debt.monthlyPayment)}</td>
                  </tr>
                ))}
              </tbody>
            </Sheet>
          )}
        </>
      )}
    </>
  );
}
