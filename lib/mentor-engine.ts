import { buildAdmissionEngineResult } from "@/lib/admission-engine";
import { buildDecisionEngineResult } from "@/lib/decision-engine";
import { buildRoiEngineResult } from "@/lib/roi-engine";
import { buildTimelineEngineResult } from "@/lib/timeline-engine";
import type { StudentProfile } from "@/types";

export type MentorIntent =
  | "country"
  | "university"
  | "roi"
  | "admission"
  | "loan"
  | "timeline"
  | "documents"
  | "visa"
  | "sop"
  | "general";

export type MentorAction = {
  label: string;
  href: string;
};

export type MentorMetric = {
  label: string;
  value: string;
};

export type MentorReply = {
  answer: string;
  intent: MentorIntent;
  confidence: number;
  actions: MentorAction[];
  metrics: MentorMetric[];
  suggestedFollowUps: string[];
};

function detectIntent(message: string): MentorIntent {
  const text = message.toLowerCase();

  if (
    text.includes("country") ||
    text.includes("canada") ||
    text.includes("germany") ||
    text.includes("usa") ||
    text.includes("uk") ||
    text.includes("australia")
  ) {
    return "country";
  }

  if (
    text.includes("university") ||
    text.includes("college") ||
    text.includes("shortlist") ||
    text.includes("safe") ||
    text.includes("match") ||
    text.includes("ambitious")
  ) {
    return "university";
  }

  if (
    text.includes("roi") ||
    text.includes("salary") ||
    text.includes("cost") ||
    text.includes("break") ||
    text.includes("emi") ||
    text.includes("repay")
  ) {
    return "roi";
  }

  if (
    text.includes("admission") ||
    text.includes("chance") ||
    text.includes("probability") ||
    text.includes("admit")
  ) {
    return "admission";
  }

  if (
    text.includes("loan") ||
    text.includes("finance") ||
    text.includes("eligibility") ||
    text.includes("co-applicant") ||
    text.includes("document")
  ) {
    return "loan";
  }

  if (
    text.includes("timeline") ||
    text.includes("deadline") ||
    text.includes("when") ||
    text.includes("plan") ||
    text.includes("roadmap")
  ) {
    return "timeline";
  }

  if (
    text.includes("visa") ||
    text.includes("passport") ||
    text.includes("i20") ||
    text.includes("cas")
  ) {
    return "visa";
  }

  if (
    text.includes("sop") ||
    text.includes("lor") ||
    text.includes("resume") ||
    text.includes("statement")
  ) {
    return "sop";
  }

  return "general";
}

function getProfileLine(profile: StudentProfile) {
  return `Based on your Digital Twin: target course is ${
    profile.targetCourse
  }, intake is ${profile.targetIntake}, CGPA is ${profile.cgpa}, budget is ₹${
    profile.budgetLakhs
  }L, preferred countries are ${profile.preferredCountries.join(", ")}, and ${
    profile.needsLoan
      ? `you are planning an education loan of around ₹${profile.expectedLoanAmountLakhs}L`
      : "you have not marked loan funding as required"
  }.`;
}

function formatList(items: string[]) {
  return items.map((item) => `• ${item}`).join("\n");
}

function getCountryAnswer(profile: StudentProfile): MentorReply {
  const decision = buildDecisionEngineResult(profile);
  const topCountry = decision.countryInsights[0];
  const secondCountry = decision.countryInsights[1];

  return {
    intent: "country",
    confidence: 91,
    answer: `${getProfileLine(profile)}

Your strongest country path right now looks like **${
      topCountry.country
    }** with a ${
      topCountry.decisionScore
    }% decision score. The main reason is that it balances admission chances, ROI, affordability, visa/work pathway, and loan readiness better than the other options.

${
  secondCountry
    ? `Your second-best option is **${secondCountry.country}**, which is also worth keeping as a backup.`
    : ""
}

My recommendation: do not finalize only by country preference. Use this order:
${formatList([
  "Pick the country with the best balance of ROI and admission probability.",
  "Keep one lower-cost backup country if your loan requirement is high.",
  "Compare at least 2 universities per country before finalizing.",
])}`,
    actions: [
      { label: "Open Decision Hub", href: "/decision-hub" },
      { label: "Open Career Navigator", href: "/career-navigator" },
    ],
    metrics: [
      { label: "Best Country", value: topCountry.country },
      { label: "Decision Score", value: `${topCountry.decisionScore}%` },
      { label: "Best University", value: topCountry.bestUniversity },
    ],
    suggestedFollowUps: [
      "Should I choose Canada or Germany?",
      "Which country gives the best ROI for me?",
      "Which country is safest for my profile?",
    ],
  };
}

