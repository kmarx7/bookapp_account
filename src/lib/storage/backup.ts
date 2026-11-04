import type { AppData } from "@/types";
import { isBrowser } from "@/lib/storage/storage";
import { migrate } from "@/lib/storage/schema";

export function exportBackup(data: AppData): void {
  if (!isBrowser()) return;

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `bookapp-account-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function parseBackup(text: string): AppData | null {
  try {
    const parsed = JSON.parse(text) as Partial<AppData> & {
      schemaVersion?: number;
    };
    if (!parsed || typeof parsed !== "object") return null;
    return migrate(parsed.schemaVersion ?? 0, parsed);
  } catch {
    return null;
  }
}
