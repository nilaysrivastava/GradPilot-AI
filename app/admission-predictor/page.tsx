"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  buildAdmissionEngineResult,
  type AdmissionEngineResult,
  type AdmissionPrediction,
} from "@/lib/admission-engine";
import { useProfileStore } from "@/store/useProfileStore";

type AdmissionApiResponse = {
  success: boolean;
  message: string;
  result?: AdmissionEngineResult;
};

export default function AdmissionPredictorPage() {
  const profile = useProfileStore((state) => state.profile);

  const [selectedUniversityId, setSelectedUniversityId] = useState<string>();
  const [result, setResult] = useState<AdmissionEngineResult | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const localResult = useMemo(() => {
    return profile
      ? buildAdmissionEngineResult(profile, selectedUniversityId)
      : null;
  }, [profile, selectedUniversityId]);

  const activeResult = result ?? localResult;
  const selectedPrediction = activeResult?.selectedPrediction;

  async function runPrediction(universityId?: string) {
    if (!profile) return;

    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/admission", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          selectedUniversityId: universityId ?? selectedUniversityId,
        }),
      });

      const data = (await response.json()) as AdmissionApiResponse;

      if (response.ok && data.success && data.result) {
        setResult(data.result);
        setStatus("Admission prediction generated using backend logic.");
      } else {
        const fallback = buildAdmissionEngineResult(
          profile,
          universityId ?? selectedUniversityId
        );
        setResult(fallback);
        setStatus("Admission prediction generated locally for the prototype.");
      }
    } catch {
      const fallback = buildAdmissionEngineResult(
        profile,
        universityId ?? selectedUniversityId
      );
      setResult(fallback);
      setStatus("Admission prediction generated locally for the prototype.");
    } finally {
      setIsLoading(false);
    }
  }

  function selectUniversity(universityId: string) {
    setSelectedUniversityId(universityId);

    if (profile) {
      setResult(buildAdmissionEngineResult(profile, universityId));
    }
  }

  if (!profile || !activeResult || !selectedPrediction) {
    return (
      <AppShell>
        <section className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
            <GraduationCap className="size-7" />
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Build your <span className="gradient-text">Digital Twin</span>{" "}
            first.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Admission Predictor needs your CGPA, test scores, target course,
            country preferences, and academic details before it can estimate
            safe, match, and ambitious options.
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
                Admission Probability Predictor
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Know your{" "}
                <span className="gradient-text">
                  safe, match, and ambitious
                </span>{" "}
                university options.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                GradPilot estimates admission chances using academic strength,
                English/test readiness, course alignment, ranking difficulty,
                country preference, and profile completeness.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => runPrediction()}
                  disabled={isLoading}
                  className="rounded-2xl shadow-glow"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Predicting
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 size-4" />
                      Run Prediction
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                >
                  <Link href="/career-navigator">Open Career Navigator</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 p-1">
              <div className="h-full rounded-[1.35rem] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Selected university
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {selectedPrediction.university.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedPrediction.university.city},{" "}
                      {selectedPrediction.university.country}
                    </p>
                  </div>

                  <div className="flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
                    <GraduationCap className="size-7" />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600">
                      Admission probability
                    </p>
                    <p className="text-sm font-bold text-violet-700">
                      {selectedPrediction.probability}%
                    </p>
                  </div>
                  <Progress
                    value={selectedPrediction.probability}
                    className="h-3"
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <FitBadge fitLevel={selectedPrediction.fitLevel} />
                  <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100">
                    {selectedPrediction.decisionLabel}
                  </Badge>
                  <RiskBadge risk={selectedPrediction.competitionRisk} />
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
                    label="Profile Strength"
                    value={`${activeResult.profileStrength}%`}
                  />
                  <SnapshotMetric
                    label="Average Chance"
                    value={`${activeResult.averageProbability}%`}
                  />
                  <SnapshotMetric
                    label="Safe Options"
                    value={activeResult.safeCount}
                  />
                  <SnapshotMetric
                    label="Match Options"
                    value={activeResult.matchCount}
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
            icon={UserCheck}
            label="Profile Strength"
            value={`${activeResult.profileStrength}%`}
            description="Combined profile completeness, academics, and test readiness."
          />
          <SummaryCard
            icon={ShieldCheck}
            label="Safe Options"
            value={String(activeResult.safeCount)}
            description="Universities with stronger admission probability."
          />
          <SummaryCard
            icon={Target}
            label="Match Options"
            value={String(activeResult.matchCount)}
            description="Competitive but realistic options."
          />
          <SummaryCard
            icon={AlertTriangle}
            label="Ambitious Options"
            value={String(activeResult.ambitiousCount)}
            description="Reach universities that need profile strengthening."
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Ranked Predictions
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  University admission chances
                </h2>
              </div>

              <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
                {activeResult.predictions.length} options
              </Badge>
            </div>

            <div className="space-y-4">
              {activeResult.predictions.map((prediction, index) => (
                <PredictionRow
                  key={prediction.university.id}
                  rank={index + 1}
                  prediction={prediction}
                  active={
                    prediction.university.id ===
                    selectedPrediction.university.id
                  }
                  onClick={() => selectUniversity(prediction.university.id)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Score Breakdown
              </p>

              <div className="mt-6 space-y-5">
                <ScoreBar
                  icon={GraduationCap}
                  label="Academic Score"
                  value={selectedPrediction.academicScore}
                />
                <ScoreBar
                  icon={ClipboardCheck}
                  label="Test Readiness"
                  value={selectedPrediction.testScore}
                />
                <ScoreBar
                  icon={Compass}
                  label="Profile Fit"
                  value={selectedPrediction.profileScore}
                />
              </div>
            </div>

            <InsightPanel
              title="Why this prediction"
              tone="positive"
              items={selectedPrediction.reasons}
            />

            <InsightPanel
              title="Profile gaps"
              tone="warning"
              items={selectedPrediction.gaps}
            />
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-slate-950 p-6 text-white shadow-sm">
            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-white/10 text-violet-200">
              <TrendingUp className="size-6" />
            </div>

            <p className="font-semibold">Overall admission strategy</p>

            <div className="mt-5 space-y-3">
              {activeResult.overallAdvice.map((advice) => (
                <div key={advice} className="flex gap-3">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-violet-300" />
                  <p className="text-sm leading-6 text-slate-300">{advice}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Action Plan
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  What to do before applying
                </h2>
              </div>

              <FileText className="size-7 text-violet-700" />
            </div>

            <div className="space-y-3">
              {selectedPrediction.actionPlan.map((action) => (
                <div
                  key={action}
                  className="flex gap-3 rounded-2xl bg-violet-50 p-4"
                >
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <p className="text-sm leading-6 text-slate-700">{action}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-2xl shadow-glow">
                <Link href="/timeline">
                  Generate Timeline
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
              >
                <Link href="/roi-calculator">Check ROI</Link>
              </Button>
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

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof GraduationCap;
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

function PredictionRow({
  rank,
  prediction,
  active,
  onClick,
}: {
  rank: number;
  prediction: AdmissionPrediction;
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
            <FitBadge fitLevel={prediction.fitLevel} />
            <RiskBadge risk={prediction.competitionRisk} />
            <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
              {prediction.university.rankingBand}
            </Badge>
          </div>

          <h3 className="text-xl font-semibold tracking-tight text-slate-950">
            {prediction.university.name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {prediction.university.city}, {prediction.university.country}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {prediction.university.courses.slice(0, 3).map((course) => (
              <span
                key={course}
                className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {course}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">Probability</p>
            <p className="text-sm font-bold text-violet-700">
              {prediction.probability}%
            </p>
          </div>
          <Progress value={prediction.probability} className="h-3" />

          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700">
            {prediction.decisionLabel}
          </p>
        </div>
      </div>
    </button>
  );
}

function ScoreBar({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-violet-700" />
          <p className="text-sm font-medium text-slate-600">{label}</p>
        </div>
        <p className="text-sm font-bold text-slate-950">{value}%</p>
      </div>
      <Progress value={value} className="h-3" />
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

function FitBadge({ fitLevel }: { fitLevel: AdmissionPrediction["fitLevel"] }) {
  if (fitLevel === "Safe") {
    return (
      <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        Safe
      </Badge>
    );
  }

  if (fitLevel === "Match") {
    return (
      <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
        Match
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full bg-amber-50 text-amber-700 hover:bg-amber-50">
      Ambitious
    </Badge>
  );
}

function RiskBadge({ risk }: { risk: AdmissionPrediction["competitionRisk"] }) {
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
