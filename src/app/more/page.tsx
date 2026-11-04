"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { NAV_ITEMS, PRIMARY_TABS } from "@/components/layout/nav";

export default function MorePage() {
  const primaryHrefs = PRIMARY_TABS.map((tab) => tab.href);
  const items = NAV_ITEMS.filter((item) => !primaryHrefs.includes(item.href));

  return (
    <>
      <PageHeader title="더보기" description="부채·연간 추적·도구함·설정" />
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 transition-colors hover:border-brand"
            >
              <span className="flex items-center gap-3">
                <Icon size={18} className="text-brand" />
                <span className="text-sm font-medium text-brand-dark">{item.label}</span>
              </span>
              <span className="text-muted">→</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
