import { buildDecisionEngineResult } from "@/lib/decision-engine";
import { buildLoanEngineResult } from "@/lib/loan-engine";
import { buildTimelineEngineResult } from "@/lib/timeline-engine";
import type { StudentProfile } from "@/types";

export type TrackerStatus = "Completed" | "Active" | "Upcoming" | "Blocked";

export type TrackerTask = {
  id: string;
  title: string;
  description: string;
  category: "Profile" | "Applications" | "Documents" | "Loan" | "Visa";
  status: TrackerStatus;
  priority: "High" | "Medium" | "Low";
  dueLabel: string;
};

export type TrackerBucket = {
  title: string;
  progress: number;
  status: TrackerStatus;
  tasks: TrackerTask[];
};

export type ApplicationTrackerResult = {
  selectedPath: string;
  overallProgress: number;
  applicationReadiness: number;
  documentProgress: number;
  loanProgress: number;
  visaReadiness: number;
  activeTasks: number;
  blockedTasks: number;
  aiSummary: string;
  buckets: TrackerBucket[];
  upcomingTasks: TrackerTask[];
  blockers: string[];
  nextActions: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getStatusFromProgress(progress: number): TrackerStatus {
  if (progress >= 90) return "Completed";
  if (progress >= 45) return "Active";
  return "Upcoming";
}

export function buildApplicationTrackerResult(
  profile: StudentProfile
): ApplicationTrackerResult {
  const decision = buildDecisionEngineResult(profile);
  const timeline = buildTimelineEngineResult(profile);
  const loan = buildLoanEngineResult(profile);

  const topOption = decision.selectedOption;

  const applicationReadiness = clamp(
    Math.round(
      profile.profileCompleteness * 0.25 +
        topOption.admissionProbability * 0.25 +
        timeline.readinessScore * 0.25 +
        (profile.testScoreType !== "None" && profile.testScore > 0 ? 15 : 5) +
        (profile.englishScore >= 7 ? 10 : 3)
    )
  );

  const documentProgress = loan.documentReadiness;

  const loanProgress = clamp(
    Math.round(
      loan.eligibilityScore * 0.35 +
        loan.approvalConfidence * 0.35 +
        loan.documentReadiness * 0.2 +
        (profile.hasCoApplicant ? 10 : 0)
    )
  );

  const visaReadiness = clamp(
    Math.round(
      applicationReadiness * 0.35 +
        documentProgress * 0.3 +
        loanProgress * 0.25 +
        (profile.needsLoan ? 5 : 10)
    )
  );

  const overallProgress = Math.round(
    (applicationReadiness + documentProgress + loanProgress + visaReadiness) / 4
  );

  const profileTasks: TrackerTask[] = [
    {
      id: "profile-final",
      title: "Finalize Digital Twin",
      description: "Complete profile, academic, goals, and finance details.",
      category: "Profile",
      status: profile.profileCompleteness >= 85 ? "Completed" : "Active",
      priority: "High",
      dueLabel: "This week",
    },
    {
      id: "country-final",
      title: "Finalize target country list",
      description: `Compare ${profile.preferredCountries.join(
        ", "
      )} using Decision Hub.`,
      category: "Profile",
      status: profile.preferredCountries.length >= 2 ? "Completed" : "Active",
      priority: "Medium",
      dueLabel: "Within 2 weeks",
    },
  ];

  const applicationTasks: TrackerTask[] = [
    {
      id: "shortlist",
      title: "Create university shortlist",
      description: "Choose safe, match, and ambitious universities.",
      category: "Applications",
      status: applicationReadiness >= 60 ? "Active" : "Upcoming",
      priority: "High",
      dueLabel: "Within 3 weeks",
    },
    {
      id: "sop-lor",
      title: "Prepare SOP and LORs",
      description: "Draft SOP and request LORs from mentors/faculty.",
      category: "Applications",
      status: timeline.readinessScore >= 65 ? "Active" : "Upcoming",
      priority: "High",
      dueLabel: "Within 6 weeks",
    },
    {
      id: "submit-batch",
      title: "Submit first application batch",
      description: "Submit priority applications before early deadlines.",
      category: "Applications",
      status: profile.journeyStage === "applying" ? "Active" : "Upcoming",
      priority: "High",
      dueLabel: "Within 9 weeks",
    },
  ];

  const documentTasks: TrackerTask[] = loan.documents.map((document) => ({
    id: document.id,
    title: document.title,
    description: document.description,
    category: "Documents",
    status:
      document.status === "Ready"
        ? "Completed"
        : document.status === "Needs Review"
        ? "Active"
        : "Upcoming",
    priority:
      document.status === "Pending" && document.id.includes("coapplicant")
        ? "High"
        : "Medium",
    dueLabel: "Before loan application",
  }));

  const loanTasks: TrackerTask[] = [
    {
      id: "eligibility-check",
      title: "Check loan eligibility",
      description: `Eligibility score is ${loan.eligibilityScore}% with ${loan.approvalConfidence}% approval confidence.`,
      category: "Loan",
      status: loan.eligibilityScore >= 55 ? "Completed" : "Active",
      priority: "High",
      dueLabel: "This week",
    },
    {
      id: "offer-compare",
      title: "Compare loan offers",
      description:
        "Compare EMI, interest rate, processing fee, collateral, and moratorium.",
      category: "Loan",
      status: loan.offers.length > 0 ? "Active" : "Upcoming",
      priority: "High",
      dueLabel: "After shortlist",
    },
  ];

  const visaTasks: TrackerTask[] = [
    {
      id: "visa-docs",
      title: "Prepare visa documents",
      description:
        "Passport, admit letter, financial proof, loan sanction, and academic records.",
      category: "Visa",
      status: visaReadiness >= 70 ? "Active" : "Upcoming",
      priority: "Medium",
      dueLabel: "After admit",
    },
    {
      id: "final-decision",
      title: "Finalize university and funding decision",
      description:
        "Compare admits using ROI, loan EMI, visa path, and long-term fit.",
      category: "Visa",
      status: overallProgress >= 80 ? "Active" : "Upcoming",
      priority: "High",
      dueLabel: "Before visa filing",
    },
  ];

  function createBucket(title: string, tasks: TrackerTask[]): TrackerBucket {
    const score =
      tasks.reduce((sum, task) => {
        if (task.status === "Completed") return sum + 100;
        if (task.status === "Active") return sum + 55;
        if (task.status === "Blocked") return sum + 20;
        return sum + 15;
      }, 0) / tasks.length;

    const progress = Math.round(score);

    return {
      title,
      progress,
      status: getStatusFromProgress(progress),
      tasks,
    };
  }

  const buckets = [
    createBucket("Profile & Shortlist", profileTasks),
    createBucket("Applications", applicationTasks),
    createBucket("Documents", documentTasks),
    createBucket("Loan Application", loanTasks),
    createBucket("Visa & Final Decision", visaTasks),
  ];

  const allTasks = buckets.flatMap((item) => item.tasks);

  const upcomingTasks = allTasks
    .filter((task) => task.status !== "Completed")
    .slice(0, 6);

  const blockers: string[] = [];

  if (profile.profileCompleteness < 85) {
    blockers.push("Digital Twin is not fully complete.");
  }

  if (profile.needsLoan && !profile.hasCoApplicant) {
    blockers.push("Co-applicant support is missing for loan readiness.");
  }

  if (loan.documentReadiness < 60) {
    blockers.push("Loan document readiness is low.");
  }

  if (profile.testScoreType === "None" || profile.testScore === 0) {
    blockers.push("Standardized test score plan is missing.");
  }

  if (blockers.length === 0) {
    blockers.push(
      "No major blocker detected. Continue tracking deadlines and documents."
    );
  }

  const nextActions = [
    "Complete active high-priority tracker tasks first.",
    "Prepare loan documents before final admit decisions.",
    "Use Decision Hub before locking university choice.",
    "Track SOP, LOR, application, loan, and visa readiness weekly.",
  ];

  return {
    selectedPath: `${topOption.university.name}, ${topOption.university.country}`,
    overallProgress,
    applicationReadiness,
    documentProgress,
    loanProgress,
    visaReadiness,
    activeTasks: allTasks.filter((task) => task.status === "Active").length,
    blockedTasks: blockers[0].startsWith("No major") ? 0 : blockers.length,
    aiSummary: `Your strongest path is ${topOption.university.name}. Overall progress is ${overallProgress}%, with ${applicationReadiness}% application readiness, ${loanProgress}% loan progress, and ${visaReadiness}% visa readiness.`,
    buckets,
    upcomingTasks,
    blockers,
    nextActions,
  };
}
