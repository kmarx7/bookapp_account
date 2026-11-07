"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/hooks/useSession";
import { useAppStore } from "@/store/useAppStore";
import { toAppData } from "@/lib/storage/schema";
import { pushRemote, syncWithRemote } from "@/lib/sync/sync";

const PUSH_DELAY_MS = 2000;

export function SyncManager() {
  const { session, ready } = useSession();
  const userId = session?.user.id ?? null;
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!ready || !userId) return;
    let active = true;
    busy.current = true;

    syncWithRemote(toAppData(useAppStore.getState()), userId)
      .then((merged) => {
        if (active) useAppStore.getState().hydrate(merged);
      })
      .catch(() => {})
      .finally(() => {
        busy.current = false;
      });

    return () => {
      active = false;
    };
  }, [ready, userId]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = useAppStore.subscribe((state) => {
      if (!state.hydrated || busy.current) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        pushRemote(userId, toAppData(useAppStore.getState())).catch(() => {});
      }, PUSH_DELAY_MS);
    });

    return () => {
      if (timer.current) clearTimeout(timer.current);
      unsubscribe();
    };
  }, [userId]);

  return null;
}
