"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";

export default function OnboardingPage() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const [nickname, setNickname] = useState("");
  const [foundedAt, setFoundedAt] = useState(
    new Date().toISOString().slice(0, 10),
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) return;

    setUser({
      id: crypto.randomUUID(),
      nickname: trimmed,
      foundedAt,
      createdAt: new Date().toISOString(),
    });
    router.replace("/");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-muted">1인가구 재무제표</p>
        <h1 className="mt-1 text-2xl font-bold text-brand">
          당신은 이미 대표입니다
        </h1>
        <p className="mt-2 text-sm text-muted">
          나만의 회사를 세우고, 매달 결산을 시작해 보세요.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-brand-dark">대표님 성함(닉네임)</span>
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="예: 이모 대표"
            className="h-11 rounded-xl border border-border px-3 text-sm outline-none transition-colors focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-brand-dark">회사 설립일</span>
          <input
            type="date"
            value={foundedAt}
            onChange={(event) => setFoundedAt(event.target.value)}
            className="num h-11 rounded-xl border border-border px-3 text-sm outline-none transition-colors focus:border-brand"
          />
        </label>
      </div>

      <Button type="submit" disabled={!nickname.trim()}>
        설립하고 시작하기
      </Button>
    </form>
  );
}
