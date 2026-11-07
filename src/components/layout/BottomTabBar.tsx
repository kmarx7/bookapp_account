"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_TABS, isActive } from "@/components/layout/nav";

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="mx-auto flex max-w-6xl">
        {PRIMARY_TABS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <Icon size={20} />
                <span>{item.shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
