"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeIndianRupee,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Landmark,
  Loader2,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  UploadCloud,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  buildLoanEngineResult,
  type LoanApplicationStep,
  type LoanDocument,
  type LoanDocumentStatus,
  type LoanEngineResult,
  type LoanOffer,
} from "@/lib/loan-engine";
import { useProfileStore } from "@/store/useProfileStore";

type LoanApiResponse = {
  success: boolean;
  message: string;
  result?: LoanEngineResult;
};

export default function LoanEnginePage() {
  const profile = useProfileStore((state) => state.profile);

  const [result, setResult] = useState<LoanEngineResult | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const localResult = useMemo(() => {
    return profile ? buildLoanEngineResult(profile) : null;
  }, [profile]);

  const activeResult = result ?? localResult;

  async function runLoanEngine() {
    if (!profile) return;

    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/loan", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile }),
      });

      const data = (await response.json()) as LoanApiResponse;

      if (response.ok && data.success && data.result) {
        setResult(data.result);
        setStatus(
          "Loan Engine generated eligibility, offers, and document checklist using backend logic."
        );
      } else {
        setResult(buildLoanEngineResult(profile));
        setStatus("Loan Engine generated locally for the prototype.");
      }
    } catch {
      setResult(buildLoanEngineResult(profile));
      setStatus("Loan Engine generated locally for the prototype.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!profile || !activeResult) {
    return (
      <AppShell>
        <section className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
            <Landmark className="size-7" />
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Build your <span className="gradient-text">Digital Twin</span>{" "}
            first.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            The Loan Engine needs your budget, family income, loan requirement,
            co-applicant status, and target course before it can estimate
            eligibility and offers.
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
                Loan Conversion Engine
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Convert study decisions into{" "}
                <span className="gradient-text">smart financing options</span>.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                GradPilot estimates loan eligibility, EMI, approval confidence,
                dynamic offers, document readiness, and application progress
                using your Digital Twin.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={runLoanEngine}
                  disabled={isLoading}
                  className="rounded-2xl shadow-glow"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Checking
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 size-4" />
                      Check Eligibility
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                >
                  <Link href="/roi-calculator">Review ROI First</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 p-1">
              <div className="h-full rounded-[1.35rem] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Eligibility estimate
                    </p>
                    <p className="mt-2 text-5xl font-bold text-slate-950">
                      {activeResult.eligibilityScore}%
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {activeResult.eligibilityLabel}
                    </p>
                  </div>

                  <div className="flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
                    <Landmark className="size-7" />
                  </div>
                </div>

                <Progress
                  value={activeResult.eligibilityScore}
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
                    label="Eligible"
                    value={`₹${activeResult.eligibleAmountLakhs}L`}
                  />
                  <SnapshotMetric
                    label="Requested"
                    value={`₹${activeResult.requestedLoanLakhs}L`}
                  />
                  <SnapshotMetric
                    label="EMI"
                    value={`₹${activeResult.monthlyEmi.toLocaleString(
                      "en-IN"
                    )}`}
                  />
                  <SnapshotMetric label="Risk" value={activeResult.riskLevel} />
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
            icon={WalletCards}
            label="Eligible Amount"
            value={`₹${activeResult.eligibleAmountLakhs}L`}
            description={`For ${activeResult.selectedUniversityName}, ${activeResult.selectedCountry}`}
          />
          <MetricCard
            icon={BadgeIndianRupee}
            label="Estimated EMI"
            value={`₹${activeResult.monthlyEmi.toLocaleString("en-IN")}`}
            description={`${activeResult.estimatedInterestRate}% for ${activeResult.tenureYears} years`}
          />
          <MetricCard
            icon={TrendingUp}
            label="Approval Confidence"
            value={`${activeResult.approvalConfidence}%`}
            description="Based on profile, co-applicant, ROI, and documents."
          />
          <MetricCard
            icon={FileCheck2}
            label="Document Readiness"
            value={`${activeResult.documentReadiness}%`}
            description="Checklist completion estimate."
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Dynamic Loan Offers
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Personalized financing options
                </h2>
              </div>

              <WalletCards className="size-7 text-violet-700" />
            </div>

            <div className="space-y-4">
              {activeResult.offers.map((offer) => (
                <LoanOfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Repayment Snapshot
              </p>

              <div className="mt-5 space-y-3">
                <FinanceRow
                  label="Total study cost"
                  value={`₹${activeResult.totalCostLakhs}L`}
                />
                <FinanceRow
                  label="Requested loan"
                  value={`₹${activeResult.requestedLoanLakhs}L`}
                />
                <FinanceRow
                  label="Total repayment"
                  value={`₹${activeResult.totalRepaymentLakhs}L`}
                />
                <FinanceRow
                  label="Total interest"
                  value={`₹${activeResult.totalInterestLakhs}L`}
                />
                <FinanceRow
                  label="EMI to salary ratio"
                  value={`${activeResult.repaymentToIncomeRatio}%`}
                />
              </div>
            </div>

            <InsightPanel
              title="Eligibility strengths"
              tone="positive"
              items={activeResult.strengths}
            />

            <InsightPanel
              title="Loan risks"
              tone="warning"
              items={activeResult.risks}
            />
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Document Checklist
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Required for loan application
                </h2>
              </div>

              <UploadCloud className="size-7 text-violet-700" />
            </div>

            <div className="space-y-4">
              {activeResult.documents.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Smart Apply Flow
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  From eligibility to sanction
                </h2>
              </div>

              <ClipboardCheck className="size-7 text-violet-700" />
            </div>

            <div className="space-y-4">
              {activeResult.applicationSteps.map((step, index) => (
                <ApplicationStepCard
                  key={step.id}
                  step={step}
                  index={index + 1}
                />
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="font-semibold">AI-assisted auto-fill</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                In the demo, explain that GradPilot can pre-fill loan
                application fields from the Digital Twin, reducing friction and
                improving conversion.
              </p>

              <Button
                asChild
                className="mt-5 rounded-2xl bg-white text-violet-700 hover:bg-violet-50"
              >
                <Link href="/application-tracker">
                  Track Application
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Next Best Actions
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Move from awareness to loan application.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                This is the conversion point of the platform: student intent,
                decision confidence, and financing readiness come together.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
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

function LoanOfferCard({ offer }: { offer: LoanOffer }) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-slate-50/70 p-5">
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {offer.tags.map((tag) => (
              <Badge
                key={tag}
                className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <h3 className="text-xl font-semibold text-slate-950">
            {offer.offerName}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{offer.lenderName}</p>
        </div>

        <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-xs text-slate-500">Match</p>
          <p className="text-xl font-bold text-violet-700">
            {offer.matchScore}%
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <MiniMetric label="Amount" value={`₹${offer.eligibleAmountLakhs}L`} />
        <MiniMetric label="Interest" value={`${offer.interestRate}%`} />
        <MiniMetric
          label="EMI"
          value={`₹${offer.monthlyEmi.toLocaleString("en-IN")}`}
        />
        <MiniMetric
          label="Collateral"
          value={offer.collateralRequired ? "Required" : "Not needed"}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{offer.bestFor}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Badge className="rounded-full bg-white text-slate-600 hover:bg-white">
          Fee: {offer.processingFee}
        </Badge>
        <Badge className="rounded-full bg-white text-slate-600 hover:bg-white">
          Moratorium: {offer.moratorium}
        </Badge>
      </div>
    </div>
  );
}

function DocumentCard({ document }: { document: LoanDocument }) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <DocumentStatusBadge status={document.status} />
          <h3 className="mt-3 font-semibold text-slate-950">
            {document.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {document.description}
          </p>
          <p className="mt-3 text-xs font-medium text-slate-500">
            Required for: {document.requiredFor}
          </p>
        </div>
      </div>
    </div>
  );
}

function ApplicationStepCard({
  step,
  index,
}: {
  step: LoanApplicationStep;
  index: number;
}) {
  const isCompleted = step.status === "Completed";
  const isActive = step.status === "Active";

  return (
    <div className="flex gap-4 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
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

      <div>
        <StatusBadge status={step.status} />
        <h3 className="mt-3 font-semibold text-slate-950">{step.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {step.description}
        </p>
      </div>
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

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function DocumentStatusBadge({ status }: { status: LoanDocumentStatus }) {
  if (status === "Ready") {
    return (
      <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        Ready
      </Badge>
    );
  }

  if (status === "Needs Review") {
    return (
      <Badge className="rounded-full bg-amber-50 text-amber-700 hover:bg-amber-50">
        Needs Review
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full bg-red-50 text-red-700 hover:bg-red-50">
      Pending
    </Badge>
  );
}

function StatusBadge({ status }: { status: LoanApplicationStep["status"] }) {
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
