"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "@/components/layout/nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-r border-border bg-surface px-3 py-6 print:hidden md:flex">
      <div className="px-3 pb-4">
        <p className="text-lg font-bold text-brand">내가 대표</p>
        <p className="text-xs text-muted">1인가구 재무제표</p>
      </div>
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-brand text-white"
                : "text-brand-dark hover:bg-brand-soft"
            }`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
