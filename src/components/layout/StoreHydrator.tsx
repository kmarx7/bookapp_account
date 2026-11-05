"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { readRaw, writeRaw } from "@/lib/storage/storage";
import { migrate, toAppData } from "@/lib/storage/schema";

export function StoreHydrator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const raw = readRaw();
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          schemaVersion?: number;
          data?: unknown;
        };
        const data = migrate(parsed.schemaVersion ?? 0, parsed.data ?? parsed);
        useAppStore.getState().hydrate(data);
      } catch {
        useAppStore.setState({ hydrated: true });
      }
    } else {
      useAppStore.setState({ hydrated: true });
    }

    return useAppStore.subscribe((state) => {
      if (!state.hydrated) return;
      writeRaw(JSON.stringify(toAppData(state)));
    });
  }, []);

  return <>{children}</>;
}
