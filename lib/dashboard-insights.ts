import type { StudentProfile } from "@/types";

export type ReadinessCard = {
  title: string;
  score: number;
  label: string;
  description: string;
};

export type DashboardNudge = {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  actionLabel: string;
  href: string;
};

export type JourneyStep = {
  title: string;
  description: string;
  status: "Completed" | "Active" | "Upcoming";
};

export type DashboardInsights = {
  studentName: string;
  headline: string;
  summary: string;
  overallReadiness: number;
  readinessCards: ReadinessCard[];
  nudges: DashboardNudge[];
  journeySteps: JourneyStep[];
  nextBestAction: DashboardNudge;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function titleCase(value: string) {
  return value
    .replace("-", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getAdmissionReadiness(profile: StudentProfile) {
  let score = 35;

  score +=
    profile.cgpa >= 8.5
      ? 22
      : profile.cgpa >= 7.5
      ? 17
      : profile.cgpa >= 6.5
      ? 11
      : 5;
  score +=
    profile.englishScore >= 7.5
      ? 16
      : profile.englishScore >= 7
      ? 12
      : profile.englishScore >= 6.5
      ? 8
      : 3;
  score += profile.testScoreType !== "None" && profile.testScore > 0 ? 12 : 2;
  score +=
    profile.workExperienceMonths >= 12
      ? 8
      : profile.workExperienceMonths >= 6
      ? 5
      : 2;
  score -= profile.backlogs > 0 ? Math.min(profile.backlogs * 5, 15) : 0;

  return clamp(score);
}

function getRoiReadiness(profile: StudentProfile) {
  let score = 30;

  score +=
    profile.budgetLakhs >= 45
      ? 22
      : profile.budgetLakhs >= 30
      ? 16
      : profile.budgetLakhs >= 20
      ? 10
      : 4;
  score +=
    profile.familyIncomeLakhs >= 18
      ? 16
      : profile.familyIncomeLakhs >= 10
      ? 11
      : 6;
  score += profile.preferredCountries.includes("Germany") ? 8 : 0;
  score += profile.preferredCountries.includes("Canada") ? 7 : 0;
  score += profile.targetCourse.toLowerCase().includes("computer") ? 8 : 4;
  score += profile.riskPreference === "Balanced" ? 6 : 3;

  return clamp(score);
}

function getLoanReadiness(profile: StudentProfile) {
  if (!profile.needsLoan) {
    return 92;
  }

  let score = 35;

  score += profile.hasCoApplicant ? 20 : 5;
  score +=
    profile.familyIncomeLakhs >= 18
      ? 18
      : profile.familyIncomeLakhs >= 10
      ? 12
      : 6;
  score += profile.expectedLoanAmountLakhs <= profile.budgetLakhs ? 12 : 5;
  score += profile.profileCompleteness >= 80 ? 10 : 4;
  score += profile.cgpa >= 7.5 ? 7 : 3;

  return clamp(score);
}

function getLabel(score: number) {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Work";
  return "Incomplete";
}

function buildNudges(profile: StudentProfile): DashboardNudge[] {
  const nudges: DashboardNudge[] = [];

  if (profile.profileCompleteness < 85) {
    nudges.push({
      title: "Complete your Digital Twin",
      description:
        "Your AI recommendations become stronger after profile completeness crosses 85%. Add missing academic, country, and finance details.",
      priority: "High",
      actionLabel: "Update profile",
      href: "/profile",
    });
  }

  if (profile.englishScore < 7) {
    nudges.push({
      title: "Improve English test readiness",
      description:
        "A 7+ IELTS equivalent score can improve admission chances and make your profile safer for Canada, UK, and Australia.",
      priority: "High",
      actionLabel: "Open timeline",
      href: "/timeline",
    });
  }

  if (profile.testScoreType === "None" || profile.testScore === 0) {
    nudges.push({
      title: "Add your test score plan",
      description:
        "Adding GRE, GMAT, IELTS, or TOEFL data will make admission prediction and university matching more accurate.",
      priority: "Medium",
      actionLabel: "Update goals",
      href: "/profile",
    });
  }

  if (profile.needsLoan && !profile.hasCoApplicant) {
    nudges.push({
      title: "Add co-applicant information",
      description:
        "A co-applicant can significantly improve loan approval confidence and help unlock better financing options.",
      priority: "High",
      actionLabel: "Loan readiness",
      href: "/loan-engine",
    });
  }

  if (profile.preferredCountries.includes("Canada")) {
    nudges.push({
      title: "Canada looks promising for your journey",
      description:
        "Canada is a strong option when students want a balance of ROI, work opportunities, and affordability.",
      priority: "Low",
      actionLabel: "Compare options",
      href: "/decision-hub",
    });
  }

  if (profile.preferredCountries.includes("Germany")) {
    nudges.push({
      title: "Germany can improve your ROI",
      description:
        "Germany often performs well for affordability-focused students because of comparatively lower tuition options.",
      priority: "Low",
      actionLabel: "Calculate ROI",
      href: "/roi-calculator",
    });
  }

  if (nudges.length === 0) {
    nudges.push({
      title: "You are ready for recommendations",
      description:
        "Your profile has enough information. Start with Career Navigator to shortlist countries and universities.",
      priority: "Medium",
      actionLabel: "Open navigator",
      href: "/career-navigator",
    });
  }

  return nudges.slice(0, 4);
}

function buildJourneySteps(profile: StudentProfile): JourneyStep[] {
  const hasProfile = profile.profileCompleteness >= 70;
  const hasCountries = profile.preferredCountries.length > 0;
  const hasLoanPlan = !profile.needsLoan || profile.expectedLoanAmountLakhs > 0;

  return [
    {
      title: "Create Digital Twin",
      description: "Profile, academic, goal, and finance data captured.",
      status: hasProfile ? "Completed" : "Active",
    },
    {
      title: "Shortlist Study Options",
      description: "Compare countries, universities, and course fit.",
      status: hasProfile ? (hasCountries ? "Active" : "Upcoming") : "Upcoming",
    },
    {
      title: "Analyze ROI",
      description: "Estimate cost, salary, break-even, and affordability.",
      status: hasCountries ? "Active" : "Upcoming",
    },
    {
      title: "Plan Financing",
      description: "Estimate loan eligibility, EMI, and document readiness.",
      status: hasLoanPlan && hasProfile ? "Active" : "Upcoming",
    },
    {
      title: "Apply and Track",
      description: "Move from shortlist to application and loan conversion.",
      status: profile.journeyStage === "applying" ? "Active" : "Upcoming",
    },
  ];
}

export function buildDashboardInsights(
  profile: StudentProfile | null
): DashboardInsights | null {
  if (!profile) return null;

  const admissionScore = getAdmissionReadiness(profile);
  const roiScore = getRoiReadiness(profile);
  const loanScore = getLoanReadiness(profile);

  const overallReadiness = Math.round(
    (profile.profileCompleteness + admissionScore + roiScore + loanScore) / 4
  );

  const nudges = buildNudges(profile);

  return {
    studentName: profile.name || "Student",
    headline: `${titleCase(profile.journeyStage)} journey for ${
      profile.targetCourse
    }`,
    summary: `Focused on ${
      profile.preferredCountries.join(", ") || "your preferred countries"
    } with a budget of ₹${profile.budgetLakhs}L and ${
      profile.needsLoan
        ? `loan target of ₹${profile.expectedLoanAmountLakhs}L`
        : "no loan requirement"
    }.`,
    overallReadiness,
    readinessCards: [
      {
        title: "Profile Strength",
        score: profile.profileCompleteness,
        label: getLabel(profile.profileCompleteness),
        description:
          "Measures how complete your Digital Twin is for personalization.",
      },
      {
        title: "Admission Readiness",
        score: admissionScore,
        label: getLabel(admissionScore),
        description:
          "Based on CGPA, test score, English score, work experience, and backlogs.",
      },
      {
        title: "ROI Readiness",
        score: roiScore,
        label: getLabel(roiScore),
        description:
          "Checks whether your country, course, budget, and salary potential look financially sensible.",
      },
      {
        title: "Loan Readiness",
        score: loanScore,
        label: getLabel(loanScore),
        description:
          "Estimates how prepared you are for education loan eligibility and conversion.",
      },
    ],
    nudges,
    journeySteps: buildJourneySteps(profile),
    nextBestAction: nudges[0],
  };
}
