import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl">
      <Sidebar />
      <div className="flex w-full min-w-0 flex-col">
        <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-12">
          {children}
        </main>
        <BottomTabBar />
      </div>
    </div>
  );
}
