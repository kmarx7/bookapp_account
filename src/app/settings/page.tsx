"use client";

import { useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { AccountPanel } from "@/components/sync/AccountPanel";
import { exportBackup, parseBackup } from "@/lib/storage/backup";
import { toAppData } from "@/lib/storage/schema";
import { formatDate } from "@/lib/format";

export default function SettingsPage() {
  const user = useAppStore((state) => state.user);
  const updateUser = useAppStore((state) => state.updateUser);
  const importData = useAppStore((state) => state.importData);
  const resetAll = useAppStore((state) => state.resetAll);

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [foundedAt, setFoundedAt] = useState(
    user?.foundedAt ? user.foundedAt.slice(0, 10) : "",
  );
  const [message, setMessage] = useState("");

  function handleExport() {
    exportBackup(toAppData(useAppStore.getState()));
    setMessage("JSON 파일로 내보냈습니다.");
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = parseBackup(text);
    if (!data) {
      setMessage("불러오기에 실패했습니다. 파일을 확인해 주세요.");
      return;
    }
    importData(data);
    setNickname(data.user?.nickname ?? "");
    setFoundedAt(data.user?.foundedAt?.slice(0, 10) ?? "");
    setMessage("데이터를 불러왔습니다.");
    event.target.value = "";
  }

  function handleReset() {
    if (window.confirm("모든 데이터를 삭제할까요? 되돌릴 수 없습니다.")) {
      resetAll();
      setMessage("데이터를 초기화했습니다.");
    }
  }

  return (
    <>
      <PageHeader title="설정" description="대표 정보와 데이터 백업을 관리합니다." />

      <div className="flex flex-col gap-4">
        <Card>
          <CardTitle hint={user ? `설립일 ${formatDate(user.foundedAt)}` : undefined}>
            대표 정보
          </CardTitle>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-brand-dark">닉네임</span>
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                className="h-11 rounded-xl border border-border px-3 text-sm outline-none transition-colors focus:border-brand"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-brand-dark">설립일</span>
              <input
                type="date"
                value={foundedAt}
                onChange={(event) => setFoundedAt(event.target.value)}
                className="num h-11 rounded-xl border border-border px-3 text-sm outline-none transition-colors focus:border-brand"
              />
            </label>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  updateUser({ nickname, foundedAt });
                  setMessage("대표 정보를 저장했습니다.");
                }}
              >
                저장
              </Button>
            </div>
          </div>
        </Card>

        <AccountPanel />

        <Card>
          <CardTitle hint="JSON">데이터 백업</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleExport}>
              <Download size={16} />
              내보내기
            </Button>
            <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand-soft px-4 text-sm font-medium text-brand transition-colors hover:bg-border">
              <Upload size={16} />
              불러오기
              <input
                type="file"
                accept="application/json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-muted">
            개인 금융정보는 브라우저(로컬 저장소)에만 저장됩니다. 정기적으로 백업하세요.
          </p>
        </Card>

        <Card>
          <CardTitle hint="되돌릴 수 없음">데이터 초기화</CardTitle>
          <Button variant="danger" onClick={handleReset}>
            <RotateCcw size={16} />
            모든 데이터 삭제
          </Button>
        </Card>

        {message ? <p className="text-sm text-positive">{message}</p> : null}
      </div>
    </>
  );
}
