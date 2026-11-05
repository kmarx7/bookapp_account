"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const noopSubscribe = () => () => {};

function subscribeStandalone(callback: () => void) {
  const query = window.matchMedia("(display-mode: standalone)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function useIsInstalled(): boolean {
  return useSyncExternalStore(
    subscribeStandalone,
    () => window.matchMedia("(display-mode: standalone)").matches,
    () => false,
  );
}

function useIsIOS(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => /iPad|iPhone|iPod/.test(navigator.userAgent),
    () => false,
  );
}

export function InstallPrompt() {
  const installed = useIsInstalled();
  const isIOS = useIsIOS();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (installed || (!deferred && !isIOS)) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return (
    <Card>
      <CardTitle hint="PWA">앱으로 설치하기</CardTitle>
      {deferred ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            홈 화면에 추가하면 인터넷 없이도 빠르게 열 수 있어요.
          </p>
          <Button size="sm" onClick={install}>
            <Download size={16} />
            설치
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted">
          공유 버튼을 누른 뒤{" "}
          <strong className="text-brand-dark">홈 화면에 추가</strong>를 선택하면 앱처럼
          설치돼요.
        </p>
      )}
    </Card>
  );
}
