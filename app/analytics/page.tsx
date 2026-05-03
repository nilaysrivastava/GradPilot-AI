"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  LineChart,
  Loader2,
  PieChart,
  RefreshCcw,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/layout/app-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  buildAnalyticsEngineResult,
  type AnalyticsEngineResult,
  type AnalyticsInsight,
  type AnalyticsMetric,
  type BusinessImpactMetric,
  type FunnelMetric,
  type ModuleUsageMetric,
} from "@/lib/analytics-engine";
import { useProfileStore } from "@/store/useProfileStore";

type AnalyticsApiResponse = {
  success: boolean;
  message: string;
  result?: AnalyticsEngineResult;
};

export default function AnalyticsPage() {
  const profile = useProfileStore((state) => state.profile);

  const [result, setResult] = useState<AnalyticsEngineResult | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const localResult = useMemo(() => {
    return profile ? buildAnalyticsEngineResult(profile) : null;
  }, [profile]);

  const activeResult = result ?? localResult;

  async function generateAnalytics() {
    if (!profile) return;

    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/analytics", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile }),
      });

      const data = (await response.json()) as AnalyticsApiResponse;

      if (response.ok && data.success && data.result) {
        setResult(data.result);
        setStatus("Analytics generated using backend logic.");
      } else {
        setResult(buildAnalyticsEngineResult(profile));
        setStatus("Analytics generated locally for the prototype.");
      }
    } catch {
      setResult(buildAnalyticsEngineResult(profile));
      setStatus("Analytics generated locally for the prototype.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!profile || !activeResult) {
    return (
      <AppShell>
        <section className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
            <BarChart3 className="size-7" />
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Build your <span className="gradient-text">Digital Twin</span>{" "}
            first.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Analytics needs profile, recommendation, loan, timeline, and growth
            data before it can generate engagement and conversion metrics.
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

  const funnelChartData = activeResult.funnel.map((stage) => ({
    name: stage.stage,
    value: stage.users,
    conversion: stage.conversionRate,
  }));

  const moduleChartData = activeResult.moduleUsage.map((module) => ({
    module: module.module,
    Usage: module.usageScore,
    Completion: module.completionScore,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-sm">
          <div className="grid gap-8 p-6 xl:grid-cols-[1fr_0.72fr] xl:p-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                <Sparkles className="size-4" />
                Platform Analytics
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Engagement, conversion, and{" "}
                <span className="gradient-text">business impact metrics</span>.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                GradPilot analytics connects user engagement, AI module usage,
                ROI awareness, loan readiness, conversion funnel, and business
                value into one dashboard.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={generateAnalytics}
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
                      Refresh Analytics
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                >
                  <Link href="/growth-engine">Open Growth Engine</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 p-1">
              <div className="h-full rounded-[1.35rem] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Business impact score
                    </p>
                    <p className="mt-2 text-5xl font-bold text-slate-950">
                      {activeResult.businessImpactScore}%
                    </p>
                  </div>

                  <div className="flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
                    <BarChart3 className="size-7" />
                  </div>
                </div>

                <Progress
                  value={activeResult.businessImpactScore}
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

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <MiniMetric
                    label="Engage"
                    value={`${activeResult.engagementScore}%`}
                  />
                  <MiniMetric
                    label="Convert"
                    value={`${activeResult.conversionScore}%`}
                  />
                  <MiniMetric
                    label="Loan Lead"
                    value={`${activeResult.loanLeadScore}%`}
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
          {activeResult.metrics.map((metric) => (
            <AnalyticsMetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Conversion Funnel
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Awareness to loan intent
                </h2>
              </div>

              <PieChart className="size-7 text-violet-700" />
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip />
                  <Funnel
                    dataKey="value"
                    data={funnelChartData}
                    isAnimationActive
                  >
                    <LabelList
                      position="right"
                      fill="#334155"
                      stroke="none"
                      dataKey="name"
                    />
                    {funnelChartData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 space-y-4">
              {activeResult.funnel.map((stage) => (
                <FunnelRow key={stage.stage} stage={stage} />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  AI Insights
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  What analytics tells us
                </h2>
              </div>

              <Target className="size-7 text-violet-700" />
            </div>

            <div className="space-y-4">
              {activeResult.insights.map((insight) => (
                <InsightCard key={insight.title} insight={insight} />
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Module Usage Analytics
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Usage and completion across product modules
              </h2>
            </div>

            <LineChart className="size-7 text-violet-700" />
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="module"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="Usage" radius={[10, 10, 0, 0]} />
                <Bar dataKey="Completion" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeResult.moduleUsage.map((module) => (
              <ModuleUsageCard key={module.module} module={module} />
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {activeResult.businessImpact.map((impact) => (
            <BusinessImpactCard key={impact.title} impact={impact} />
          ))}
        </section>

        <section className="rounded-[2rem] border border-violet-100 bg-slate-950 p-6 text-white shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-white/10 text-violet-200">
                <Rocket className="size-6" />
              </div>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Analytics proves the business model.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                This dashboard shows how GradPilot moves students from awareness
                to engagement, trust, and loan conversion.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {[
                "AI tools create repeat engagement.",
                "Decision intelligence builds trust before conversion.",
                "Loan readiness turns student intent into qualified leads.",
                "Growth loops reduce acquisition cost through referrals and nudges.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl bg-white/10 p-4"
                >
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-violet-300" />
                  <p className="text-sm leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function AnalyticsMetricCard({ metric }: { metric: AnalyticsMetric }) {
  const toneClass =
    metric.tone === "positive"
      ? "bg-emerald-50 text-emerald-700"
      : metric.tone === "neutral"
      ? "bg-violet-100 text-violet-700"
      : "bg-amber-50 text-amber-700";

  return (
    <div className="rounded-[1.75rem] border border-violet-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <TrendingUp className="size-6" />
        </div>

        <Badge className={`rounded-full ${toneClass}`}>{metric.change}</Badge>
      </div>

      <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{metric.value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {metric.description}
      </p>
    </div>
  );
}

function FunnelRow({ stage }: { stage: FunnelMetric }) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-slate-50/70 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-950">{stage.stage}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {stage.users.toLocaleString("en-IN")} users
          </p>
        </div>

        <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
          {stage.conversionRate}% conversion
        </Badge>
      </div>

      <Progress value={stage.conversionRate} className="h-2" />

      <p className="mt-4 text-sm leading-6 text-slate-600">{stage.insight}</p>
    </div>
  );
}

function InsightCard({ insight }: { insight: AnalyticsInsight }) {
  const priorityClass =
    insight.priority === "High"
      ? "bg-red-50 text-red-700"
      : insight.priority === "Medium"
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-emerald-700";

  return (
    <div className="rounded-3xl border border-violet-100 bg-slate-50/70 p-5">
      <Badge className={`mb-3 rounded-full ${priorityClass}`}>
        {insight.priority}
      </Badge>
      <h3 className="font-semibold text-slate-950">{insight.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {insight.description}
      </p>
    </div>
  );
}

function ModuleUsageCard({ module }: { module: ModuleUsageMetric }) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-slate-50/70 p-5">
      <h3 className="font-semibold text-slate-950">{module.module}</h3>

      <div className="mt-4 space-y-4">
        <ScoreBar label="Usage" value={module.usageScore} />
        <ScoreBar label="Completion" value={module.completionScore} />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {module.businessValue}
      </p>
    </div>
  );
}

function BusinessImpactCard({ impact }: { impact: BusinessImpactMetric }) {
  return (
    <div className="rounded-[1.75rem] border border-violet-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
        <CircleDollarSign className="size-6" />
      </div>

      <p className="text-sm font-semibold text-slate-500">{impact.title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{impact.value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {impact.description}
      </p>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-sm font-bold text-slate-950">{value}%</p>
      </div>
      <Progress value={value} className="h-2" />
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
