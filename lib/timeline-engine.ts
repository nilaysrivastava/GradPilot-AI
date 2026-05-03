import type { StudentProfile } from "@/types";

export type TimelineCategory =
  | "Profile"
  | "Tests"
  | "Shortlisting"
  | "Documents"
  | "Applications"
  | "Finance"
  | "Visa";

export type TimelinePriority = "High" | "Medium" | "Low";

export type TimelineStatus = "Completed" | "Active" | "Upcoming";

export type TimelineTask = {
  id: string;
  title: string;
  description: string;
  category: TimelineCategory;
  dueLabel: string;
  dueInWeeks: number;
  priority: TimelinePriority;
  status: TimelineStatus;
  aiReason: string;
};

export type TimelinePhase = {
  title: string;
  subtitle: string;
  status: TimelineStatus;
  tasks: TimelineTask[];
};

export type TimelineEngineResult = {
  targetIntake: string;
  readinessScore: number;
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  highPriorityTasks: number;
  nextTasks: TimelineTask[];
  phases: TimelinePhase[];
  aiSummary: string;
  weeklyFocus: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getStatus(dueInWeeks: number, profile: StudentProfile): TimelineStatus {
  if (profile.profileCompleteness >= 85 && dueInWeeks <= 1) {
    return "Completed";
  }

  if (dueInWeeks <= 4) {
    return "Active";
  }

  return "Upcoming";
}

function buildTask(input: {
  id: string;
  title: string;
  description: string;
  category: TimelineCategory;
  dueInWeeks: number;
  priority: TimelinePriority;
  aiReason: string;
  profile: StudentProfile;
}): TimelineTask {
  const dueLabel =
    input.dueInWeeks <= 1
      ? "This week"
      : input.dueInWeeks <= 4
      ? `Within ${input.dueInWeeks} weeks`
      : `In ${input.dueInWeeks} weeks`;

  return {
    id: input.id,
    title: input.title,
    description: input.description,
    category: input.category,
    dueLabel,
    dueInWeeks: input.dueInWeeks,
    priority: input.priority,
    status: getStatus(input.dueInWeeks, input.profile),
    aiReason: input.aiReason,
  };
}

function getReadinessScore(profile: StudentProfile, tasks: TimelineTask[]) {
  let score = profile.profileCompleteness * 0.35;

  if (profile.testScoreType !== "None" && profile.testScore > 0) score += 15;
  else score += 5;

  if (profile.englishScore >= 7) score += 12;
  else score += 5;

  if (profile.preferredCountries.length >= 2) score += 10;
  else score += 4;

  if (profile.needsLoan && profile.expectedLoanAmountLakhs > 0) score += 10;
  else if (!profile.needsLoan) score += 10;
  else score += 3;

  if (profile.hasCoApplicant) score += 8;

  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  score += (completedTasks / Math.max(tasks.length, 1)) * 10;

  return clamp(Math.round(score));
}

function getPhaseStatus(tasks: TimelineTask[]): TimelineStatus {
  if (tasks.every((task) => task.status === "Completed")) return "Completed";
  if (tasks.some((task) => task.status === "Active")) return "Active";
  return "Upcoming";
}

export function buildTimelineEngineResult(
  profile: StudentProfile
): TimelineEngineResult {
  const needsTestPlan =
    profile.testScoreType === "None" || profile.testScore === 0 || profile.englishScore < 7;

  const profileTasks: TimelineTask[] = [
    buildTask({
      id: "profile-complete",
      title: "Complete Digital Twin profile",
      description:
        "Finalize academic, financial, country, course, and loan details so every AI module can personalize outputs.",
      category: "Profile",
      dueInWeeks: 1,
      priority: "High",
      aiReason:
        "Your profile is the base layer for recommendations, admission prediction, ROI, and loan readiness.",
      profile,
    }),
    buildTask({
      id: "goal-freeze",
      title: "Freeze target course and intake",
      description: `Confirm ${profile.targetCourse} for ${profile.targetIntake} and keep one backup course option.`,
      category: "Profile",
      dueInWeeks: 2,
      priority: "Medium",
      aiReason:
        "A fixed target helps generate accurate university shortlists and SOP direction.",
      profile,
    }),
  ];

  const testTasks: TimelineTask[] = [
    buildTask({
      id: "test-plan",
      title: needsTestPlan ? "Prepare English/test score plan" : "Validate test score readiness",
      description: needsTestPlan
        ? "Set a weekly plan for IELTS/TOEFL/GRE/GMAT and decide the exam date."
        : "Your test score data is present. Check whether it meets target university expectations.",
      category: "Tests",
      dueInWeeks: needsTestPlan ? 2 : 3,
      priority: needsTestPlan ? "High" : "Medium",
      aiReason:
        "Test scores directly affect admission probability and country eligibility.",
      profile,
    }),
    buildTask({
      id: "test-booking",
      title: "Book test slot or score reporting",
      description:
        "Book your test slot if pending, or prepare score reporting for shortlisted universities.",
      category: "Tests",
      dueInWeeks: 4,
      priority: "Medium",
      aiReason:
        "Delays in scores can delay applications and reduce early-admit chances.",
      profile,
    }),
  ];

  const shortlistTasks: TimelineTask[] = [
    buildTask({
      id: "country-shortlist",
      title: "Finalize country shortlist",
      description: `Compare ${profile.preferredCountries.join(
        ", "
      )} using ROI, admission probability, and loan readiness.`,
      category: "Shortlisting",
      dueInWeeks: 3,
      priority: "High",
      aiReason:
        "Country choice affects tuition, salary, visa path, and education loan planning.",
      profile,
    }),
    buildTask({
      id: "university-bucket",
      title: "Create Safe / Match / Ambitious university buckets",
      description:
        "Pick at least 3 safe, 4 match, and 2 ambitious universities before starting applications.",
      category: "Shortlisting",
      dueInWeeks: 5,
      priority: "High",
      aiReason:
        "A balanced application list reduces rejection risk and improves decision confidence.",
      profile,
    }),
  ];

  const documentTasks: TimelineTask[] = [
    buildTask({
      id: "sop-draft",
      title: "Prepare SOP first draft",
      description:
        "Write a course-specific SOP draft connecting academic work, projects, goals, and target program fit.",
      category: "Documents",
      dueInWeeks: 6,
      priority: "High",
      aiReason:
        "SOP quality can compensate for moderate profile gaps and improve admission chances.",
      profile,
    }),
    buildTask({
      id: "lor-request",
      title: "Request LORs from mentors/faculty",
      description:
        "Ask recommenders early and share your resume, project summary, and target course details.",
      category: "Documents",
      dueInWeeks: 6,
      priority: "High",
      aiReason:
        "Strong LORs are especially important for competitive universities.",
      profile,
    }),
    buildTask({
      id: "resume-final",
      title: "Finalize academic resume",
      description:
        "Prepare a clean one-page resume highlighting projects, research, internships, and technical skills.",
      category: "Documents",
      dueInWeeks: 7,
      priority: "Medium",
      aiReason:
        "A strong resume improves both admission review and education loan documentation.",
      profile,
    }),
  ];

  const applicationTasks: TimelineTask[] = [
    buildTask({
      id: "application-submit",
      title: "Submit first application batch",
      description:
        "Submit 3–4 priority applications first, especially for universities with early deadlines.",
      category: "Applications",
      dueInWeeks: 9,
      priority: "High",
      aiReason:
        "Early applications improve planning time for admits, scholarships, visa, and financing.",
      profile,
    }),
    buildTask({
      id: "application-track",
      title: "Track applications and follow-ups",
      description:
        "Track portal status, missing documents, fee payments, and email responses weekly.",
      category: "Applications",
      dueInWeeks: 11,
      priority: "Medium",
      aiReason:
        "Application tracking prevents avoidable delays and missed document requests.",
      profile,
    }),
  ];

  const financeTasks: TimelineTask[] = [
    buildTask({
      id: "loan-eligibility",
      title: profile.needsLoan
        ? "Check education loan eligibility"
        : "Confirm self-funded affordability",
      description: profile.needsLoan
        ? `Estimate eligibility for ₹${profile.expectedLoanAmountLakhs}L and prepare co-applicant details.`
        : "Confirm funding proof, liquid funds, and affordability before final admit decisions.",
      category: "Finance",
      dueInWeeks: 8,
      priority: "High",
      aiReason:
        "Financing should be planned before final admission decisions, not after.",
      profile,
    }),
    buildTask({
      id: "loan-documents",
      title: "Prepare loan document checklist",
      description:
        "Collect ID proof, academic records, admit letter, fee structure, income proof, bank statements, and collateral/co-applicant documents if needed.",
      category: "Finance",
      dueInWeeks: 10,
      priority: "High",
      aiReason:
        "Document readiness directly improves loan conversion speed.",
      profile,
    }),
  ];

  const visaTasks: TimelineTask[] = [
    buildTask({
      id: "visa-docs",
      title: "Prepare visa and financial proof documents",
      description:
        "Prepare passport, admit letter, financial proof, loan sanction letter, test scores, and university documents.",
      category: "Visa",
      dueInWeeks: 13,
      priority: "Medium",
      aiReason:
        "Visa planning depends on both admission and financing readiness.",
      profile,
    }),
    buildTask({
      id: "final-decision",
      title: "Finalize university and financing decision",
      description:
        "Compare admits using ROI, loan EMI, career outcome, visa path, and long-term fit.",
      category: "Visa",
      dueInWeeks: 14,
      priority: "High",
      aiReason:
        "The final choice should balance dreams, affordability, and repayment safety.",
      profile,
    }),
  ];

  const phases: TimelinePhase[] = [
    {
      title: "Foundation",
      subtitle: "Profile, goals, and test planning",
      tasks: [...profileTasks, ...testTasks],
      status: getPhaseStatus([...profileTasks, ...testTasks]),
    },
    {
      title: "Shortlist",
      subtitle: "Countries, universities, and application buckets",
      tasks: shortlistTasks,
      status: getPhaseStatus(shortlistTasks),
    },
    {
      title: "Documents",
      subtitle: "SOP, LORs, resume, and academic documents",
      tasks: documentTasks,
      status: getPhaseStatus(documentTasks),
    },
    {
      title: "Apply",
      subtitle: "Application submission and tracking",
      tasks: applicationTasks,
      status: getPhaseStatus(applicationTasks),
    },
    {
      title: "Finance & Visa",
      subtitle: "Loan readiness, documents, visa, and final decision",
      tasks: [...financeTasks, ...visaTasks],
      status: getPhaseStatus([...financeTasks, ...visaTasks]),
    },
  ];

  const allTasks = phases.flatMap((phase) => phase.tasks);
  const completedTasks = allTasks.filter((task) => task.status === "Completed").length;
  const activeTasks = allTasks.filter((task) => task.status === "Active").length;
  const highPriorityTasks = allTasks.filter((task) => task.priority === "High").length;
  const nextTasks = allTasks
    .filter((task) => task.status !== "Completed")
    .sort((a, b) => a.dueInWeeks - b.dueInWeeks)
    .slice(0, 5);

  const readinessScore = getReadinessScore(profile, allTasks);

  const aiSummary = `Your ${profile.targetIntake} timeline is built around ${profile.targetCourse}. The highest priority is to complete profile readiness, finalize country/university buckets, prepare SOP/LORs, and start loan readiness early so financing does not become a last-minute blocker.`;

  const weeklyFocus = [
    "Complete missing Digital Twin fields and confirm course/intake.",
    "Finalize country shortlist using Career Navigator and ROI Calculator.",
    "Start SOP and LOR preparation before application deadlines approach.",
    "Check loan eligibility early to avoid financing delays after admits.",
  ];

  return {
    targetIntake: profile.targetIntake,
    readinessScore,
    totalTasks: allTasks.length,
    completedTasks,
    activeTasks,
    highPriorityTasks,
    nextTasks,
    phases,
    aiSummary,
    weeklyFocus,
  };
}