function getUniversityAnswer(profile: StudentProfile): MentorReply {
  const decision = buildDecisionEngineResult(profile);
  const top = decision.rankedOptions[0];
  const safe = decision.rankedOptions
    .filter((option) => option.admissionProbability >= 75)
    .slice(0, 3);
  const match = decision.rankedOptions
    .filter(
      (option) =>
        option.admissionProbability >= 52 && option.admissionProbability < 75
    )
    .slice(0, 3);

  return {
    intent: "university",
    confidence: 89,
    answer: `${getProfileLine(profile)}

Your best overall university option right now is **${
      top.university.name
    }** with a final decision score of ${top.finalScore}%.

A good shortlist should not contain only dream universities. For your current profile, I would structure it like this:

**Safe options**
${
  formatList(safe.map((item) => item.university.name)) ||
  "• Add safer options after improving your profile data."
}

**Match options**
${
  formatList(match.map((item) => item.university.name)) ||
  "• Add match options after running the Admission Predictor."
}

Avoid applying only to ambitious universities because that increases rejection risk and can delay your loan/application planning.`,
    actions: [
      { label: "Open Admission Predictor", href: "/admission-predictor" },
      { label: "Open Career Navigator", href: "/career-navigator" },
    ],
    metrics: [
      { label: "Top University", value: top.university.name },
      { label: "Final Score", value: `${top.finalScore}%` },
      { label: "Admission", value: `${top.admissionProbability}%` },
    ],
    suggestedFollowUps: [
      "Give me safe universities for my profile",
      "Which universities are ambitious for me?",
      "How should I shortlist universities?",
    ],
  };
}

function getRoiAnswer(profile: StudentProfile): MentorReply {
  const roi = buildRoiEngineResult(profile);
  const selected = roi.selectedScenario;

  return {
    intent: "roi",
    confidence: 92,
    answer: `${getProfileLine(profile)}

Your strongest ROI option currently appears to be **${
      selected.university.name
    }**.

Here is the financial picture:
${formatList([
  `Total estimated cost: ₹${selected.totalCostLakhs}L`,
  `Expected salary: ₹${selected.expectedSalaryLakhs}L/year`,
  `Estimated EMI: ₹${selected.monthlyEmi.toLocaleString("en-IN")}/month`,
  `Break-even period: ${selected.breakEvenYears} years`,
  `Risk level: ${selected.riskLevel}`,
])}

My advice: if EMI feels high compared to expected salary, keep a lower-cost country like Germany or India in your backup strategy. ROI is not just salary; it is salary minus financial pressure.`,
    actions: [
      { label: "Open ROI Calculator", href: "/roi-calculator" },
      { label: "Check Loan Engine", href: "/loan-engine" },
    ],
    metrics: [
      { label: "ROI Score", value: `${selected.roiScore}%` },
      { label: "Break-even", value: `${selected.breakEvenYears} yrs` },
      {
        label: "Monthly EMI",
        value: `₹${selected.monthlyEmi.toLocaleString("en-IN")}`,
      },
    ],
    suggestedFollowUps: [
      "Which option has the lowest financial risk?",
      "Is my EMI manageable?",
      "Which country gives the fastest break-even?",
    ],
  };
}

