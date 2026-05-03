import { buildDecisionEngineResult } from "@/lib/decision-engine";
import { buildLoanEngineResult } from "@/lib/loan-engine";
import { buildTimelineEngineResult } from "@/lib/timeline-engine";
import type { StudentProfile } from "@/types";

export type GrowthPriority = "High" | "Medium" | "Low";

export type GrowthNudge = {
  title: string;
  message: string;
  trigger: string;
  channel: "In-app" | "Email" | "WhatsApp" | "Push";
  priority: GrowthPriority;
  actionLabel: string;
  href: string;
};

export type ContentIdea = {
  title: string;
  format: "Blog" | "Reel" | "Newsletter" | "Carousel" | "Quiz";
  audience: string;
  hook: string;
  cta: string;
};

export type EngagementLoop = {
  title: string;
  mechanic: string;
  whyItWorks: string;
  metric: string;
  status: "Live" | "Ready" | "Upcoming";
};

export type LifecycleAgent = {
  title: string;
  trigger: string;
  job: string;
  output: string;
  autonomyLevel: "Low" | "Medium" | "High";
};

export type FunnelStage = {
  stage: string;
  goal: string;
  aiAction: string;
  conversionMetric: string;
  score: number;
};

export type GrowthEngineResult = {
  personaSegment: string;
  growthScore: number;
  retentionScore: number;
  conversionScore: number;
  viralScore: number;
  aiSummary: string;
  nudges: GrowthNudge[];
  contentIdeas: ContentIdea[];
  engagementLoops: EngagementLoop[];
  lifecycleAgents: LifecycleAgent[];
  funnel: FunnelStage[];
  zeroHumanInterventionFlow: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getPersonaSegment(profile: StudentProfile) {
  if (profile.journeyStage === "exploring") return "Early Explorer";
  if (profile.journeyStage === "shortlisting") return "Active Shortlister";
  if (profile.journeyStage === "test-prep") return "Test Prep Student";
  if (profile.journeyStage === "applying") return "Application Ready Student";
  if (profile.journeyStage === "loan-planning") return "Loan Ready Lead";
  if (profile.journeyStage === "visa") return "Visa Stage Student";
  return "Converted Student";
}

export function buildGrowthEngineResult(
  profile: StudentProfile
): GrowthEngineResult {
  const decision = buildDecisionEngineResult(profile);
  const loan = buildLoanEngineResult(profile);
  const timeline = buildTimelineEngineResult(profile);

  const personaSegment = getPersonaSegment(profile);

  const retentionScore = clamp(
    Math.round(
      profile.profileCompleteness * 0.3 +
        timeline.readinessScore * 0.3 +
        decision.overallScore * 0.25 +
        15
    )
  );

  const conversionScore = clamp(
    Math.round(
      loan.approvalConfidence * 0.45 +
        loan.documentReadiness * 0.25 +
        decision.selectedOption.finalScore * 0.2 +
        (profile.needsLoan ? 10 : 4)
    )
  );

  const viralScore = clamp(
    Math.round(
      35 +
        profile.preferredCountries.length * 7 +
        (profile.profileCompleteness >= 80 ? 18 : 6) +
        (timeline.activeTasks >= 3 ? 10 : 5)
    )
  );

  const growthScore = Math.round(
    (retentionScore + conversionScore + viralScore) / 3
  );

  const nudges: GrowthNudge[] = [
    {
      title: "Complete your next high-priority task",
      message: `You have ${timeline.activeTasks} active tasks for ${profile.targetIntake}. Completing them improves your readiness score.`,
      trigger: "User has active timeline tasks",
      channel: "In-app",
      priority: "High",
      actionLabel: "Open Timeline",
      href: "/timeline",
    },
    {
      title: "Check loan readiness before final decision",
      message: `Your approval confidence is ${loan.approvalConfidence}%. Prepare documents early to avoid loan delays.`,
      trigger: "Loan readiness detected",
      channel: "WhatsApp",
      priority: "High",
      actionLabel: "Open Loan Engine",
      href: "/loan-engine",
    },
    {
      title: "Compare final study options",
      message: `${decision.selectedOption.university.name} is your strongest decision option. Compare it against ROI and admit safety.`,
      trigger: "Decision score generated",
      channel: "Email",
      priority: "Medium",
      actionLabel: "Open Decision Hub",
      href: "/decision-hub",
    },
    {
      title: "Invite a friend planning higher studies",
      message: "Share your GradPilot roadmap and unlock a profile review badge.",
      trigger: "User reaches 70% profile completion",
      channel: "In-app",
      priority: "Low",
      actionLabel: "View Growth Loop",
      href: "/growth-engine",
    },
  ];

  const contentIdeas: ContentIdea[] = [
    {
      title: `Canada vs Germany for ${profile.targetCourse}`,
      format: "Blog",
      audience: "Indian students comparing affordable study-abroad paths",
      hook: "Which country gives better ROI, admission chances, and long-term opportunity?",
      cta: "Build your free Digital Twin",
    },
    {
      title: "How much education loan can you actually get?",
      format: "Reel",
      audience: "Students anxious about funding",
      hook: "Your loan eligibility is not just your university cost. It depends on income, co-applicant, ROI, and documents.",
      cta: "Check loan eligibility",
    },
    {
      title: "Safe, Match, Ambitious University Quiz",
      format: "Quiz",
      audience: "Students starting university shortlisting",
      hook: "Answer 6 questions and get your university risk bucket.",
      cta: "Open Admission Predictor",
    },
    {
      title: `${profile.targetIntake} Application Deadline Planner`,
      format: "Newsletter",
      audience: "Students who are delaying applications",
      hook: "A weekly plan for tests, SOPs, LORs, applications, loans, and visa.",
      cta: "Generate Timeline",
    },
  ];

  const engagementLoops: EngagementLoop[] = [
    {
      title: "Readiness Streak",
      mechanic:
        "Students gain streak points when they complete weekly application and loan tasks.",
      whyItWorks: "Turns stressful application work into visible progress.",
      metric: "Weekly active users",
      status: "Live",
    },
    {
      title: "Referral Unlock",
      mechanic:
        "Invite a friend to unlock a deeper profile review and university shortlist badge.",
      whyItWorks:
        "Students planning abroad usually have peer groups with similar goals.",
      metric: "Referral rate",
      status: "Ready",
    },
    {
      title: "Decision Score Share Card",
      mechanic:
        "Students can share a clean card showing country fit, ROI score, and readiness.",
      whyItWorks:
        "Creates social proof while bringing new users into the funnel.",
      metric: "Organic signups",
      status: "Ready",
    },
    {
      title: "Loan Readiness Milestone",
      mechanic:
        "When document readiness crosses 70%, user gets nudged toward loan offer comparison.",
      whyItWorks: "Connects trust and readiness to loan conversion.",
      metric: "Loan application starts",
      status: "Live",
    },
  ];

  const lifecycleAgents: LifecycleAgent[] = [
    {
      title: "Acquisition Agent",
      trigger: "Trending student query detected",
      job: "Generate blogs, reels, quizzes, and country comparison content.",
      output: "Personalized campaign assets",
      autonomyLevel: "High",
    },
    {
      title: "Engagement Agent",
      trigger: "User is inactive for 3 days",
      job: "Send stage-specific nudges based on missing tasks.",
      output: "In-app, email, WhatsApp, or push nudge",
      autonomyLevel: "High",
    },
    {
      title: "Decision Agent",
      trigger: "Student updates Digital Twin",
      job: "Recompute country, ROI, admission, loan, and final decision scores.",
      output: "Updated command center and recommended next action",
      autonomyLevel: "High",
    },
    {
      title: "Loan Conversion Agent",
      trigger: "Loan readiness crosses conversion threshold",
      job: "Recommend loan offers, document checklist, and assisted application flow.",
      output: "Loan application intent",
      autonomyLevel: "Medium",
    },
  ];

  const funnel: FunnelStage[] = [
    {
      stage: "Awareness",
      goal: "Attract students through AI-generated content and quizzes.",
      aiAction: "Generate country comparison content and ROI explainers.",
      conversionMetric: "Visitor to signup",
      score: viralScore,
    },
    {
      stage: "Engagement",
      goal: "Make students return through useful tools.",
      aiAction: "Personalize nudges, readiness cards, and task reminders.",
      conversionMetric: "Weekly active users",
      score: retentionScore,
    },
    {
      stage: "Trust",
      goal: "Build decision confidence through explainable scores.",
      aiAction: "Show why a university/country/loan option fits the profile.",
      conversionMetric: "Tools completed per user",
      score: decision.overallScore,
    },
    {
      stage: "Conversion",
      goal: "Move qualified students into loan application flow.",
      aiAction: "Estimate eligibility, show offers, and generate checklist.",
      conversionMetric: "Loan application starts",
      score: conversionScore,
    },
  ];

  const zeroHumanInterventionFlow = [
    "AI content attracts the student through country, ROI, or loan-awareness content.",
    "Student signs up and creates a Digital Twin.",
    "Recommendation engines generate country, university, ROI, admission, and loan scores.",
    "Engagement agent sends nudges based on missing tasks and journey stage.",
    "Decision agent recommends the best-fit path and next action.",
    "Loan conversion agent triggers eligibility, offers, checklist, and application flow.",
  ];

  return {
    personaSegment,
    growthScore,
    retentionScore,
    conversionScore,
    viralScore,
    aiSummary: `${personaSegment} profile detected. GradPilot should focus on nudges around ${profile.targetIntake}, ${profile.targetCourse}, decision confidence, and education loan readiness.`,
    nudges,
    contentIdeas,
    engagementLoops,
    lifecycleAgents,
    funnel,
    zeroHumanInterventionFlow,
  };
}