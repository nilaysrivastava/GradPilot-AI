"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Flame,
  Loader2,
  Megaphone,
  RefreshCcw,
  Rocket,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WandSparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  buildGrowthEngineResult,
  type ContentIdea,
  type EngagementLoop,
  type GrowthEngineResult,
  type GrowthNudge,
  type LifecycleAgent,
} from "@/lib/growth-engine";
import { useProfileStore } from "@/store/useProfileStore";

type GrowthApiResponse = {
  success: boolean;
  message: string;
  result?: GrowthEngineResult;
};

export default function GrowthEnginePage() {
  const profile = useProfileStore((state) => state.profile);

  const [result, setResult] = useState<GrowthEngineResult | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const localResult = useMemo(() => {
    return profile ? buildGrowthEngineResult(profile) : null;
  }, [profile]);

  const activeResult = result ?? localResult;

  async function runGrowthEngine() {
    if (!profile) return;

    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/growth", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      const data = (await response.json()) as GrowthApiResponse;

      if (response.ok && data.success && data.result) {
        setResult(data.result);
        setStatus("Growth Engine generated using backend logic.");
      } else {
        setResult(buildGrowthEngineResult(profile));
        setStatus("Growth Engine generated locally for the prototype.");
      }
    } catch {
      setResult(buildGrowthEngineResult(profile));
      setStatus("Growth Engine generated locally for the prototype.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!profile || !activeResult) {
    return (
      <AppShell>
        <section className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
            <Megaphone className="size-7" />
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Build your <span className="gradient-text">Digital Twin</span>{" "}
            first.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Growth Engine needs profile and journey stage data before it can
            personalize nudges, content loops, and conversion automation.
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
                AI Growth Engine
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                AI-led acquisition, engagement, and{" "}
                <span className="gradient-text">loan conversion loops</span>.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                This module demonstrates how GradPilot becomes sticky and viral:
                personalized nudges, content generation, referral loops, and
                automated lifecycle agents.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={runGrowthEngine}
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
                      Regenerate Growth Plan
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                >
                  <Link href="/loan-engine">Open Loan Engine</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 p-1">
              <div className="h-full rounded-[1.35rem] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Growth score
                    </p>
                    <p className="mt-2 text-5xl font-bold text-slate-950">
                      {activeResult.growthScore}%
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {activeResult.personaSegment}
                    </p>
                  </div>

                  <div className="flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
                    <Rocket className="size-7" />
                  </div>
                </div>

                <Progress value={activeResult.growthScore} className="mt-5 h-3" />

                <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
                  <div className="flex gap-4">
                    <Bot className="mt-1 size-6 shrink-0 text-violet-300" />
                    <p className="text-sm leading-6 text-slate-300">
                      {activeResult.aiSummary}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <MiniMetric label="Retention" value={`${activeResult.retentionScore}%`} />
                  <MiniMetric label="Conversion" value={`${activeResult.conversionScore}%`} />
                  <MiniMetric label="Virality" value={`${activeResult.viralScore}%`} />
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
            icon={Users}
            label="Persona Segment"
            value={activeResult.personaSegment}
            description="Journey-stage based user segment."
          />
          <MetricCard
            icon={Flame}
            label="Retention"
            value={`${activeResult.retentionScore}%`}
            description="Likelihood of repeat engagement."
          />
          <MetricCard
            icon={Target}
            label="Conversion"
            value={`${activeResult.conversionScore}%`}
            description="Loan application readiness signal."
          />
          <MetricCard
            icon={Share2}
            label="Viral Loop"
            value={`${activeResult.viralScore}%`}
            description="Referral and shareability potential."
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Smart Nudges
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Personalized re-engagement triggers
                </h2>
              </div>
              <Megaphone className="size-7 text-violet-700" />
            </div>

            <div className="space-y-4">
              {activeResult.nudges.map((nudge) => (
                <NudgeCard key={nudge.title} nudge={nudge} />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  AI Content Engine
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Acquisition content ideas
                </h2>
              </div>
              <WandSparkles className="size-7 text-violet-700" />
            </div>

            <div className="space-y-4">
              {activeResult.contentIdeas.map((idea) => (
                <ContentIdeaCard key={idea.title} idea={idea} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Funnel Automation
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Awareness to loan conversion
                </h2>
              </div>
              <TrendingUp className="size-7 text-violet-700" />
            </div>

            <div className="space-y-4">
              {activeResult.funnel.map((stage) => (
                <div
                  key={stage.stage}
                  className="rounded-3xl border border-violet-100 bg-slate-50/70 p-5"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-950">{stage.stage}</h3>
                    <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
                      {stage.score}%
                    </Badge>
                  </div>
                  <Progress value={stage.score} className="h-2" />
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {stage.goal}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-violet-700">
                    AI action: {stage.aiAction}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Metric: {stage.conversionMetric}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Engagement Loops
              </p>

              <div className="mt-5 space-y-4">
                {activeResult.engagementLoops.map((loop) => (
                  <LoopCard key={loop.title} loop={loop} />
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-violet-100 bg-slate-950 p-6 text-white shadow-sm">
              <p className="font-semibold">Zero human intervention flow</p>

              <div className="mt-5 space-y-3">
                {activeResult.zeroHumanInterventionFlow.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-violet-300" />
                    <p className="text-sm leading-6 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                AI Lifecycle Agents
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Fully automated user lifecycle
              </h2>
            </div>
            <Bot className="size-7 text-violet-700" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {activeResult.lifecycleAgents.map((agent) => (
              <AgentCard key={agent.title} agent={agent} />
            ))}
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
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
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

function NudgeCard({ nudge }: { nudge: GrowthNudge }) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-slate-50/70 p-5">
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
          {nudge.channel}
        </Badge>
        <Badge className="rounded-full bg-amber-50 text-amber-700 hover:bg-amber-50">
          {nudge.priority}
        </Badge>
      </div>

      <h3 className="font-semibold text-slate-950">{nudge.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{nudge.message}</p>
      <p className="mt-3 text-xs font-medium text-slate-500">
        Trigger: {nudge.trigger}
      </p>

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

function ContentIdeaCard({ idea }: { idea: ContentIdea }) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-slate-50/70 p-5">
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
          {idea.format}
        </Badge>
      </div>

      <h3 className="font-semibold text-slate-950">{idea.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{idea.hook}</p>
      <p className="mt-3 text-xs font-medium text-slate-500">
        Audience: {idea.audience}
      </p>
      <p className="mt-1 text-xs font-medium text-violet-700">
        CTA: {idea.cta}
      </p>
    </div>
  );
}

function LoopCard({ loop }: { loop: EngagementLoop }) {
  return (
    <div className="rounded-3xl bg-violet-50 p-5">
      <div className="mb-3 flex justify-between gap-3">
        <h3 className="font-semibold text-slate-950">{loop.title}</h3>
        <Badge className="rounded-full bg-white text-violet-700 hover:bg-white">
          {loop.status}
        </Badge>
      </div>
      <p className="text-sm leading-6 text-slate-600">{loop.mechanic}</p>
      <p className="mt-3 text-xs font-medium text-slate-500">
        Why it works: {loop.whyItWorks}
      </p>
      <p className="mt-1 text-xs font-medium text-violet-700">
        Metric: {loop.metric}
      </p>
    </div>
  );
}

function AgentCard({ agent }: { agent: LifecycleAgent }) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-slate-50/70 p-5">
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
          {agent.autonomyLevel} autonomy
        </Badge>
      </div>
      <h3 className="font-semibold text-slate-950">{agent.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Trigger: {agent.trigger}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">Job: {agent.job}</p>
      <p className="mt-2 text-sm leading-6 text-violet-700">
        Output: {agent.output}
      </p>
    </div>
  );
}