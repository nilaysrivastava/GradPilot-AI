"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !session) {
      router.replace("/login");
    }
  }, [hasHydrated, session, router]);

  if (!hasHydrated) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center px-4">
        <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-950">
                Preparing your workspace
              </p>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" />
                Loading GradPilot session...
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
