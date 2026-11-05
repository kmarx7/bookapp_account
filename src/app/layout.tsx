import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreHydrator } from "@/components/layout/StoreHydrator";
import { AppGate } from "@/components/layout/AppGate";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

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
  themeColor: "#1b2a4a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full antialiased">
        <StoreHydrator>
          <AppGate>{children}</AppGate>
        </StoreHydrator>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
