import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreHydrator } from "@/components/layout/StoreHydrator";
import { AppGate } from "@/components/layout/AppGate";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { SyncManager } from "@/components/sync/SyncManager";

export const metadata: Metadata = {
  title: "내가 대표 — 1인가구 재무제표",
  description: "가계부가 아니라 재무제표. 1인가구를 위한 월간/연간 결산 웹앱.",
  applicationName: "내가 대표",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "내가 대표",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1b2a4a",
};

/**
 * Pretendard는 CDN에서 가져온다. CSS `@import`로 두면 브라우저가 우리 CSS를 파싱한 뒤에야
 * CDN 요청을 시작해 첫 페인트가 그만큼 늦어진다(Lighthouse render-blocking 838ms).
 * HTML에서 바로 preconnect/preload로 시작해 병렬로 받는다. 로드 전에는 @theme의
 * 시스템 폰트 스택으로 먼저 그려지므로 텍스트가 비어 보이지 않는다.
 */
const PRETENDARD_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="preload" as="style" href={PRETENDARD_CSS} />
        <link rel="stylesheet" href={PRETENDARD_CSS} />
      </head>
      <body className="min-h-full antialiased">
        <StoreHydrator>
          <AppGate>{children}</AppGate>
        </StoreHydrator>
        <ServiceWorkerRegister />
        <SyncManager />
      </body>
    </html>
  );
}
