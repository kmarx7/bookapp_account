"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { readRaw, writeRaw } from "@/lib/storage/storage";
import { migrate, toAppData } from "@/lib/storage/schema";

export function StoreHydrator({ children }: { children: React.ReactNode }) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const raw = readRaw();
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          schemaVersion?: number;
          data?: unknown;
        };
        const data = migrate(
          parsed.schemaVersion ?? 0,
          parsed.data ?? parsed,
        );
        useAppStore.getState().hydrate(data);
      } catch {
        useAppStore.getState().hydrate(useAppStore.getState());
      }
    } else {
      useAppStore.setState({ hydrated: true });
    }

    const unsubscribe = useAppStore.subscribe((state) => {
      if (!state.hydrated) return;
      writeRaw(JSON.stringify(toAppData(state)));
    });

    return unsubscribe;
  }, []);

  return <>{children}</>;
}
