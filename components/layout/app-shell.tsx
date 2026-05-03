"use client";

import { useState } from "react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AppFooter } from "@/components/layout/app-footer";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { ProtectedRoute } from "@/components/layout/protected-route";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-slate-50">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="z-[100] w-72 p-0">
            <AppSidebar onNavigate={() => setIsSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        <aside className="fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 border-r border-violet-100 bg-white">
          <AppSidebar />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-col pl-72">
          <AppTopbar onOpenSidebar={() => setIsSidebarOpen(true)} />

          <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>

          <AppFooter />
        </div>
      </div>
    </ProtectedRoute>
  );
}