function getAdmissionAnswer(profile: StudentProfile): MentorReply {
  const admission = buildAdmissionEngineResult(profile);
  const selected = admission.selectedPrediction;

  return {
    intent: "admission",
    confidence: 90,
    answer: `${getProfileLine(profile)}

For your current profile, **${selected.university.name}** is classified as **${
      selected.fitLevel
    }** with an estimated admission probability of ${selected.probability}%.

Your admission profile depends most on:
${formatList([
  `Academic score: ${selected.academicScore}%`,
  `Test readiness: ${selected.testScore}%`,
  `Profile fit: ${selected.profileScore}%`,
])}

Important gaps to check:
${formatList(selected.gaps)}

My recommendation: apply with a balanced mix of safe, match, and ambitious universities. Do not depend only on high-ranking universities.`,
    actions: [
      { label: "Open Admission Predictor", href: "/admission-predictor" },
      { label: "Generate Timeline", href: "/timeline" },
    ],
    metrics: [
      { label: "Probability", value: `${selected.probability}%` },
      { label: "Fit Level", value: selected.fitLevel },
      { label: "Profile Strength", value: `${admission.profileStrength}%` },
    ],
    suggestedFollowUps: [
      "How can I improve my admission chances?",
      "Which universities are safe for me?",
      "Should I apply to ambitious universities?",
    ],
  };
}

function getLoanAnswer(profile: StudentProfile): MentorReply {
  const decision = buildDecisionEngineResult(profile);
  const selected = decision.selectedOption;

  const coApplicantLine = profile.hasCoApplicant
    ? "You already marked co-applicant support, which improves loan confidence."
    : "You have not marked co-applicant support. Adding one can improve loan confidence.";

  return {
    intent: "loan",
    confidence: 88,
    answer: `${getProfileLine(profile)}

Your current loan readiness for the selected best option is **${
      selected.loanReadinessScore
    }%**.

${coApplicantLine}

For loan conversion, prepare these early:
${formatList([
  "Student KYC and academic records",
  "University admit letter or application proof",
  "Fee structure and cost of attendance",
  "Co-applicant income proof and bank statements",
  "Collateral documents if required for higher loan amounts",
])}

Do not wait for the final admit to start loan planning. Financing should run parallel to applications.`,
    actions: [
      { label: "Open Loan Engine", href: "/loan-engine" },
      { label: "Open ROI Calculator", href: "/roi-calculator" },
    ],
    metrics: [
      { label: "Loan Readiness", value: `${selected.loanReadinessScore}%` },
      { label: "Loan Target", value: `₹${profile.expectedLoanAmountLakhs}L` },
      { label: "Co-applicant", value: profile.hasCoApplicant ? "Yes" : "No" },
    ],
    suggestedFollowUps: [
      "What documents do I need for education loan?",
      "Is my loan amount risky?",
      "How can I improve loan eligibility?",
    ],
  };
}

function getTimelineAnswer(profile: StudentProfile): MentorReply {
  const timeline = buildTimelineEngineResult(profile);
  const nextTasks = timeline.nextTasks.slice(0, 4);

  return {
    intent: "timeline",
    confidence: 89,
    answer: `${getProfileLine(profile)}

Your timeline readiness is **${timeline.readinessScore}%** for ${
      timeline.targetIntake
    }.

Your next tasks should be:
${formatList(nextTasks.map((task) => `${task.title} — ${task.dueLabel}`))}

The most important thing is sequencing: profile → tests → shortlist → SOP/LOR → applications → loan documents → visa. If financing starts late, it can block final admission decisions.`,
    actions: [
      { label: "Open Timeline", href: "/timeline" },
      { label: "Open Application Tracker", href: "/application-tracker" },
    ],
    metrics: [
      { label: "Readiness", value: `${timeline.readinessScore}%` },
      { label: "Active Tasks", value: String(timeline.activeTasks) },
      { label: "High Priority", value: String(timeline.highPriorityTasks) },
    ],
    suggestedFollowUps: [
      "What should I do this week?",
      "When should I prepare SOP?",
      "When should I start loan documents?",
    ],
  };
}

