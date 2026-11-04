import type { ReactNode } from "react";

export function FieldRow({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-2">
      <span className="flex flex-col">
        <span className="text-sm text-brand-dark">{label}</span>
        {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </span>
      <div className="w-40 shrink-0">{children}</div>
    </label>
  );
}

export function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-border pt-3 first:border-t-0 first:pt-0">
      <h3 className="mb-1 text-xs font-semibold text-muted">{title}</h3>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}
