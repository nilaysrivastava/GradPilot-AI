"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Sparkles,
  UserCircle,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";

type GlobalTopbarProps = {
  pageTitle?: string;
  showMenuButton?: boolean;
  onOpenSidebar?: () => void;
};

export function GlobalTopbar({
  pageTitle = "GradPilot AI",
  showMenuButton = false,
  onOpenSidebar,
}: GlobalTopbarProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const { session, logout } = useAuthStore();
  const clearProfile = useProfileStore((state) => state.clearProfile);

  const isLoggedIn = Boolean(session);

  const initials =
    session?.user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "GP";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;

      if (!menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    if (session?.token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
    }

    setIsProfileMenuOpen(false);
    logout();
    clearProfile();
    router.push("/");
  }

  return (
    <header className="sticky top-4 z-[5000] mb-8 w-full px-3 sm:px-5 lg:px-2">
      <div className="mx-auto flex h-16 w-full items-center justify-between gap-4 rounded-full border border-white/60 bg-white/55 px-4 shadow-[0_20px_70px_rgba(88,28,135,0.18)] ring-1 ring-violet-100/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/45 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          {showMenuButton ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onOpenSidebar}
              className="size-10 rounded-full border-white/70 bg-white/60 shadow-sm backdrop-blur-xl hover:bg-white/80 lg:hidden"
            >
              <Menu className="size-5" />
            </Button>
          ) : null}

          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 rounded-full pr-2 transition hover:opacity-90"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-glow">
              <Sparkles className="size-5" />
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-base font-bold tracking-tight text-slate-950">
                GradPilot AI
              </p>
              <p className="-mt-1 truncate text-xs font-medium text-slate-500">
                Student financing intelligence
              </p>
            </div>
          </Link>

          <div className="ml-2 hidden h-8 w-px bg-violet-100/80 xl:block" />

          <div className="hidden min-w-0 xl:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-600">
              Workspace
            </p>
            <h1 className="-mt-0.5 truncate text-base font-semibold tracking-tight text-slate-950">
              {pageTitle}
            </h1>
          </div>
        </div>

        <nav className="flex shrink-0 items-center gap-2">
          {isLoggedIn ? (
            <>
              <Button
                asChild
                variant="outline"
                className="hidden h-10 rounded-full border-violet-200 bg-white/60 px-4 text-violet-700 shadow-sm backdrop-blur-xl hover:bg-white/80 sm:inline-flex"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 size-4" />
                  Dashboard
                </Link>
              </Button>

              <Button
                type="button"
                onClick={handleLogout}
                variant="outline"
                className="hidden h-10 rounded-full border-violet-200 bg-white/60 px-4 text-violet-700 shadow-sm backdrop-blur-xl hover:bg-white/80 lg:inline-flex"
              >
                <LogOut className="mr-2 size-4" />
                Logout
              </Button>

              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((current) => !current)}
                  className="flex h-11 items-center gap-3 rounded-full border border-white/70 bg-white/60 px-2 pr-3 text-left shadow-sm backdrop-blur-xl transition hover:bg-white/80"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-violet-100 text-xs font-bold text-violet-700">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden max-w-36 text-left md:block">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {session?.user.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {session?.user.email}
                    </p>
                  </div>

                  <ChevronDown
                    className={`size-4 text-slate-400 transition ${
                      isProfileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileMenuOpen ? (
                  <div className="absolute right-0 top-14 z-[99999] w-72 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/80 shadow-[0_20px_70px_rgba(88,28,135,0.18)] backdrop-blur-2xl">
                    <div className="border-b border-violet-100/80 bg-violet-50/60 p-4">
                      <p className="font-semibold text-slate-950">
                        {session?.user.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {session?.user.email}
                      </p>
                    </div>

                    <div className="p-2">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                      >
                        <UserCircle className="size-4" />
                        Profile
                      </Link>

                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                      >
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="size-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                className="h-10 rounded-full border-violet-200 bg-white/60 px-4 text-violet-700 shadow-sm backdrop-blur-xl hover:bg-white/80"
              >
                <Link href="/login">
                  <LogIn className="mr-2 size-4" />
                  Login
                </Link>
              </Button>

              <Button asChild className="h-10 rounded-full px-4 shadow-glow">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}