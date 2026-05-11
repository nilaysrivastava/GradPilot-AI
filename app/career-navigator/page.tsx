"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  GraduationCap,
  Loader2,
  RefreshCcw,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  buildCareerNavigatorResult,
  type CareerNavigatorResult,
} from "@/lib/recommendation-engine";
import { useProfileStore } from "@/store/useProfileStore";

type RecommendationApiResponse = {
  success: boolean;
  message: string;
  result?: CareerNavigatorResult;
};

export default function CareerNavigatorPage() {
  const profile = useProfileStore((state) => state.profile);

  const [result, setResult] = useState<CareerNavigatorResult | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const localResult = useMemo(() => {
    return profile ? buildCareerNavigatorResult(profile) : null;
  }, [profile]);

  useEffect(() => {
    if (profile) {
      generateRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function generateRecommendations() {
    if (!profile) return;

    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile }),
      });

      const data = (await response.json()) as RecommendationApiResponse;

      if (response.ok && data.success && data.result) {
        setResult(data.result);
        setStatus(
          "AI Career Navigator generated recommendations using backend logic."
        );
      } else {
        setResult(localResult);
        setStatus("Recommendations generated locally for the prototype.");
      }
    } catch {
      setResult(localResult);
      setStatus("Recommendations generated locally for the prototype.");
    } finally {
      setIsLoading(false);
    }
  }

  const activeResult = result ?? localResult;

  if (!profile || !activeResult) {
    return (
      <AppShell>
        <section className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
            <Compass className="size-7" />
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Build your <span className="gradient-text">Digital Twin</span>{" "}
            first.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Career Navigator needs your academic profile, budget, preferred
            countries, course target, and loan preference before it can
            recommend universities.
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

  const top = activeResult.topRecommendation;

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-sm">
          <div className="grid gap-8 p-6 xl:grid-cols-[1fr_0.72fr] xl:p-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                <Sparkles className="size-4" />
                AI Career Navigator
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Best-fit countries and universities for{" "}
                <span className="gradient-text">{profile.targetCourse}</span>.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                GradPilot compares your CGPA, test scores, budget, target
                course, preferred countries, ROI potential, and loan readiness
                to recommend the most suitable study options.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={generateRecommendations}
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
                      Regenerate AI Fit
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                >
                  <Link href="/profile">Update Digital Twin</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 p-1">
              <div className="h-full rounded-[1.35rem] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Top recommendation
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {top.university.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {top.university.city}, {top.university.country}
                    </p>
                  </div>

                  <div className="flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
                    <Compass className="size-7" />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600">
                      AI match score
                    </p>
                    <p className="text-sm font-bold text-violet-700">
                      {top.matchScore}%
                    </p>
                  </div>
                  <Progress value={top.matchScore} className="h-3" />
                </div>

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
                    label="Admission"
                    value={`${top.admissionChance}%`}
                  />
                  <SnapshotMetric label="ROI" value={`${top.roiScore}%`} />
                  <SnapshotMetric
                    label="Affordability"
                    value={`${top.affordabilityScore}%`}
                  />
                  <SnapshotMetric label="Fit Type" value={top.fitLevel} />
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
          {activeResult.recommendedCountries.slice(0, 4).map((country) => (
            <CountryFitCard
              key={country.country}
              country={country.country}
              score={country.countryScore}
              label={country.bestFitLabel}
              averageAdmission={country.averageAdmission}
              averageTotalCost={country.averageTotalCost}
              averageSalary={country.averageSalary}
              reasons={country.reasons}
            />
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  University Matches
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Ranked recommendations
                </h2>
              </div>

              <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
                {activeResult.recommendedUniversities.length} options
              </Badge>
            </div>

            <div className="space-y-4">
              {activeResult.recommendedUniversities.map(
                (recommendation, index) => (
                  <UniversityRecommendationCard
                    key={recommendation.university.id}
                    rank={index + 1}
                    recommendation={recommendation}
                  />
                )
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <Target className="size-6" />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Why this matters
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Recommendation logic is profile-aware.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                The navigator does not just list famous universities. It
                balances admission chance, cost, salary potential, career
                demand, visa factors, preferred countries, and loan
                affordability.
              </p>
            </div>

            <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
              <p className="font-semibold text-slate-950">
                Recommended next actions
              </p>

              <div className="mt-5 space-y-3">
                {activeResult.nextActions.map((action) => (
                  <div
                    key={action}
                    className="flex gap-3 rounded-2xl bg-violet-50 p-4"
                  >
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    <p className="text-sm leading-6 text-slate-700">{action}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Button asChild className="rounded-2xl shadow-glow">
                  <Link href="/roi-calculator">
                    Calculate ROI
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                >
                  <Link href="/decision-hub">Compare Options</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-violet-100 bg-slate-950 p-6 text-white shadow-sm">
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-white/10 text-violet-200">
                <TrendingUp className="size-6" />
              </div>

              
              <p className="mt-3 text-sm leading-6 text-slate-300">
                This is the top-of-funnel AI engagement layer. It 
                keeps students coming back because every recommendation 
                changes when their Digital Twin changes.
              </p>
            </div>
          </div>
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

function CountryFitCard({
  country,
  score,
  label,
  averageAdmission,
  averageTotalCost,
  averageSalary,
  reasons,
}: {
  country: string;
  score: number;
  label: string;
  averageAdmission: number;
  averageTotalCost: number;
  averageSalary: number;
  reasons: string[];
}) {
  return (
    <div className="rounded-[1.75rem] border border-violet-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Country fit</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            {country}
          </h3>
        </div>

        <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
          {label}
        </Badge>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-slate-600">Fit score</p>
        <p className="text-sm font-bold text-violet-700">{score}%</p>
      </div>
      <Progress value={score} className="h-3" />

      <div className="mt-5 grid grid-cols-3 gap-3">
        <MiniMetric label="Admission" value={`${averageAdmission}%`} />
        <MiniMetric label="Cost" value={`₹${averageTotalCost}L`} />
        <MiniMetric label="Salary" value={`₹${averageSalary}L`} />
      </div>

      <div className="mt-5 space-y-2">
        {reasons.map((reason) => (
          <div
            key={reason}
            className="flex gap-2 text-sm leading-6 text-slate-600"
          >
            <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
            <span>{reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function UniversityRecommendationCard({
  rank,
  recommendation,
}: {
  rank: number;
  recommendation: CareerNavigatorResult["recommendedUniversities"][number];
}) {
  const badgeClass =
    recommendation.fitLevel === "Safe"
      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
      : recommendation.fitLevel === "Match"
      ? "bg-violet-100 text-violet-700 hover:bg-violet-100"
      : "bg-amber-50 text-amber-700 hover:bg-amber-50";

  return (
    <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.45fr]">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100">
              #{rank}
            </Badge>
            <Badge className={`rounded-full ${badgeClass}`}>
              {recommendation.fitLevel}
            </Badge>
            <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
              {recommendation.university.rankingBand}
            </Badge>
          </div>

          <h3 className="text-xl font-semibold tracking-tight text-slate-950">
            {recommendation.university.name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {recommendation.university.city},{" "}
            {recommendation.university.country}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {recommendation.university.courses.slice(0, 3).map((course) => (
              <span
                key={course}
                className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {course}
              </span>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            {recommendation.reasons.map((reason) => (
              <div
                key={reason}
                className="flex gap-2 text-sm leading-6 text-slate-600"
              >
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
                <span>{reason}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">
              Improvement tip
            </p>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              {recommendation.improvementTips[0]}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-50 p-5">
          <ScoreRow
            icon={Compass}
            label="Match"
            value={recommendation.matchScore}
          />
          <ScoreRow
            icon={GraduationCap}
            label="Admission"
            value={recommendation.admissionChance}
          />
          <ScoreRow
            icon={WalletCards}
            label="Affordability"
            value={recommendation.affordabilityScore}
          />
          <ScoreRow
            icon={BriefcaseBusiness}
            label="Career"
            value={recommendation.careerScore}
          />

          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniMetric
              label="Cost"
              value={`₹${
                recommendation.university.averageTuitionLakhs +
                recommendation.university.livingCostLakhs
              }L`}
            />
            <MiniMetric
              label="Salary"
              value={`₹${recommendation.university.averageSalaryLakhs}L`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-violet-700" />
          <p className="text-sm font-medium text-slate-600">{label}</p>
        </div>
        <p className="text-sm font-bold text-slate-950">{value}%</p>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
