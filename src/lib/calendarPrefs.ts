"use client";

import { useSyncExternalStore } from "react";
import { BUSINESS_PROFILES, type BusinessProfile } from "@/lib/taxCalendar";

export interface CalendarPrefs {
  /** 내 상황(근로자·개인·법인)에 맞는 일정만 보기 */
  profile: BusinessProfile;
  /** 자동차세·재산세 같은 생활 세금 표시 */
  living: boolean;
}

const STORAGE_KEY = "bookapp-calendar-prefs";
const DEFAULT_PREFS: CalendarPrefs = { profile: "all", living: true };

let cache: CalendarPrefs | null = null;
const listeners = new Set<() => void>();

function isProfile(value: unknown): value is BusinessProfile {
  return (
    typeof value === "string" &&
    (BUSINESS_PROFILES as readonly string[]).includes(value)
  );
}

function readPrefs(): CalendarPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<CalendarPrefs>;
    return {
      profile: isProfile(parsed.profile) ? parsed.profile : DEFAULT_PREFS.profile,
      living:
        typeof parsed.living === "boolean" ? parsed.living : DEFAULT_PREFS.living,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function getCalendarPrefs(): CalendarPrefs {
  if (!cache) cache = readPrefs();
  return cache;
}

export function setCalendarPrefs(patch: Partial<CalendarPrefs>): void {
  cache = { ...getCalendarPrefs(), ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // 저장소를 쓸 수 없는 환경에서는 메모리 값만 사용한다.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 달력 표시 설정(동기화 대상이 아닌 이 기기 표시 환경설정) */
export function useCalendarPrefs(): CalendarPrefs {
  return useSyncExternalStore(subscribe, getCalendarPrefs, () => DEFAULT_PREFS);
}
