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
    <header className="sticky top-0 z-[5000] w-full border-b border-violet-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {showMenuButton ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onOpenSidebar}
              className="rounded-2xl border-violet-100 bg-white"
            >
              <Menu className="size-5" />
            </Button>
          ) : null}

          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-glow">
              <Sparkles className="size-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-bold tracking-tight text-slate-950">
                GradPilot AI
              </p>
              <p className="-mt-1 hidden truncate text-xs font-medium text-slate-500 sm:block">
                Student financing intelligence
              </p>
            </div>
          </Link>

          <div className="ml-4 hidden h-8 w-px bg-violet-100 md:block" />

          <div className="hidden min-w-0 md:block">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
              Workspace
            </p>
            <h1 className="truncate text-xl font-semibold tracking-tight text-slate-950">
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
                className="hidden rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50 sm:inline-flex"
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
                className="hidden rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50 lg:inline-flex"
              >
                <LogOut className="mr-2 size-4" />
                Logout
              </Button>

              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((current) => !current)}
                  className="flex h-11 items-center gap-3 rounded-2xl border border-violet-100 bg-white px-2 pr-3 text-left transition hover:bg-violet-50"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-violet-100 text-xs font-bold text-violet-700">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden max-w-36 text-left sm:block">
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
                  <div className="absolute right-0 top-14 z-[99999] w-72 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-soft">
                    <div className="border-b border-violet-100 p-4">
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
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                      >
                        <UserCircle className="size-4" />
                        Profile
                      </Link>

                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                      >
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
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
                className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
              >
                <Link href="/login">
                  <LogIn className="mr-2 size-4" />
                  Login
                </Link>
              </Button>

              <Button asChild className="rounded-2xl shadow-glow">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
