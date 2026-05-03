"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  Bot,
  CheckCircle2,
  Landmark,
  LineChart,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  buildRoiEngineResult,
  type RoiEngineResult,
  type RoiScenario,
} from "@/lib/roi-engine";
import { useProfileStore } from "@/store/useProfileStore";

type RoiApiResponse = {
  success: boolean;
  message: string;
  result?: RoiEngineResult;
};

export default function RoiCalculatorPage() {
  const profile = useProfileStore((state) => state.profile);

  const [selectedUniversityId, setSelectedUniversityId] = useState<
    string | undefined
  >();
  const [result, setResult] = useState<RoiEngineResult | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const localResult = useMemo(() => {
    return profile ? buildRoiEngineResult(profile, selectedUniversityId) : null;
  }, [profile, selectedUniversityId]);

  const activeResult = result ?? localResult;
  const selectedScenario = activeResult?.selectedScenario;

  async function generateRoiAnalysis(universityId?: string) {
    if (!profile) return;

    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/roi", {
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

      const data = (await response.json()) as RoiApiResponse;

      if (response.ok && data.success && data.result) {
        setResult(data.result);
        setStatus("ROI analysis generated using backend logic.");
      } else {
        const fallback = buildRoiEngineResult(
          profile,
          universityId ?? selectedUniversityId
        );
        setResult(fallback);
        setStatus("ROI analysis generated locally for the prototype.");
      }
    } catch {
      const fallback = buildRoiEngineResult(
        profile,
        universityId ?? selectedUniversityId
      );
      setResult(fallback);
      setStatus("ROI analysis generated locally for the prototype.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectUniversity(universityId: string) {
    setSelectedUniversityId(universityId);

    if (profile) {
      const fallback = buildRoiEngineResult(profile, universityId);
      setResult(fallback);
    }
  }

  if (!profile || !activeResult || !selectedScenario) {
    return (
      <AppShell>
        <section className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
            <LineChart className="size-7" />
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Build your <span className="gradient-text">Digital Twin</span>{" "}
            first.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            The ROI Calculator needs your budget, loan requirement, preferred
            countries, course target, and income profile before it can estimate
            break-even and EMI.
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

  const chartData = activeResult.scenarios.slice(0, 6).map((scenario) => ({
    name: scenario.university.name.split(" ").slice(0, 2).join(" "),
    ROI: scenario.roiScore,
    Cost: scenario.totalCostLakhs,
    Salary: scenario.expectedSalaryLakhs,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-sm">
          <div className="grid gap-8 p-6 xl:grid-cols-[1fr_0.72fr] xl:p-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                <Sparkles className="size-4" />
                ROI Calculator
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Compare <span className="gradient-text">salary outcomes</span>{" "}
                against study cost and EMI pressure.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                GradPilot estimates total investment, expected salary, education
                loan EMI, break-even period, affordability, and risk so students
                can decide with clarity.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => generateRoiAnalysis()}
                  disabled={isLoading}
                  className="rounded-2xl shadow-glow"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Calculating
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 size-4" />
                      Recalculate ROI
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                >
                  <Link href="/career-navigator">Back to Navigator</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 p-1">
              <div className="h-full rounded-[1.35rem] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Selected option
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {selectedScenario.university.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedScenario.university.city},{" "}
                      {selectedScenario.university.country}
                    </p>
                  </div>

                  <div className="flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
                    <LineChart className="size-7" />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600">
                      ROI score
                    </p>
                    <p className="text-sm font-bold text-violet-700">
                      {selectedScenario.roiScore}%
                    </p>
                  </div>
                  <Progress value={selectedScenario.roiScore} className="h-3" />
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
                    label="Total Cost"
                    value={`₹${selectedScenario.totalCostLakhs}L`}
                  />
                  <SnapshotMetric
                    label="Salary"
                    value={`₹${selectedScenario.expectedSalaryLakhs}L`}
                  />
                  <SnapshotMetric
                    label="Break-even"
                    value={`${selectedScenario.breakEvenYears} yrs`}
                  />
                  <SnapshotMetric
                    label="Risk"
                    value={selectedScenario.riskLevel}
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
            icon={BadgeIndianRupee}
            label="Total Investment"
            value={`₹${selectedScenario.totalCostLakhs}L`}
            description={`Tuition ₹${selectedScenario.tuitionLakhs}L + living ₹${selectedScenario.livingCostLakhs}L`}
          />
          <MetricCard
            icon={TrendingUp}
            label="Expected Salary"
            value={`₹${selectedScenario.expectedSalaryLakhs}L`}
            description={`Approx. ₹${selectedScenario.expectedMonthlySalary.toLocaleString(
              "en-IN"
            )}/month`}
          />
          <MetricCard
            icon={WalletCards}
            label="Monthly EMI"
            value={`₹${selectedScenario.monthlyEmi.toLocaleString("en-IN")}`}
            description={`${selectedScenario.interestRate}% for ${selectedScenario.repaymentYears} years`}
          />
          <MetricCard
            icon={ShieldAlert}
            label="Financial Risk"
            value={selectedScenario.riskLevel}
            description={selectedScenario.affordabilityLabel}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  ROI Comparison
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Cost, salary, and ROI score
                </h2>
              </div>

              <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
                Top 6
              </Badge>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="ROI" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="Cost" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="Salary" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <Landmark className="size-6" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
              Loan and Repayment
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Education finance snapshot
            </h2>

            <div className="mt-6 space-y-3">
              <FinanceRow
                label="Loan amount"
                value={`₹${selectedScenario.loanAmountLakhs}L`}
              />
              <FinanceRow
                label="Interest rate"
                value={`${selectedScenario.interestRate}% p.a.`}
              />
              <FinanceRow
                label="Repayment tenure"
                value={`${selectedScenario.repaymentYears} years`}
              />
              <FinanceRow
                label="Total repayment"
                value={`₹${selectedScenario.totalRepaymentLakhs}L`}
              />
              <FinanceRow
                label="Total interest"
                value={`₹${selectedScenario.totalInterestLakhs}L`}
              />
            </div>

            <div className="mt-6 rounded-3xl bg-violet-50 p-5">
              <p className="font-semibold text-violet-700">AI finance note</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Keep EMI manageable against expected salary. A high ROI score is
                useful only when repayment pressure stays realistic.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Scenario Selector
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Compare universities
                </h2>
              </div>
              <BarChart3 className="size-7 text-violet-700" />
            </div>

            <div className="space-y-4">
              {activeResult.scenarios.slice(0, 8).map((scenario) => (
                <ScenarioRow
                  key={scenario.university.id}
                  scenario={scenario}
                  active={
                    scenario.university.id === selectedScenario.university.id
                  }
                  onClick={() => handleSelectUniversity(scenario.university.id)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Why this option
              </p>

              <div className="mt-5 space-y-3">
                {selectedScenario.reasons.map((reason) => (
                  <InsightItem key={reason} positive text={reason} />
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
                Risk warnings
              </p>

              <div className="mt-5 space-y-3">
                {selectedScenario.warnings.length > 0 ? (
                  selectedScenario.warnings.map((warning) => (
                    <InsightItem key={warning} text={warning} />
                  ))
                ) : (
                  <InsightItem
                    positive
                    text="No major financial warning detected for this scenario."
                  />
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-violet-100 bg-slate-950 p-6 text-white shadow-sm">
              <p className="font-semibold">Recommended financial actions</p>

              <div className="mt-5 space-y-3">
                {activeResult.financialTips.map((tip) => (
                  <div key={tip} className="flex gap-3">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-violet-300" />
                    <p className="text-sm leading-6 text-slate-300">{tip}</p>
                  </div>
                ))}
              </div>

              <Button
                asChild
                className="mt-6 rounded-2xl bg-white text-violet-700 hover:bg-violet-50"
              >
                <Link href="/loan-engine">
                  Check Loan Eligibility
                  <ArrowRight className="ml-2 size-4" />
                </Link>
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

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof BadgeIndianRupee;
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

function FinanceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ScenarioRow({
  scenario,
  active,
  onClick,
}: {
  scenario: RoiScenario;
  active: boolean;
  onClick: () => void;
}) {
  const riskClass =
    scenario.riskLevel === "Low"
      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
      : scenario.riskLevel === "Medium"
      ? "bg-amber-50 text-amber-700 hover:bg-amber-50"
      : "bg-red-50 text-red-700 hover:bg-red-50";

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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h3 className="font-semibold text-slate-950">
            {scenario.university.name}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {scenario.university.country} • ₹{scenario.totalCostLakhs}L cost • ₹
            {scenario.expectedSalaryLakhs}L salary
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
            ROI {scenario.roiScore}%
          </Badge>
          <Badge className={`rounded-full ${riskClass}`}>
            {scenario.riskLevel}
          </Badge>
        </div>
      </div>

      <div className="mt-4">
        <Progress value={scenario.roiScore} className="h-2" />
      </div>
    </button>
  );
}

function InsightItem({
  text,
  positive = false,
}: {
  text: string;
  positive?: boolean;
}) {
  return (
    <div
      className={
        positive
          ? "flex gap-3 rounded-2xl bg-emerald-50 p-4"
          : "flex gap-3 rounded-2xl bg-amber-50 p-4"
      }
    >
      {positive ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
      ) : (
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-700" />
      )}
      <p
        className={
          positive
            ? "text-sm leading-6 text-emerald-800"
            : "text-sm leading-6 text-amber-800"
        }
      >
        {text}
      </p>
    </div>
  );
}
