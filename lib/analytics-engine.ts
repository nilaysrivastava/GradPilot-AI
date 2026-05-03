import { buildDecisionEngineResult } from "@/lib/decision-engine";
import { buildGrowthEngineResult } from "@/lib/growth-engine";
import { buildLoanEngineResult } from "@/lib/loan-engine";
import { buildTimelineEngineResult } from "@/lib/timeline-engine";
import type { StudentProfile } from "@/types";

export type AnalyticsMetric = {
  label: string;
  value: string;
  change: string;
  description: string;
  tone: "positive" | "neutral" | "warning";
};

export type FunnelMetric = {
  stage: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
  insight: string;
};

export type ModuleUsageMetric = {
  module: string;
  usageScore: number;
  completionScore: number;
  businessValue: string;
};

export type BusinessImpactMetric = {
  title: string;
  value: string;
  description: string;
};

export type AnalyticsInsight = {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
};

export type AnalyticsEngineResult = {
  engagementScore: number;
  conversionScore: number;
  loanLeadScore: number;
  businessImpactScore: number;
  aiSummary: string;
  metrics: AnalyticsMetric[];
  funnel: FunnelMetric[];
  moduleUsage: ModuleUsageMetric[];
  businessImpact: BusinessImpactMetric[];
  insights: AnalyticsInsight[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getTone(value: number): AnalyticsMetric["tone"] {
  if (value >= 75) return "positive";
  if (value >= 50) return "neutral";
  return "warning";
}

function getEstimatedUsersFromScore(score: number, base: number) {
  return Math.max(1, Math.round((score / 100) * base));
}

export function buildAnalyticsEngineResult(
  profile: StudentProfile
): AnalyticsEngineResult {
  const decision = buildDecisionEngineResult(profile);
  const loan = buildLoanEngineResult(profile);
  const timeline = buildTimelineEngineResult(profile);
  const growth = buildGrowthEngineResult(profile);

  const engagementScore = clamp(
    Math.round(
      profile.profileCompleteness * 0.25 +
        timeline.readinessScore * 0.25 +
        growth.retentionScore * 0.3 +
        decision.overallScore * 0.2
    )
  );

  const conversionScore = clamp(
    Math.round(
      loan.approvalConfidence * 0.35 +
        loan.eligibilityScore * 0.25 +
        loan.documentReadiness * 0.2 +
        decision.selectedOption.finalScore * 0.2
    )
  );

  const loanLeadScore = clamp(
    Math.round(
      loan.eligibilityScore * 0.35 +
        loan.approvalConfidence * 0.35 +
        (profile.needsLoan ? 15 : 5) +
        (profile.hasCoApplicant ? 15 : 3)
    )
  );

  const businessImpactScore = clamp(
    Math.round(
      engagementScore * 0.25 +
        conversionScore * 0.35 +
        loanLeadScore * 0.3 +
        growth.viralScore * 0.1
    )
  );

  const awarenessUsers = 1200;
  const signedUpUsers = getEstimatedUsersFromScore(growth.viralScore, 850);
  const digitalTwinUsers = getEstimatedUsersFromScore(profile.profileCompleteness, signedUpUsers);
  const recommendationUsers = getEstimatedUsersFromScore(engagementScore, digitalTwinUsers);
  const loanReadyUsers = getEstimatedUsersFromScore(loanLeadScore, recommendationUsers);
  const applicationIntentUsers = getEstimatedUsersFromScore(conversionScore, loanReadyUsers);

  const funnel: FunnelMetric[] = [
    {
      stage: "Awareness",
      users: awarenessUsers,
      conversionRate: 100,
      dropOffRate: 0,
      insight: "Students enter through AI content, quizzes, referrals, and ROI awareness.",
    },
    {
      stage: "Signup",
      users: signedUpUsers,
      conversionRate: Math.round((signedUpUsers / awarenessUsers) * 100),
      dropOffRate: Math.round(100 - (signedUpUsers / awarenessUsers) * 100),
      insight: "Landing and authentication convert interested students into registered users.",
    },
    {
      stage: "Digital Twin",
      users: digitalTwinUsers,
      conversionRate: Math.round((digitalTwinUsers / signedUpUsers) * 100),
      dropOffRate: Math.round(100 - (digitalTwinUsers / signedUpUsers) * 100),
      insight: "Profile completion unlocks personalization across all AI modules.",
    },
    {
      stage: "AI Recommendations",
      users: recommendationUsers,
      conversionRate: Math.round((recommendationUsers / digitalTwinUsers) * 100),
      dropOffRate: Math.round(100 - (recommendationUsers / digitalTwinUsers) * 100),
      insight: "Career Navigator, ROI, admission, and decision engines create trust.",
    },
    {
      stage: "Loan Readiness",
      users: loanReadyUsers,
      conversionRate: Math.round((loanReadyUsers / recommendationUsers) * 100),
      dropOffRate: Math.round(100 - (loanReadyUsers / recommendationUsers) * 100),
      insight: "Loan eligibility, EMI, and document readiness move students toward financing.",
    },
    {
      stage: "Loan Intent",
      users: applicationIntentUsers,
      conversionRate: Math.round((applicationIntentUsers / loanReadyUsers) * 100),
      dropOffRate: Math.round(100 - (applicationIntentUsers / loanReadyUsers) * 100),
      insight: "Qualified students become loan application leads.",
    },
  ];

  const moduleUsage: ModuleUsageMetric[] = [
    {
      module: "Digital Twin",
      usageScore: profile.profileCompleteness,
      completionScore: profile.profileCompleteness,
      businessValue: "Foundation for personalization and lead scoring.",
    },
    {
      module: "Career Navigator",
      usageScore: decision.selectedOption.countryFitScore,
      completionScore: decision.selectedOption.finalScore,
      businessValue: "Builds top-of-funnel engagement and country/course clarity.",
    },
    {
      module: "ROI Calculator",
      usageScore: decision.selectedOption.roiScore,
      completionScore: decision.selectedOption.affordabilityScore,
      businessValue: "Creates financial awareness before loan conversion.",
    },
    {
      module: "Admission Predictor",
      usageScore: decision.selectedOption.admissionProbability,
      completionScore: decision.selectedOption.admissionProbability,
      businessValue: "Improves decision confidence and trust.",
    },
    {
      module: "Timeline",
      usageScore: timeline.readinessScore,
      completionScore: timeline.completedTasks
        ? Math.round((timeline.completedTasks / timeline.totalTasks) * 100)
        : 0,
      businessValue: "Improves retention through task-based engagement.",
    },
    {
      module: "Loan Engine",
      usageScore: loan.eligibilityScore,
      completionScore: loan.documentReadiness,
      businessValue: "Main conversion layer for education loan leads.",
    },
    {
      module: "Growth Engine",
      usageScore: growth.growthScore,
      completionScore: growth.conversionScore,
      businessValue: "Automates acquisition, nudges, referrals, and conversion loops.",
    },
  ];

  const metrics: AnalyticsMetric[] = [
    {
      label: "Engagement Score",
      value: `${engagementScore}%`,
      change: "+18%",
      description: "Estimated user stickiness based on profile, timeline, and module readiness.",
      tone: getTone(engagementScore),
    },
    {
      label: "Conversion Score",
      value: `${conversionScore}%`,
      change: "+24%",
      description: "Probability that a student can move toward loan application intent.",
      tone: getTone(conversionScore),
    },
    {
      label: "Loan Lead Quality",
      value: `${loanLeadScore}%`,
      change: "+21%",
      description: "Quality of the student as an education loan lead.",
      tone: getTone(loanLeadScore),
    },
    {
      label: "Business Impact",
      value: `${businessImpactScore}%`,
      change: "+27%",
      description: "Combined platform impact across engagement, trust, and financing conversion.",
      tone: getTone(businessImpactScore),
    },
  ];

  const businessImpact: BusinessImpactMetric[] = [
    {
      title: "Estimated Qualified Loan Leads",
      value: String(applicationIntentUsers),
      description: "Students likely to start loan application after completing AI journey.",
    },
    {
      title: "Average Loan Ticket Size",
      value: `₹${loan.requestedLoanLakhs || profile.expectedLoanAmountLakhs}L`,
      description: "Estimated ticket size from the selected study and financing path.",
    },
    {
      title: "Approval Confidence",
      value: `${loan.approvalConfidence}%`,
      description: "Confidence estimate based on profile, co-applicant, ROI, and documents.",
    },
    {
      title: "Document Readiness",
      value: `${loan.documentReadiness}%`,
      description: "Readiness of student documents for loan processing.",
    },
    {
      title: "Referral Potential",
      value: `${growth.viralScore}%`,
      description: "Estimated shareability through referral loops and decision-score cards.",
    },
    {
      title: "Retention Potential",
      value: `${growth.retentionScore}%`,
      description: "Likelihood of repeated platform engagement through tasks and nudges.",
    },
  ];

  const insights: AnalyticsInsight[] = [
    {
      title: "Loan Engine is the strongest conversion point",
      description:
        "The platform should route high-intent students from ROI and Decision Hub into Loan Engine because financing readiness is where business value is created.",
      priority: "High",
    },
    {
      title: "Digital Twin completion directly improves analytics quality",
      description:
        "Higher profile completeness improves recommendation accuracy, loan lead scoring, and personalized nudges.",
      priority: "High",
    },
    {
      title: "Timeline and Growth Engine support retention",
      description:
        "Task reminders, readiness streaks, and stage-based nudges can keep students returning weekly.",
      priority: "Medium",
    },
    {
      title: "Referral loop can reduce acquisition cost",
      description:
        "Students planning higher studies usually know peers with similar goals, so shareable decision cards can support organic growth.",
      priority: "Medium",
    },
  ];

  const aiSummary = `Analytics show a ${businessImpactScore}% business impact score. The strongest path is engagement through Digital Twin and AI recommendations, followed by trust-building through ROI/admission/decision intelligence, and conversion through Loan Engine with ${loan.approvalConfidence}% approval confidence.`;

  return {
    engagementScore,
    conversionScore,
    loanLeadScore,
    businessImpactScore,
    aiSummary,
    metrics,
    funnel,
    moduleUsage,
    businessImpact,
    insights,
  };
}