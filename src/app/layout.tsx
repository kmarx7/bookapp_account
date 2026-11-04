import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreHydrator } from "@/components/layout/StoreHydrator";
import { AppGate } from "@/components/layout/AppGate";

export const metadata: Metadata = {
  title: "내가 대표 — 1인가구 재무제표",
  description: "가계부가 아니라 재무제표. 1인가구를 위한 월간/연간 결산 웹앱.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1b2a4a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full antialiased">
        <StoreHydrator>
          <AppGate>{children}</AppGate>
        </StoreHydrator>
      </body>
    </html>
  );
}
