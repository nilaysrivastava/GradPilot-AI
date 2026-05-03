"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeIndianRupee,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Landmark,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  buildTimelineEngineResult,
  type TimelineEngineResult,
  type TimelinePhase,
  type TimelinePriority,
  type TimelineStatus,
  type TimelineTask,
} from "@/lib/timeline-engine";
import { useProfileStore } from "@/store/useProfileStore";

type TimelineApiResponse = {
  success: boolean;
  message: string;
  result?: TimelineEngineResult;
};

export default function TimelinePage() {
  const profile = useProfileStore((state) => state.profile);

  const [result, setResult] = useState<TimelineEngineResult | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const localResult = useMemo(() => {
    return profile ? buildTimelineEngineResult(profile) : null;
  }, [profile]);

  const activeResult = result ?? localResult;

  async function generateTimeline() {
    if (!profile) return;

    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/timeline", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile }),
      });

      const data = (await response.json()) as TimelineApiResponse;

      if (response.ok && data.success && data.result) {
        setResult(data.result);
        setStatus("Application timeline generated using backend logic.");
      } else {
        setResult(buildTimelineEngineResult(profile));
        setStatus("Timeline generated locally for the prototype.");
      }
    } catch {
      setResult(buildTimelineEngineResult(profile));
      setStatus("Timeline generated locally for the prototype.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!profile || !activeResult) {
    return (
      <AppShell>
        <section className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
            <CalendarCheck className="size-7" />
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Build your <span className="gradient-text">Digital Twin</span>{" "}
            first.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Timeline Generator needs your target intake, countries, test status,
            budget, and loan requirement before it can create a roadmap.
          </p>

          <Button asChild className="mt-8 rounded-2xl shadow-glow">
            <Link href="/profile">
              Complete Digital Twin
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </section>
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
                Application Timeline Generator
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Your personalized roadmap for{" "}
                <span className="gradient-text">
                  {activeResult.targetIntake}
                </span>
                .
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                GradPilot converts your Digital Twin into a step-by-step plan
                for tests, shortlisting, SOP/LORs, applications, loan documents,
                visa readiness, and final decision-making.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={generateTimeline}
                  disabled={isLoading}
                  className="rounded-2xl shadow-glow"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Generating
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 size-4" />
                      Regenerate Timeline
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                >
                  <Link href="/admission-predictor">
                    Check Admission Chances
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 p-1">
              <div className="h-full rounded-[1.35rem] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Timeline readiness
                    </p>
                    <p className="mt-2 text-5xl font-bold text-slate-950">
                      {activeResult.readinessScore}%
                    </p>
                  </div>

                  <div className="flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
                    <CalendarCheck className="size-7" />
                  </div>
                </div>

                <Progress
                  value={activeResult.readinessScore}
                  className="mt-5 h-3"
                />

                <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
                  <div className="flex gap-4">
                    <Bot className="mt-1 size-6 shrink-0 text-violet-300" />
                    <p className="text-sm leading-6 text-slate-300">
                      {activeResult.aiSummary}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <SnapshotMetric
                    label="Total Tasks"
                    value={activeResult.totalTasks}
                  />
                  <SnapshotMetric
                    label="Active"
                    value={activeResult.activeTasks}
                  />
                  <SnapshotMetric
                    label="Completed"
                    value={activeResult.completedTasks}
                  />
                  <SnapshotMetric
                    label="High Priority"
                    value={activeResult.highPriorityTasks}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {status ? (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Target}
            label="Target Intake"
            value={activeResult.targetIntake}
            description="Timeline is personalized around your intake target."
          />
          <SummaryCard
            icon={Clock}
            label="Next Tasks"
            value={String(activeResult.nextTasks.length)}
            description="Most important upcoming actions."
          />
          <SummaryCard
            icon={ShieldCheck}
            label="Completed"
            value={String(activeResult.completedTasks)}
            description="Tasks already treated as ready."
          />
          <SummaryCard
            icon={BadgeIndianRupee}
            label="Loan Readiness"
            value={profile.needsLoan ? "Needed" : "Not Needed"}
            description="Finance tasks are included in your roadmap."
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Next Best Actions
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  What you should do first
                </h2>
              </div>

              <TimerReset className="size-7 text-violet-700" />
            </div>

            <div className="space-y-4">
              {activeResult.nextTasks.map((task) => (
                <NextTaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Weekly Focus
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  AI-generated focus plan
                </h2>
              </div>

              <Bot className="size-7 text-violet-700" />
            </div>

            <div className="space-y-3">
              {activeResult.weeklyFocus.map((focus) => (
                <div
                  key={focus}
                  className="flex gap-3 rounded-2xl bg-violet-50 p-4"
                >
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <p className="text-sm leading-6 text-slate-700">{focus}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="font-semibold">Demo talking point</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                This timeline keeps users engaged after discovery. It creates
                repeat visits through tasks, nudges, reminders, and financing
                checkpoints.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Full Timeline
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Step-by-step application roadmap
              </h2>
            </div>

            <CalendarCheck className="size-7 text-violet-700" />
          </div>

          <div className="space-y-5">
            {activeResult.phases.map((phase, index) => (
              <TimelinePhaseCard
                key={phase.title}
                phase={phase}
                index={index + 1}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <ActionPanel
            icon={GraduationCap}
            title="Use admission predictor next"
            description="Check which universities are safe, match, and ambitious before locking your application list."
            href="/admission-predictor"
            action="Predict admissions"
          />

          <ActionPanel
            icon={Landmark}
            title="Plan financing early"
            description="Loan eligibility and document readiness should start before admits arrive, not after."
            href="/loan-engine"
            action="Open loan engine"
          />
        </section>
      </div>
    </AppShell>
  );
}

function SnapshotMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-violet-50 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof CalendarCheck;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-violet-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
        <Icon className="size-6" />
      </div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function NextTaskCard({ task }: { task: TimelineTask }) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-slate-50/70 p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
        <Badge className="rounded-full bg-white text-slate-600 hover:bg-white">
          {task.category}
        </Badge>
      </div>

      <h3 className="font-semibold text-slate-950">{task.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {task.description}
      </p>

      <div className="mt-4 rounded-2xl bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
          AI reason
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{task.aiReason}</p>
      </div>
    </div>
  );
}

function TimelinePhaseCard({
  phase,
  index,
}: {
  phase: TimelinePhase;
  index: number;
}) {
  return (
    <div className="rounded-[1.75rem] border border-violet-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-sm font-bold text-white shadow-glow">
            {index}
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={phase.status} />
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">
              {phase.title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {phase.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {phase.tasks.map((task) => (
          <TimelineTaskRow key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function TimelineTaskRow({ task }: { task: TimelineTask }) {
  return (
    <div className="rounded-3xl bg-violet-50/70 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <Badge className="rounded-full bg-white text-slate-600 hover:bg-white">
          {task.dueLabel}
        </Badge>
      </div>

      <h4 className="font-semibold text-slate-950">{task.title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {task.description}
      </p>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: TimelinePriority }) {
  if (priority === "High") {
    return (
      <Badge className="rounded-full bg-red-50 text-red-700 hover:bg-red-50">
        High
      </Badge>
    );
  }

  if (priority === "Medium") {
    return (
      <Badge className="rounded-full bg-amber-50 text-amber-700 hover:bg-amber-50">
        Medium
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
      Low
    </Badge>
  );
}

function StatusBadge({ status }: { status: TimelineStatus }) {
  if (status === "Completed") {
    return (
      <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        Completed
      </Badge>
    );
  }

  if (status === "Active") {
    return (
      <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
        Active
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100">
      Upcoming
    </Badge>
  );
}

function ActionPanel({
  icon: Icon,
  title,
  description,
  href,
  action,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
        <Icon className="size-6" />
      </div>

      <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

      <Button asChild className="mt-6 rounded-2xl shadow-glow">
        <Link href={href}>
          {action}
          <ArrowRight className="ml-2 size-4" />
        </Link>
      </Button>
    </div>
  );
}
