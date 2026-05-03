import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type ModulePlaceholderProps = {
  icon: LucideIcon;
  title: string;
  eyebrow: string;
  description: string;
  features: string[];
  nextStepLabel?: string;
};

export function ModulePlaceholder({
  icon: Icon,
  title,
  eyebrow,
  description,
  features,
  nextStepLabel = "Coming in upcoming steps",
}: ModulePlaceholderProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
      <section className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
          <Icon className="size-7" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
          {eyebrow}
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          {description}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="rounded-2xl shadow-glow">
            <Link href="/profile">
              Build student profile
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
          >
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
        <p className="font-semibold text-slate-950">Module scope</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{nextStepLabel}</p>

        <div className="mt-6 space-y-3">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex gap-3 rounded-2xl bg-violet-50/70 p-4"
            >
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              <p className="text-sm leading-6 text-slate-700">{feature}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
