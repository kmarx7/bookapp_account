"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useHydrated } from "@/hooks/useHydrated";
import { useAppStore } from "@/store/useAppStore";

export function AppGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const user = useAppStore((state) => state.user);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user && pathname !== "/onboarding") {
      router.replace("/onboarding");
    } else if (user && pathname === "/onboarding") {
      router.replace("/");
    }
  }, [hydrated, user, pathname, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        불러오는 중…
      </div>
    );
  }

  if (pathname === "/onboarding") {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
        {children}
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
