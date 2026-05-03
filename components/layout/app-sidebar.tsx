"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { sidebarRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  onNavigate?: () => void;
};

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-72 flex-col bg-white">
      <div className="flex h-20 shrink-0 items-center border-b border-violet-100 px-5">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-glow">
            <Sparkles className="size-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-tight text-slate-950">
              GradPilot AI
            </p>
            <p className="-mt-1 truncate text-xs font-medium text-slate-500">
              Student Command Center
            </p>
          </div>
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Workspace
        </p>

        <nav className="space-y-1">
          {sidebarRoutes.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-violet-600 text-white shadow-glow"
                    : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                )}
              >
                <item.icon
                  className={cn(
                    "size-5 shrink-0",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-violet-700"
                  )}
                />

                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      
    </div>
  );
}
