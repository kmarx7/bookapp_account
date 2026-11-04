"use client";

import { useAppStore } from "@/store/useAppStore";

export function useHydrated(): boolean {
  return useAppStore((state) => state.hydrated);
}
