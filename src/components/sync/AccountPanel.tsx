"use client";

import { useState } from "react";
import { LogOut, RefreshCw, Send } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSession } from "@/hooks/useSession";
import { getSupabase, isSupabaseEnabled } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { toAppData } from "@/lib/storage/schema";
import { syncWithRemote } from "@/lib/sync/sync";

export function AccountPanel() {
  const { session, ready } = useSession();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isSupabaseEnabled) {
    return (
      <Card>
        <CardTitle hint="미설정">클라우드 동기화</CardTitle>
        <p className="text-sm text-muted">
          Supabase 환경변수(NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_ANON_KEY)를
          설정하면 여러 기기에서 같은 데이터를 쓸 수 있습니다.
        </p>
      </Card>
    );
  }

  async function sendLink() {
    const supabase = getSupabase();
    if (!supabase || !email.trim()) return;
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    setMessage(
      error
        ? `전송 실패: ${error.message}`
        : "로그인 링크를 이메일로 보냈습니다. 메일함을 확인하세요.",
    );
  }

  async function syncNow() {
    const supabase = getSupabase();
    const userId = session?.user.id;
    if (!supabase || !userId) return;
    setBusy(true);
    setMessage("");
    try {
      const merged = await syncWithRemote(toAppData(useAppStore.getState()), userId);
      useAppStore.getState().hydrate(merged);
      setMessage("동기화했습니다.");
    } catch {
      setMessage("동기화에 실패했습니다. 잠시 후 다시 시도하세요.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setMessage("로그아웃했습니다. 데이터는 이 기기에 그대로 남아 있습니다.");
  }

  return (
    <Card>
      <CardTitle
        hint={session ? "연결됨" : "선택 사항"}
        >
        클라우드 동기화
      </CardTitle>

      {!ready ? (
        <p className="text-sm text-muted">확인 중…</p>
      ) : session ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-brand-dark">{session.user.email}</span>
            <Badge tone="positive">로그인됨</Badge>
          </div>
          <p className="text-xs text-muted">
            로그인하면 변경 사항이 자동으로 클라우드에 저장되고, 다른 기기에서 불러옵니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={syncNow} disabled={busy}>
              <RefreshCw size={16} />
              지금 동기화
            </Button>
            <Button size="sm" variant="secondary" onClick={signOut}>
              <LogOut size={16} />
              로그아웃
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            이메일을 입력하면 로그인 링크를 보내드립니다(비밀번호 없음). 로그인하지
            않아도 앱은 그대로 쓸 수 있습니다.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-11 flex-1 rounded-xl border border-border px-3 text-sm outline-none transition-colors focus:border-brand"
            />
            <Button onClick={sendLink} disabled={busy || !email.trim()}>
              <Send size={16} />
              링크 받기
            </Button>
          </div>
        </div>
      )}

      {message ? <p className="mt-3 text-sm text-positive">{message}</p> : null}
    </Card>
  );
}
