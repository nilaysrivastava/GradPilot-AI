"use client";

import Link from "next/link";
import { ArrowRight, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Platform", href: "#platform" },
  { label: "AI Tools", href: "#ai-tools" },
  { label: "Loan Engine", href: "#loan-engine" },
  { label: "Impact", href: "#impact" },
];

export function LandingNavbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-violet-100/80 bg-white/80 backdrop-blur-xl">
      <div className="container-xl flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-glow">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-950">
              GradPilot AI
            </p>
            <p className="-mt-1 text-xs font-medium text-slate-500">
              Study. Decide. Finance.
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-violet-700"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            asChild
            variant="ghost"
            className="rounded-2xl text-slate-700 hover:bg-violet-50 hover:text-violet-700"
          >
            <Link href="/login">Login</Link>
          </Button>

          <Button asChild className="rounded-2xl px-5 shadow-glow">
            <Link href="/signup">
              Start Free
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="rounded-2xl border-violet-100 bg-white md:hidden"
        >
          <Menu className="size-5" />
        </Button>
      </div>
    </header>
  );
}
