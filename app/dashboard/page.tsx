"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Compass,
  FileCheck2,
  Gauge,
  GraduationCap,
  Landmark,
  LineChart,
  Sparkles,
  Target,
  UserCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  buildDashboardInsights,
  type DashboardNudge,
} from "@/lib/dashboard-insights";
import { useProfileStore } from "@/store/useProfileStore";

const quickActions = [
  {
    title: "Career Navigator",
    description: "Find best-fit countries, universities, and courses.",
    href: "/career-navigator",
    icon: Compass,
    tag: "AI recommendation",
  },
  {
    title: "ROI Calculator",
    description: "Compare total cost, salary, EMI, and payback period.",
    href: "/roi-calculator",
    icon: LineChart,
    tag: "Financial clarity",
  },
  {
    title: "Admission Predictor",
    description: "Estimate safe, match, and ambitious university chances.",
    href: "/admission-predictor",
    icon: GraduationCap,
    tag: "Predictive model",
  },
  {
    title: "Loan Engine",
    description: "Estimate eligibility, EMI, offers, and document readiness.",
    href: "/loan-engine",
    icon: Landmark,
    tag: "Conversion layer",
  },
];

export default function DashboardPage() {
  const profile = useProfileStore((state) => state.profile);
  const insights = buildDashboardInsights(profile);

  if (!insights) {
    return (
      <AppShell>
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-sm">
            <div className="mb-5 flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
              <UserCircle className="size-7" />
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Build your <span className="gradient-text">Digital Twin</span>{" "}
              first.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Your dashboard becomes personalized after you create your student
              profile. This profile will power recommendations, ROI, admissions,
              timeline, and loan readiness.
            </p>

            <Button asChild className="mt-8 rounded-2xl shadow-glow">
              <Link href="/profile">
                Start Digital Twin
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-sm">
          <div className="grid gap-8 p-6 xl:grid-cols-[1fr_0.72fr] xl:p-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                <Sparkles className="size-4" />
                Personalized Student Command Center
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Hi {insights.studentName}, your{" "}
                <span className="gradient-text">AI journey map</span> is ready.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                {insights.headline}. {insights.summary}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="rounded-2xl shadow-glow">
                  <Link href={insights.nextBestAction.href}>
                    {insights.nextBestAction.actionLabel}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                >
                  <Link href="/profile">Update Digital Twin</Link>
                </Button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <HeroMiniStat
                  icon={Target}
                  label="Overall Readiness"
                  value={`${insights.overallReadiness}%`}
                />
                <HeroMiniStat
                  icon={Compass}
                  label="Next Stage"
                  value="Shortlist"
                />
                <HeroMiniStat
                  icon={BadgeIndianRupee}
                  label="Loan Path"
                  value="Prepared"
                />
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 p-1">
              <div className="h-full rounded-[1.35rem] bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Overall readiness
                    </p>
                    <p className="mt-2 text-5xl font-bold text-slate-950">
                      {insights.overallReadiness}%
                    </p>
                  </div>

                  <div className="flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
                    <Gauge className="size-7" />
                  </div>
                </div>

                <Progress
                  value={insights.overallReadiness}
                  className="mt-5 h-3"
                />

                <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
                  <div className="flex gap-4">
                    <Bot className="mt-1 size-6 shrink-0 text-violet-300" />
                    <div>
                      <p className="font-semibold">AI Mentor Nudge</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {insights.nextBestAction.description}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="mt-5 w-full rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                >
                  <Link href={insights.nextBestAction.href}>
                    {insights.nextBestAction.actionLabel}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {insights.readinessCards.map((card) => (
            <ReadinessCard
              key={card.title}
              title={card.title}
              score={card.score}
              label={card.label}
              description={card.description}
            />
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Smart Nudges
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  AI-generated next actions
                </h2>
              </div>

              <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <Bot className="size-6" />
              </div>
            </div>

            <div className="space-y-4">
              {insights.nudges.map((nudge) => (
                <NudgeCard key={nudge.title} nudge={nudge} />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Journey Progress
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  From discovery to loan conversion
                </h2>
              </div>

              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CalendarCheck className="size-6" />
              </div>
            </div>

            <div className="space-y-4">
              {insights.journeySteps.map((step, index) => (
                <JourneyStepCard
                  key={step.title}
                  index={index + 1}
                  title={step.title}
                  description={step.description}
                  status={step.status}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-[1.75rem] border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white">
                  <action.icon className="size-6" />
                </div>

                <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100">
                  {action.tag}
                </Badge>
              </div>

              <h3 className="text-lg font-semibold text-slate-950">
                {action.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {action.description}
              </p>

              <div className="mt-5 flex items-center text-sm font-semibold text-violet-700">
                Open module
                <ArrowRight className="ml-2 size-4" />
              </div>
            </Link>
          ))}
        </section>

        <section className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Decision Intelligence Pipeline
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Your Digital Twin now powers the full platform.
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                The next modules will reuse your saved profile to generate
                country fit, university match, ROI score, admission probability,
                application roadmap, and personalized loan eligibility.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <PipelineCard icon={UserCircle} title="Profile" status="Active" />
              <PipelineCard icon={Compass} title="Recommend" status="Next" />
              <PipelineCard icon={LineChart} title="Analyze" status="Soon" />
              <PipelineCard icon={Landmark} title="Finance" status="Soon" />
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function HeroMiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-white/80 p-4 shadow-sm">
      <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ReadinessCard({
  title,
  score,
  label,
  description,
}: {
  title: string;
  score: number;
  label: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-violet-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-4xl font-bold text-slate-950">{score}%</p>
        </div>

        <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
          {label}
        </Badge>
      </div>

      <Progress value={score} className="h-3" />

      <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function NudgeCard({ nudge }: { nudge: DashboardNudge }) {
  const priorityClass =
    nudge.priority === "High"
      ? "bg-red-50 text-red-700"
      : nudge.priority === "Medium"
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-emerald-700";

  return (
    <div className="rounded-3xl border border-violet-100 bg-slate-50/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Badge
              className={`rounded-full ${priorityClass} hover:${priorityClass}`}
            >
              {nudge.priority}
            </Badge>
            <span className="text-xs font-medium text-slate-400">AI nudge</span>
          </div>

          <h3 className="font-semibold text-slate-950">{nudge.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {nudge.description}
          </p>
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        className="mt-4 rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
      >
        <Link href={nudge.href}>
          {nudge.actionLabel}
          <ArrowRight className="ml-2 size-4" />
        </Link>
      </Button>
    </div>
  );
}

function JourneyStepCard({
  index,
  title,
  description,
  status,
}: {
  index: number;
  title: string;
  description: string;
  status: "Completed" | "Active" | "Upcoming";
}) {
  const isCompleted = status === "Completed";
  const isActive = status === "Active";

  return (
    <div className="flex gap-4 rounded-3xl border border-violet-100 bg-white p-4 shadow-sm">
      <div
        className={
          isCompleted
            ? "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
            : isActive
            ? "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white"
            : "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"
        }
      >
        {isCompleted ? (
          <CheckCircle2 className="size-5" />
        ) : (
          <span className="text-sm font-bold">{index}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-950">{title}</h3>
          <Badge
            className={
              isCompleted
                ? "rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                : isActive
                ? "rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100"
                : "rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100"
            }
          >
            {status}
          </Badge>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function PipelineCard({
  icon: Icon,
  title,
  status,
}: {
  icon: typeof FileCheck2;
  title: string;
  status: string;
}) {
  return (
    <div className="rounded-3xl bg-violet-50 p-5 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm">
        <Icon className="size-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-xs font-medium text-violet-600">{status}</p>
    </div>
  );
}
