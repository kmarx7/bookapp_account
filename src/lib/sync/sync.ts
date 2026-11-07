import type { AppData } from "@/types";
import { getSupabase } from "@/lib/supabase/client";
import { mergeAppData } from "@/lib/calculations/merge";
import { normalize } from "@/lib/storage/schema";

export async function pullRemote(userId: string): Promise<AppData | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("app_data")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return normalize((data as { data: Partial<AppData> }).data);
}

export async function pushRemote(userId: string, payload: AppData): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from("app_data").upsert({
    user_id: userId,
    data: payload,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function syncWithRemote(local: AppData, userId: string): Promise<AppData> {
  const remote = await pullRemote(userId);
  const merged = remote ? mergeAppData(local, remote) : local;
  await pushRemote(userId, merged);
  return merged;
}
