"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatBlock } from "@/components/ui/StatBlock";
import { Gauge } from "@/components/ui/Gauge";
import { CurrencyInput } from "@/components/forms/CurrencyInput";
import {
  LazyAssetDebtBarChart as AssetDebtBarChart,
  LazyEquityLineChart as EquityLineChart,
  LazyEquityRatioChart as EquityRatioChart,
} from "@/components/charts/lazy";
import { Sheet } from "@/components/statement/Sheet";
import { ViewTabs, type SheetView } from "@/components/statement/ViewTabs";
import { SignatureCanvas } from "@/components/signature/SignatureCanvas";
import { useAppStore } from "@/store/useAppStore";
import {
  annualRowsFromBalanceSheets,
  calcAnnualGrowth,
  createAnnualTracking,
} from "@/lib/calculations/annual";
import { AUDIT_OPINION_LABELS } from "@/lib/constants";
import { formatDate, formatKRW, formatSignedPercent } from "@/lib/format";
import type { AnnualTracking, AuditOpinion } from "@/types";

const YEARS_BACK = 4;

export default function AnnualPage() {
  const userName = useAppStore((state) => state.user?.nickname);
  const userId = useAppStore((state) => state.user?.id ?? "local");
  const trackings = useAppStore((state) => state.annualTrackings);
  const balanceSheets = useAppStore((state) => state.balanceSheets);
  const upsertAnnual = useAppStore((state) => state.upsertAnnual);
  const now = useMemo(() => new Date(), []);
  const [signYear, setSignYear] = useState(now.getFullYear());
  const [view, setView] = useState<SheetView>("input");
  const [message, setMessage] = useState("");

  const years = useMemo(
    () =>
      Array.from({ length: YEARS_BACK + 1 }, (_, index) => now.getFullYear() - YEARS_BACK + index),
    [now],
  );

  function rowFor(year: number): AnnualTracking {
    return (
      trackings.find((item) => item.year === year) ??
      createAnnualTracking(userId, year)
    );
  }

  function updateRow(year: number, patch: Partial<AnnualTracking>) {
    upsertAnnual({ ...rowFor(year), ...patch, userId, year });
  }

  function importFromSheets() {
    const rows = annualRowsFromBalanceSheets(balanceSheets);
    if (rows.length === 0) {
      setMessage("불러올 재무상태표가 없습니다. 먼저 재무상태표를 작성해 주세요.");
      return;
    }

    const inRange = rows.filter((row) => years.includes(row.year));
    const skipped = rows.length - inRange.length;

    if (inRange.length === 0) {
      setMessage(
        `${years[0]}~${years[years.length - 1]}년에 해당하는 재무상태표가 없습니다.`,
      );
      return;
    }

    for (const row of inRange) {
      updateRow(row.year, {
        totalAssets: row.totalAssets,
        totalDebts: row.totalDebts,
      });
    }

    setMessage(
      `${inRange.map((row) => `${row.year}년`).join("·")} 재무상태표에서 자산·부채를 불러왔습니다.` +
        (skipped > 0 ? ` (표에 없는 연도 ${skipped}건은 건너뜀)` : ""),
    );
  }

  const computed = calcAnnualGrowth(
    years
      .map(rowFor)
      .filter((row) => row.totalAssets !== 0 || row.totalDebts !== 0),
  );

  const latest = computed[computed.length - 1];
  const signRow = rowFor(signYear);

  return (
    <>
      <PageHeader
        title="연간 자기자본 추적"
        description="연도별 자산/부채를 기록하거나 재무상태표에서 불러오면 자기자본 증가율이 계산됩니다."
      />

      <ViewTabs view={view} onChange={setView} />

      {view === "input" ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle
              hint={
                <span className="flex items-center gap-3">
                  <span>1~5년차</span>
                  <button
                    type="button"
                    onClick={importFromSheets}
                    className="inline-flex items-center gap-1 text-brand"
                  >
                    <Download size={14} /> 자료 불러오기
                  </button>
                </span>
              }
            >
              연도별 입력
            </CardTitle>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="py-2 pr-3 font-medium">연도</th>
                    <th className="py-2 pr-3 font-medium">자산</th>
                    <th className="py-2 pr-3 font-medium">부채</th>
                    <th className="py-2 pr-3 font-medium">자기자본</th>
                    <th className="py-2 font-medium">증가율</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {years.map((year) => {
                    const row = rowFor(year);
                    const equity = row.totalAssets - row.totalDebts;
                    const computedRow = computed.find((item) => item.year === year);
                    return (
                      <tr key={year}>
                        <td className="num py-2 pr-3 text-brand-dark">{year}</td>
                        <td className="py-2 pr-3">
                          <CurrencyInput
                            value={row.totalAssets}
                            onChange={(value) => updateRow(year, { totalAssets: value })}
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <CurrencyInput
                            value={row.totalDebts}
                            onChange={(value) => updateRow(year, { totalDebts: value })}
                          />
                        </td>
                        <td className="num py-2 pr-3 text-brand-dark">{formatKRW(equity)}</td>
                        <td className="num py-2 text-brand-dark">
                          {computedRow ? formatSignedPercent(computedRow.growthRate) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {message ? (
              <p className="mt-3 text-xs text-muted">{message}</p>
            ) : null}
            {balanceSheets.length === 0 ? (
              <p className="mt-2 text-xs text-muted">
                <Link href="/balance-sheet" className="text-brand hover:underline">
                  재무상태표 작성하러 가기
                </Link>{" "}
                — 작성해 두면 연도별 자산·부채를 한 번에 불러올 수 있습니다.
              </p>
            ) : null}
          </Card>

          {latest ? (
            <Card>
              <CardTitle hint={`${latest.year}년`}>최신 자기자본</CardTitle>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatBlock label="자산" value={formatKRW(latest.totalAssets)} />
                <StatBlock label="부채" value={formatKRW(latest.totalDebts)} tone="negative" />
                <StatBlock label="자기자본" value={formatKRW(latest.equity)} tone="positive" />
              </div>
              <div className="mt-4">
                <Gauge
                  ratio={latest.totalAssets === 0 ? 0 : latest.equity / latest.totalAssets}
                  label="자기자본 비율"
                />
              </div>
            </Card>
          ) : null}

          {computed.length > 0 ? (
            <>
              <Card>
                <CardTitle>자기자본 추이</CardTitle>
                <EquityLineChart data={computed} />
              </Card>
              <Card>
                <CardTitle>자산 · 부채 누적</CardTitle>
                <AssetDebtBarChart data={computed} />
              </Card>
              <Card>
                <CardTitle>자기자본 비율 변화</CardTitle>
                <EquityRatioChart data={computed} />
              </Card>
            </>
          ) : (
            <Card>
              <p className="text-sm text-muted">
                자산이나 부채를 입력하면 차트가 표시됩니다.
              </p>
            </Card>
          )}

          <Card>
            <CardTitle hint="연도별 체크 + 서명">감사의견</CardTitle>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {years.map((year) => {
                  const row = rowFor(year);
                  return (
                    <select
                      key={year}
                      value={row.auditOpinion ?? ""}
                      onChange={(event) =>
                        updateRow(year, {
                          auditOpinion: (event.target.value || null) as AuditOpinion | null,
                        })
                      }
                      className="num rounded-lg border border-border bg-surface px-2 py-1.5 text-xs"
                    >
                      <option value="">{year} · 미작성</option>
                      {Object.entries(AUDIT_OPINION_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {year} · {label}
                        </option>
                      ))}
                    </select>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">서명 연도</span>
                <select
                  value={signYear}
                  onChange={(event) => setSignYear(Number(event.target.value))}
                  className="num rounded-lg border border-border bg-surface px-2 py-1.5 text-sm"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}년
                    </option>
                  ))}
                </select>
                {signRow.signedAt ? (
                  <span className="text-xs text-positive">
                    서명 완료 · {formatDate(signRow.signedAt)}
                  </span>
                ) : null}
              </div>

              <SignatureCanvas
                onChange={(dataUrl) =>
                  updateRow(signYear, {
                    signature: dataUrl,
                    signedAt: dataUrl ? new Date().toISOString() : undefined,
                  })
                }
              />
              {signRow.signature ? (
                <p className="text-xs text-muted">
                  감사의견:{" "}
                  {signRow.auditOpinion ? AUDIT_OPINION_LABELS[signRow.auditOpinion] : "미작성"}
                </p>
              ) : null}
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Sheet
            title="연간 자기자본 증가율 추적표"
            meta={`${years[0]}~${years[years.length - 1]}년`}
            userName={userName}
          >
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="py-2 pr-2 font-medium">연도</th>
                <th className="px-2 py-2 text-right font-medium">자산 총액</th>
                <th className="px-2 py-2 text-right font-medium">부채 총액</th>
                <th className="px-2 py-2 text-right font-medium">자기자본</th>
                <th className="px-2 py-2 text-right font-medium">증가율</th>
                <th className="py-2 pl-2 text-right font-medium">감사의견</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {computed.length > 0 ? (
                computed.map((row) => {
                  const tracking = rowFor(row.year);
                  return (
                    <tr key={row.year} className="text-brand-dark">
                      <td className="num py-2 pr-2">{row.year}</td>
                      <td className="num px-2 py-2 text-right">{formatKRW(row.totalAssets)}</td>
                      <td className="num px-2 py-2 text-right">{formatKRW(row.totalDebts)}</td>
                      <td className="num px-2 py-2 text-right font-semibold text-brand">
                        {formatKRW(row.equity)}
                      </td>
                      <td className="num px-2 py-2 text-right">{formatSignedPercent(row.growthRate)}</td>
                      <td className="py-2 pl-2 text-right text-xs text-muted">
                        {tracking.auditOpinion ? AUDIT_OPINION_LABELS[tracking.auditOpinion] : "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-muted">
                    자산·부채를 입력하면 표가 채워집니다.
                  </td>
                </tr>
              )}
            </tbody>
          </Sheet>

          {computed.length > 0 ? (
            <>
              <Card>
                <CardTitle>자기자본 추이</CardTitle>
                <EquityLineChart data={computed} />
              </Card>
              <Card>
                <CardTitle>자산 · 부채 누적</CardTitle>
                <AssetDebtBarChart data={computed} />
              </Card>
            </>
          ) : null}
        </div>
      )}
    </>
  );
}
