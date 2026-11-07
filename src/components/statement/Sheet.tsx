"use client";

import type { ReactNode } from "react";
import { Printer } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function Sheet({
  title,
  meta,
  userName,
  children,
  note,
}: {
  title: string;
  meta?: string;
  userName?: string | null;
  children: ReactNode;
  note?: ReactNode;
}) {
  return (
    <Card className="print:border-0 print:p-0 print:shadow-none">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-lg font-bold text-brand">{title}</h2>
          {meta ? <p className="mt-1 text-xs text-muted">{meta}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="print:hidden inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-brand-soft px-2.5 text-xs font-medium text-brand transition-colors hover:bg-border"
        >
          <Printer size={14} />
          인쇄·PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>

      {note ? <div className="mt-4">{note}</div> : null}

      <p className="mt-5 border-t border-border pt-3 text-xs text-muted">
        대표 성명: {userName ?? "____________"} (서명)
      </p>
    </Card>
  );
}

export function SheetGroup({ label }: { label: string }) {
  return (
    <tr className="bg-surface-muted">
      <td colSpan={2} className="px-2 py-1.5 text-xs font-semibold text-muted">
        {label}
      </td>
    </tr>
  );
}

export function SheetRow({
  label,
  value,
  strong = false,
  indent = false,
  tone = "neutral",
}: {
  label: string;
  value: string;
  strong?: boolean;
  indent?: boolean;
  tone?: "neutral" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-positive"
      : tone === "negative"
        ? "text-negative"
        : "";

  return (
    <tr className={strong ? "font-semibold text-brand" : "text-brand-dark"}>
      <td className={`py-1.5 ${indent ? "pl-4" : ""}`}>{label}</td>
      <td className={`num py-1.5 text-right ${toneClass}`}>{value}</td>
    </tr>
  );
}