function getSopAnswer(profile: StudentProfile): MentorReply {
  return {
    intent: "sop",
    confidence: 83,
    answer: `${getProfileLine(profile)}

For your SOP, focus on a clear story instead of generic motivation.

A strong structure for you would be:
${formatList([
  `Start with your interest in ${profile.targetCourse}.`,
  "Connect academic background, projects, research, or internships to the course.",
  "Explain why this program and country fit your goals.",
  "Show future career direction and how the degree helps.",
  "Keep the tone specific, evidence-based, and not overdramatic.",
])}

Avoid writing only: “I am passionate about technology.” Instead, prove it using projects, papers, internships, coursework, or problem-solving experience.`,
    actions: [
      { label: "Open Timeline", href: "/timeline" },
      { label: "Check Admission Predictor", href: "/admission-predictor" },
    ],
    metrics: [
      { label: "Target Course", value: profile.targetCourse },
      { label: "Target Intake", value: profile.targetIntake },
    ],
    suggestedFollowUps: [
      "Give me an SOP structure",
      "What should I include in my SOP?",
      "How do I explain my projects in SOP?",
    ],
  };
}

function getVisaAnswer(profile: StudentProfile): MentorReply {
  return {
    intent: "visa",
    confidence: 78,
    answer: `${getProfileLine(profile)}

Visa planning should start after you have a clear admit direction and financing proof. For most study-abroad paths, your visa strength depends on admission proof, financial proof, identity documents, and consistency of your academic plan.

Prepare these:
${formatList([
  "Valid passport",
  "Admit letter or university confirmation",
  "Financial proof or loan sanction letter",
  "Academic transcripts and test scores",
  "Country-specific visa forms and appointment requirements",
])}

Your financing plan matters because weak financial proof can delay the visa process even if admission is secured.`,
    actions: [
      { label: "Open Timeline", href: "/timeline" },
      { label: "Open Loan Engine", href: "/loan-engine" },
    ],
    metrics: [
      { label: "Target Intake", value: profile.targetIntake },
      { label: "Loan Needed", value: profile.needsLoan ? "Yes" : "No" },
    ],
    suggestedFollowUps: [
      "What visa documents do I need?",
      "When should I start visa planning?",
      "Do I need loan sanction before visa?",
    ],
  };
}

function getGeneralAnswer(profile: StudentProfile): MentorReply {
  const decision = buildDecisionEngineResult(profile);
  const top = decision.selectedOption;

  return {
    intent: "general",
    confidence: 80,
    answer: `${getProfileLine(profile)}

My current overall recommendation is to start with **${
      top.university.name
    }** as your strongest decision option. It has a final decision score of ${
      top.finalScore
    }%.

The best next step depends on what you want to solve:
${formatList([
  "For country/university choice: open Career Navigator.",
  "For cost and salary clarity: open ROI Calculator.",
  "For admit chances: open Admission Predictor.",
  "For deadlines: open Timeline Generator.",
  "For financing: open Loan Engine.",
])}

Ask me something specific like “Should I choose Canada or Germany?” or “Is my EMI manageable?” and I’ll answer using your profile.`,
    actions: [
      { label: "Open Decision Hub", href: "/decision-hub" },
      { label: "Open Career Navigator", href: "/career-navigator" },
    ],
    metrics: [
      { label: "Best Option", value: top.university.name },
      { label: "Decision Score", value: `${top.finalScore}%` },
    ],
    suggestedFollowUps: [
      "What should I do next?",
      "Which university is best for me?",
      "How do I reduce my risk?",
    ],
  };
}

export function buildMentorReply(
  profile: StudentProfile,
  message: string
): MentorReply {
  const intent = detectIntent(message);

  if (intent === "country") return getCountryAnswer(profile);
  if (intent === "university") return getUniversityAnswer(profile);
  if (intent === "roi") return getRoiAnswer(profile);
  if (intent === "admission") return getAdmissionAnswer(profile);
  if (intent === "loan" || intent === "documents")
    return getLoanAnswer(profile);
  if (intent === "timeline") return getTimelineAnswer(profile);
  if (intent === "sop") return getSopAnswer(profile);
  if (intent === "visa") return getVisaAnswer(profile);

  return getGeneralAnswer(profile);
}

export function buildSuggestedPrompts(profile: StudentProfile): string[] {
  return [
    `Which country is best for ${profile.targetCourse}?`,
    "Should I choose Canada or Germany?",
    "Which universities are safe for my profile?",
    "Is my education loan amount risky?",
    "What should I do this week?",
    "How can I improve my admission chances?",
    "Which option gives the best ROI?",
    "What documents do I need for loan planning?",
  ];
}
