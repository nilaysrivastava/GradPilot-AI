"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  Compass,
  Gauge,
  GraduationCap,
  Landmark,
  LineChart,
  Loader2,
  RefreshCcw,
  Sparkles,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildDecisionEngineResult,
  type DecisionEngineResult,
  type DecisionOption,
} from "@/lib/decision-engine";
import { normalizeProfile } from "@/lib/profile-utils";
import { useProfileStore } from "@/store/useProfileStore";
import type { RiskPreference, StudentProfile } from "@/types";

type DecisionApiResponse = {
  success: boolean;
  message: string;
  result?: DecisionEngineResult;
};

export default function DecisionHubPage() {
  const profile = useProfileStore((state) => state.profile);

  const [simulatedProfile, setSimulatedProfile] =
    useState<StudentProfile | null>(profile);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>();
  const [result, setResult] = useState<DecisionEngineResult | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activeProfile = simulatedProfile ?? profile;

  const localResult = useMemo(() => {
    return activeProfile
      ? buildDecisionEngineResult(activeProfile, selectedUniversityId)
      : null;
  }, [activeProfile, selectedUniversityId]);

  const activeResult = result ?? localResult;
  const selectedOption = activeResult?.selectedOption;

  function updateSimulation<K extends keyof StudentProfile>(
    key: K,
    value: StudentProfile[K]
  ) {
    setStatus("");
    setResult(null);

    setSimulatedProfile((current) => {
      if (!current) return current;

      return normalizeProfile({
        ...current,
        [key]: value,
      });
    });
  }

  function resetSimulation() {
    setSimulatedProfile(profile);
    setResult(null);
    setStatus("What-if simulator reset to your saved Digital Twin.");
  }

  function selectUniversity(universityId: string) {
    setSelectedUniversityId(universityId);

    if (activeProfile) {
      setResult(buildDecisionEngineResult(activeProfile, universityId));
    }
  }

  async function runDecisionEngine() {
    if (!activeProfile) return;

    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/decision-engine", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: activeProfile,
          selectedUniversityId,
        }),
      });

      const data = (await response.json()) as DecisionApiResponse;

      if (response.ok && data.success && data.result) {
        setResult(data.result);
        setStatus("Decision Intelligence generated using backend logic.");
      } else {
        setResult(
          buildDecisionEngineResult(activeProfile, selectedUniversityId)
        );
        setStatus("Decision Intelligence generated locally for the prototype.");
      }
    } catch {
      setResult(buildDecisionEngineResult(activeProfile, selectedUniversityId));
      setStatus("Decision Intelligence generated locally for the prototype.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!profile || !activeProfile || !activeResult || !selectedOption) {
    return (
      <AppShell>
        <section className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
            <Gauge className="size-7" />
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Build your <span className="gradient-text">Digital Twin</span>{" "}
            first.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Decision Hub needs your profile before it can compare admission,
            ROI, country fit, risk, opportunity, and loan readiness.
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
                Decision Intelligence Engine
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Compare every option with one{" "}
                <span className="gradient-text">final decision score</span>.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                GradPilot combines admission probability, ROI, affordability,
                country fit, opportunity, risk, and loan readiness into one
                explainable decision engine.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={runDecisionEngine}
                  disabled={isLoading}
                  className="rounded-2xl shadow-glow"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 size-4" />
                      Run Decision Engine
                    </>
                  )}
                </Button>

                <Button
                  onClick={resetSimulation}
                  variant="outline"
                  className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                >
                  Reset What-if
                </Button>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 p-1">
              <div className="h-full rounded-[1.35rem] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Best decision option
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {selectedOption.university.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedOption.university.city},{" "}
                      {selectedOption.university.country}
                    </p>
                  </div>

                  <div className="flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
                    <Brain className="size-7" />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600">
                      Final decision score
                    </p>
                    <p className="text-sm font-bold text-violet-700">
                      {selectedOption.finalScore}%
                    </p>
                  </div>
                  <Progress value={selectedOption.finalScore} className="h-3" />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <DecisionLabelBadge label={selectedOption.decisionLabel} />
                  <RiskBadge risk={selectedOption.riskLevel} />
                </div>

                <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
                  <div className="flex gap-4">
                    <Bot className="mt-1 size-6 shrink-0 text-violet-300" />
                    <p className="text-sm leading-6 text-slate-300">
                      {activeResult.decisionSummary}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <SnapshotMetric
                    label="Admission"
                    value={`${selectedOption.admissionProbability}%`}
                  />
                  <SnapshotMetric
                    label="ROI"
                    value={`${selectedOption.roiScore}%`}
                  />
                  <SnapshotMetric
                    label="Loan"
                    value={`${selectedOption.loanReadinessScore}%`}
                  />
                  <SnapshotMetric
                    label="Risk"
                    value={`${selectedOption.riskScore}%`}
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
          <MetricCard
            icon={Gauge}
            label="Overall Decision"
            value={`${activeResult.overallScore}%`}
            description="Combined strength of selected option."
          />
          <MetricCard
            icon={LineChart}
            label="Best ROI"
            value={activeResult.bestBy.roi}
            description="Highest ROI outcome in your options."
          />
          <MetricCard
            icon={GraduationCap}
            label="Safest Admit"
            value={activeResult.bestBy.admission}
            description="Strongest admission probability."
          />
          <MetricCard
            icon={Landmark}
            label="Loan Friendly"
            value={activeResult.bestBy.loan}
            description="Best financing readiness."
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <WhatIfSimulator
            profile={activeProfile}
            updateSimulation={updateSimulation}
            summary={activeResult.whatIfSummary}
          />

          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Country Comparison
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Best country path by decision score
                </h2>
              </div>

              <Compass className="size-7 text-violet-700" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {activeResult.countryInsights.slice(0, 4).map((country) => (
                <CountryDecisionCard key={country.country} country={country} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Ranked Options
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Explainable decision ranking
                </h2>
              </div>

              <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
                {activeResult.rankedOptions.length} options
              </Badge>
            </div>

            <div className="space-y-4">
              {activeResult.rankedOptions.slice(0, 8).map((option, index) => (
                <DecisionOptionRow
                  key={option.university.id}
                  rank={index + 1}
                  option={option}
                  active={option.university.id === selectedOption.university.id}
                  onClick={() => selectUniversity(option.university.id)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <InsightPanel
              title="Selected option strengths"
              tone="positive"
              items={selectedOption.strengths}
            />

            <InsightPanel
              title="Decision risks"
              tone="warning"
              items={selectedOption.risks}
            />

            <div className="rounded-[2rem] border border-violet-100 bg-slate-950 p-6 text-white shadow-sm">
              <p className="font-semibold">Portfolio strategy</p>

              <div className="mt-5 space-y-3">
                {activeResult.portfolioAdvice.map((advice) => (
                  <div key={advice} className="flex gap-3">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-violet-300" />
                    <p className="text-sm leading-6 text-slate-300">{advice}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Button
                  asChild
                  className="rounded-2xl bg-white text-violet-700 hover:bg-violet-50"
                >
                  <Link href="/loan-engine">
                    Check Loan Readiness
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link href="/timeline">Open Timeline</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function WhatIfSimulator({
  profile,
  updateSimulation,
  summary,
}: {
  profile: StudentProfile;
  updateSimulation: <K extends keyof StudentProfile>(
    key: K,
    value: StudentProfile[K]
  ) => void;
  summary: string;
}) {
  return (
    <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
            What-if Simulator
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Change profile inputs and see decisions shift
          </h2>
        </div>

        <Target className="size-7 text-violet-700" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <NumberInput
          label="CGPA"
          value={profile.cgpa}
          min={0}
          max={10}
          step={0.1}
          onChange={(value) => updateSimulation("cgpa", value)}
        />

        <NumberInput
          label="English Score"
          value={profile.englishScore}
          min={0}
          max={9}
          step={0.5}
          onChange={(value) => updateSimulation("englishScore", value)}
        />

        <NumberInput
          label="Budget in Lakhs"
          value={profile.budgetLakhs}
          min={0}
          max={200}
          onChange={(value) => updateSimulation("budgetLakhs", value)}
        />

        <NumberInput
          label="Loan Amount in Lakhs"
          value={profile.expectedLoanAmountLakhs}
          min={0}
          max={200}
          onChange={(value) =>
            updateSimulation("expectedLoanAmountLakhs", value)
          }
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Risk Preference</p>
          <Select
            value={profile.riskPreference}
            onValueChange={(value) =>
              updateSimulation("riskPreference", value as RiskPreference)
            }
          >
            <SelectTrigger className="h-12 rounded-2xl">
              <SelectValue placeholder="Select risk preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Conservative">Conservative</SelectItem>
              <SelectItem value="Balanced">Balanced</SelectItem>
              <SelectItem value="Aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={() =>
            updateSimulation("hasCoApplicant", !profile.hasCoApplicant)
          }
          className={
            profile.hasCoApplicant
              ? "rounded-2xl border border-violet-600 bg-violet-50 p-4 text-left"
              : "rounded-2xl border border-violet-100 bg-white p-4 text-left hover:bg-violet-50"
          }
        >
          <p className="text-sm font-semibold text-slate-950">Co-applicant</p>
          <p className="mt-1 text-sm text-slate-500">
            {profile.hasCoApplicant ? "Available" : "Not available"}
          </p>
        </button>
      </div>

      <div className="mt-6 rounded-3xl bg-violet-50 p-5">
        <p className="font-semibold text-violet-700">What-if insight</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{summary}</p>
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <Input
        type="number"
        value={Number.isNaN(value) ? "" : value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-12 rounded-2xl"
      />
    </div>
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
      <p className="mt-2 line-clamp-2 text-2xl font-bold text-slate-950">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function CountryDecisionCard({
  country,
}: {
  country: DecisionEngineResult["countryInsights"][number];
}) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-slate-50/70 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Country</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950">
            {country.country}
          </h3>
        </div>

        <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
          {country.label}
        </Badge>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-slate-600">Decision score</p>
        <p className="text-sm font-bold text-violet-700">
          {country.decisionScore}%
        </p>
      </div>
      <Progress value={country.decisionScore} className="h-3" />

      <div className="mt-5 grid grid-cols-3 gap-3">
        <MiniMetric label="Cost" value={`₹${country.averageCostLakhs}L`} />
        <MiniMetric label="Salary" value={`₹${country.averageSalaryLakhs}L`} />
        <MiniMetric label="Admit" value={`${country.averageAdmission}%`} />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-950">
        Best: {country.bestUniversity}
      </p>

      <div className="mt-3 space-y-2">
        {country.reasons.map((reason) => (
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

function DecisionOptionRow({
  rank,
  option,
  active,
  onClick,
}: {
  rank: number;
  option: DecisionOption;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "w-full rounded-3xl border border-violet-600 bg-violet-50 p-5 text-left shadow-sm"
          : "w-full rounded-3xl border border-violet-100 bg-white p-5 text-left shadow-sm transition hover:bg-violet-50"
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_0.45fr]">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100">
              #{rank}
            </Badge>
            <DecisionLabelBadge label={option.decisionLabel} />
            <RiskBadge risk={option.riskLevel} />
          </div>

          <h3 className="text-xl font-semibold tracking-tight text-slate-950">
            {option.university.name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {option.university.city}, {option.university.country}
          </p>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            {option.recommendation}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniMetric label="Cost" value={`₹${option.totalCostLakhs}L`} />
            <MiniMetric
              label="Salary"
              value={`₹${option.expectedSalaryLakhs}L`}
            />
            <MiniMetric
              label="EMI"
              value={`₹${option.monthlyEmi.toLocaleString("en-IN")}`}
            />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4">
          <ScoreBar label="Final" value={option.finalScore} />
          <ScoreBar label="Admission" value={option.admissionProbability} />
          <ScoreBar label="ROI" value={option.roiScore} />
          <ScoreBar label="Loan" value={option.loanReadinessScore} />
        </div>
      </div>
    </button>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-4 last:mb-0">
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
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function InsightPanel({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "positive" | "warning";
}) {
  return (
    <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
      <p
        className={
          tone === "positive"
            ? "text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600"
            : "text-sm font-semibold uppercase tracking-[0.2em] text-amber-600"
        }
      >
        {title}
      </p>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className={
              tone === "positive"
                ? "flex gap-3 rounded-2xl bg-emerald-50 p-4"
                : "flex gap-3 rounded-2xl bg-amber-50 p-4"
            }
          >
            {tone === "positive" ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" />
            )}
            <p
              className={
                tone === "positive"
                  ? "text-sm leading-6 text-emerald-800"
                  : "text-sm leading-6 text-amber-800"
              }
            >
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DecisionLabelBadge({
  label,
}: {
  label: DecisionOption["decisionLabel"];
}) {
  const className =
    label === "Best Overall"
      ? "bg-violet-100 text-violet-700 hover:bg-violet-100"
      : label === "High ROI"
      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
      : label === "Safer Admit"
      ? "bg-blue-50 text-blue-700 hover:bg-blue-50"
      : label === "Loan Friendly"
      ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-50"
      : "bg-amber-50 text-amber-700 hover:bg-amber-50";

  return <Badge className={`rounded-full ${className}`}>{label}</Badge>;
}

function RiskBadge({ risk }: { risk: DecisionOption["riskLevel"] }) {
  if (risk === "Low") {
    return (
      <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        Low risk
      </Badge>
    );
  }

  if (risk === "Medium") {
    return (
      <Badge className="rounded-full bg-amber-50 text-amber-700 hover:bg-amber-50">
        Medium risk
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full bg-red-50 text-red-700 hover:bg-red-50">
      High risk
    </Badge>
  );
}
