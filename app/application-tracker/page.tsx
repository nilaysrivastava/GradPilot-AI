"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  Landmark,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  buildApplicationTrackerResult,
  type ApplicationTrackerResult,
  type TrackerBucket,
  type TrackerStatus,
  type TrackerTask,
} from "@/lib/application-tracker-engine";
import { useProfileStore } from "@/store/useProfileStore";

type TrackerApiResponse = {
  success: boolean;
  message: string;
  result?: ApplicationTrackerResult;
};

export default function ApplicationTrackerPage() {
  const profile = useProfileStore((state) => state.profile);

  const [result, setResult] = useState<ApplicationTrackerResult | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const localResult = useMemo(() => {
    return profile ? buildApplicationTrackerResult(profile) : null;
  }, [profile]);

  const activeResult = result ?? localResult;

  async function refreshTracker() {
    if (!profile) return;

    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/application-tracker", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      const data = (await response.json()) as TrackerApiResponse;

      if (response.ok && data.success && data.result) {
        setResult(data.result);
        setStatus("Application Tracker refreshed using backend logic.");
      } else {
        setResult(buildApplicationTrackerResult(profile));
        setStatus("Application Tracker refreshed locally for the prototype.");
      }
    } catch {
      setResult(buildApplicationTrackerResult(profile));
      setStatus("Application Tracker refreshed locally for the prototype.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!profile || !activeResult) {
    return (
      <AppShell>
        <section className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
            <ShieldCheck className="size-7" />
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Build your <span className="gradient-text">Digital Twin</span>{" "}
            first.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            The tracker needs your profile before it can track application,
            document, loan, and visa readiness.
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
                Application Tracker
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Track applications, documents, loans, and{" "}
                <span className="gradient-text">visa readiness</span>.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                GradPilot turns your study journey into a live tracker with
                AI-prioritized tasks, blockers, and next actions.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={refreshTracker}
                  disabled={isLoading}
                  className="rounded-2xl shadow-glow"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Refreshing
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 size-4" />
                      Refresh Tracker
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                >
                  <Link href="/timeline">Open Timeline</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 p-1">
              <div className="h-full rounded-[1.35rem] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Overall progress
                    </p>
                    <p className="mt-2 text-5xl font-bold text-slate-950">
                      {activeResult.overallProgress}%
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {activeResult.selectedPath}
                    </p>
                  </div>

                  <div className="flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
                    <ClipboardCheck className="size-7" />
                  </div>
                </div>

                <Progress
                  value={activeResult.overallProgress}
                  className="mt-5 h-3"
                />

                <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
                  <p className="text-sm leading-6 text-slate-300">
                    {activeResult.aiSummary}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MiniMetric label="Active" value={String(activeResult.activeTasks)} />
                  <MiniMetric label="Blocked" value={String(activeResult.blockedTasks)} />
                  <MiniMetric label="Loan" value={`${activeResult.loanProgress}%`} />
                  <MiniMetric label="Visa" value={`${activeResult.visaReadiness}%`} />
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
          <MetricCard
            icon={GraduationCap}
            label="Application"
            value={`${activeResult.applicationReadiness}%`}
            description="Shortlist and application readiness."
          />
          <MetricCard
            icon={FileCheck2}
            label="Documents"
            value={`${activeResult.documentProgress}%`}
            description="Loan and application documents."
          />
          <MetricCard
            icon={Landmark}
            label="Loan Progress"
            value={`${activeResult.loanProgress}%`}
            description="Eligibility and offer readiness."
          />
          <MetricCard
            icon={ShieldCheck}
            label="Visa Readiness"
            value={`${activeResult.visaReadiness}%`}
            description="Visa and final decision readiness."
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Blockers
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  What can slow you down
                </h2>
              </div>
              <AlertTriangle className="size-7 text-amber-600" />
            </div>

            <div className="space-y-3">
              {activeResult.blockers.map((blocker) => (
                <div key={blocker} className="flex gap-3 rounded-2xl bg-amber-50 p-4">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" />
                  <p className="text-sm leading-6 text-amber-800">{blocker}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Upcoming Tasks
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Prioritized next actions
                </h2>
              </div>
              <CalendarCheck className="size-7 text-violet-700" />
            </div>

            <div className="space-y-4">
              {activeResult.upcomingTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Full Tracker
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Stage-wise progress
              </h2>
            </div>
            <Target className="size-7 text-violet-700" />
          </div>

          <div className="space-y-5">
            {activeResult.buckets.map((bucket) => (
              <BucketCard key={bucket.title} bucket={bucket} />
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-violet-100 bg-slate-950 p-6 text-white shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-semibold">Recommended next actions</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                These actions connect application progress to financing and
                conversion readiness.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {activeResult.nextActions.map((action) => (
                <div key={action} className="flex gap-3 rounded-2xl bg-white/10 p-4">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-violet-300" />
                  <p className="text-sm leading-6 text-slate-200">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: LucideIcon;
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

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-violet-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function TaskCard({ task }: { task: TrackerTask }) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-slate-50/70 p-5">
      <div className="mb-3 flex flex-wrap gap-2">
        <StatusBadge status={task.status} />
        <Badge className="rounded-full bg-white text-slate-600 hover:bg-white">
          {task.priority}
        </Badge>
        <Badge className="rounded-full bg-white text-slate-600 hover:bg-white">
          {task.category}
        </Badge>
      </div>

      <h3 className="font-semibold text-slate-950">{task.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
      <p className="mt-3 text-xs font-medium text-violet-700">{task.dueLabel}</p>
    </div>
  );
}

function BucketCard({ bucket }: { bucket: TrackerBucket }) {
  return (
    <div className="rounded-[1.75rem] border border-violet-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex gap-2">
            <StatusBadge status={bucket.status} />
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">
            {bucket.title}
          </h3>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-sm text-slate-500">Progress</p>
          <p className="text-2xl font-bold text-violet-700">{bucket.progress}%</p>
        </div>
      </div>

      <Progress value={bucket.progress} className="h-3" />

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {bucket.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TrackerStatus }) {
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

  if (status === "Blocked") {
    return (
      <Badge className="rounded-full bg-red-50 text-red-700 hover:bg-red-50">
        Blocked
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100">
      Upcoming
    </Badge>
  );
}