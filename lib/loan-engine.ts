import { buildDecisionEngineResult } from "@/lib/decision-engine";
import { buildRoiEngineResult } from "@/lib/roi-engine";
import type { StudentProfile } from "@/types";

export type LoanEligibilityLabel =
  | "High Eligibility"
  | "Moderate Eligibility"
  | "Needs Improvement";

export type LoanRisk = "Low" | "Medium" | "High";

export type LoanDocumentStatus = "Ready" | "Pending" | "Needs Review";

export type LoanOffer = {
  id: string;
  lenderName: string;
  offerName: string;
  eligibleAmountLakhs: number;
  interestRate: number;
  tenureYears: number;
  monthlyEmi: number;
  processingFee: string;
  collateralRequired: boolean;
  moratorium: string;
  matchScore: number;
  tags: string[];
  bestFor: string;
};

export type LoanDocument = {
  id: string;
  title: string;
  description: string;
  status: LoanDocumentStatus;
  requiredFor: string;
};

export type LoanApplicationStep = {
  id: string;
  title: string;
  description: string;
  status: "Completed" | "Active" | "Upcoming";
};

export type LoanEngineResult = {
  selectedUniversityName: string;
  selectedCountry: string;
  totalCostLakhs: number;
  requestedLoanLakhs: number;
  eligibleAmountLakhs: number;
  eligibilityScore: number;
  eligibilityLabel: LoanEligibilityLabel;
  riskLevel: LoanRisk;
  estimatedInterestRate: number;
  tenureYears: number;
  monthlyEmi: number;
  totalRepaymentLakhs: number;
  totalInterestLakhs: number;
  repaymentToIncomeRatio: number;
  approvalConfidence: number;
  documentReadiness: number;
  aiSummary: string;
  strengths: string[];
  risks: string[];
  offers: LoanOffer[];
  documents: LoanDocument[];
  applicationSteps: LoanApplicationStep[];
  nextActions: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function calculateEmi(
  loanAmountLakhs: number,
  annualInterestRate: number,
  tenureYears: number
) {
  if (loanAmountLakhs <= 0) return 0;

  const principal = loanAmountLakhs * 100000;
  const monthlyRate = annualInterestRate / 100 / 12;
  const months = tenureYears * 12;

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return Math.round(emi);
}

function getTenureYears(loanAmountLakhs: number) {
  if (loanAmountLakhs >= 45) return 12;
  if (loanAmountLakhs >= 25) return 10;
  return 7;
}

function getEstimatedInterestRate(profile: StudentProfile, rankingBand: string) {
  let rate = 11.4;

  if (profile.hasCoApplicant) rate -= 0.7;
  else rate += 0.45;

  if (profile.familyIncomeLakhs >= 18) rate -= 0.45;
  else if (profile.familyIncomeLakhs < 8) rate += 0.45;

  if (profile.cgpa >= 8.5) rate -= 0.35;
  else if (profile.cgpa < 7) rate += 0.35;

  if (rankingBand === "Top 50") rate -= 0.4;
  else if (rankingBand === "Top 100") rate -= 0.25;

  return round(clamp(rate, 8.75, 13.5), 2);
}

function getEligibilityLabel(score: number): LoanEligibilityLabel {
  if (score >= 78) return "High Eligibility";
  if (score >= 55) return "Moderate Eligibility";
  return "Needs Improvement";
}

function getRiskLevel(score: number, repaymentToIncomeRatio: number): LoanRisk {
  if (score >= 76 && repaymentToIncomeRatio <= 35) return "Low";
  if (score >= 55 && repaymentToIncomeRatio <= 48) return "Medium";
  return "High";
}

function buildDocuments(profile: StudentProfile): LoanDocument[] {
  return [
    {
      id: "student-kyc",
      title: "Student KYC",
      description: "Aadhaar/PAN/passport and basic identity proof.",
      status: profile.name && profile.email && profile.phone ? "Ready" : "Pending",
      requiredFor: "Identity verification",
    },
    {
      id: "academic-records",
      title: "Academic Records",
      description: "Transcripts, marksheets, degree proof, test scores.",
      status:
        profile.currentInstitution && profile.cgpa > 0
          ? "Ready"
          : "Pending",
      requiredFor: "Profile and merit assessment",
    },
    {
      id: "admit-letter",
      title: "University Admit / Application Proof",
      description: "Admit letter, conditional offer, or submitted application proof.",
      status: "Pending",
      requiredFor: "Loan sanction and disbursement",
    },
    {
      id: "fee-structure",
      title: "Fee Structure",
      description: "University tuition, living cost, and total cost estimate.",
      status: profile.budgetLakhs > 0 ? "Needs Review" : "Pending",
      requiredFor: "Loan amount calculation",
    },
    {
      id: "coapplicant-income",
      title: "Co-applicant Income Proof",
      description: "Salary slips, ITR, Form 16, bank statements, or business income proof.",
      status: profile.hasCoApplicant ? "Needs Review" : "Pending",
      requiredFor: "Repayment capacity check",
    },
    {
      id: "bank-statements",
      title: "Bank Statements",
      description: "Recent bank statements of applicant/co-applicant.",
      status: "Pending",
      requiredFor: "Financial verification",
    },
    {
      id: "collateral-docs",
      title: "Collateral Documents",
      description: "Property or security documents if required for higher ticket size.",
      status:
        profile.expectedLoanAmountLakhs >= 40 ? "Pending" : "Needs Review",
      requiredFor: "Secured loan cases",
    },
  ];
}

function getDocumentReadiness(documents: LoanDocument[]) {
  const readyWeight = documents.reduce((score, document) => {
    if (document.status === "Ready") return score + 1;
    if (document.status === "Needs Review") return score + 0.5;
    return score;
  }, 0);

  return Math.round((readyWeight / documents.length) * 100);
}

function buildApplicationSteps(
  eligibilityScore: number,
  documentReadiness: number
): LoanApplicationStep[] {
  return [
    {
      id: "profile-check",
      title: "Profile and eligibility check",
      description: "Use Digital Twin to estimate loan amount, risk, and approval confidence.",
      status: "Completed",
    },
    {
      id: "offer-compare",
      title: "Compare dynamic loan offers",
      description: "Review interest rate, tenure, EMI, collateral, and processing terms.",
      status: eligibilityScore >= 55 ? "Active" : "Upcoming",
    },
    {
      id: "document-upload",
      title: "Prepare and upload documents",
      description: "Complete KYC, academic proof, co-applicant income, and university documents.",
      status: documentReadiness >= 70 ? "Active" : "Upcoming",
    },
    {
      id: "ai-autofill",
      title: "AI-assisted application auto-fill",
      description: "Use saved profile data to pre-fill loan application fields.",
      status: documentReadiness >= 70 ? "Active" : "Upcoming",
    },
    {
      id: "sanction",
      title: "Loan sanction and disbursement",
      description: "Finalize sanction letter, repayment terms, and disbursement schedule.",
      status: "Upcoming",
    },
  ];
}

function buildOffers(input: {
  requestedLoanLakhs: number;
  eligibleAmountLakhs: number;
  baseInterestRate: number;
  tenureYears: number;
  eligibilityScore: number;
  profile: StudentProfile;
}): LoanOffer[] {
  const amount = Math.min(input.requestedLoanLakhs, input.eligibleAmountLakhs);

  const offerTemplates = [
    {
      id: "pf-smart",
      lenderName: "Poonawalla Fincorp",
      offerName: "Education Smart Loan",
      interestAdjustment: -0.25,
      processingFee: "0.75% - 1.25%",
      collateralRequired: amount >= 45,
      moratorium: "Course period + 6 months",
      tags: ["Best match", "Fast processing", "Profile-based"],
      bestFor: "Students with co-applicant support and strong ROI profile.",
      scoreBoost: 8,
    },
    {
      id: "global-scholar",
      lenderName: "Global Scholar Finance",
      offerName: "Study Abroad Prime",
      interestAdjustment: 0.15,
      processingFee: "1.00% - 1.50%",
      collateralRequired: amount >= 35,
      moratorium: "Course period + 12 months",
      tags: ["Study abroad", "Flexible moratorium"],
      bestFor: "Students going abroad with medium to high loan requirement.",
      scoreBoost: 3,
    },
    {
      id: "secure-ed",
      lenderName: "SecureEd Capital",
      offerName: "Co-applicant Advantage",
      interestAdjustment: input.profile.hasCoApplicant ? -0.45 : 0.35,
      processingFee: "0.50% - 1.00%",
      collateralRequired: amount >= 40,
      moratorium: "Course period + 6 months",
      tags: ["Co-applicant friendly", "Lower rate"],
      bestFor: "Students with strong co-applicant income proof.",
      scoreBoost: input.profile.hasCoApplicant ? 7 : -3,
    },
  ];

  return offerTemplates
    .map((offer) => {
      const interestRate = round(
        clamp(input.baseInterestRate + offer.interestAdjustment, 8.5, 13.8),
        2
      );

      const monthlyEmi = calculateEmi(amount, interestRate, input.tenureYears);

      const matchScore = clamp(
        Math.round(
          input.eligibilityScore +
            offer.scoreBoost -
            (offer.collateralRequired ? 4 : 0)
        )
      );

      return {
        id: offer.id,
        lenderName: offer.lenderName,
        offerName: offer.offerName,
        eligibleAmountLakhs: round(amount, 1),
        interestRate,
        tenureYears: input.tenureYears,
        monthlyEmi,
        processingFee: offer.processingFee,
        collateralRequired: offer.collateralRequired,
        moratorium: offer.moratorium,
        matchScore,
        tags: offer.tags,
        bestFor: offer.bestFor,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function buildLoanEngineResult(
  profile: StudentProfile,
  selectedUniversityId?: string
): LoanEngineResult {
  const decision = buildDecisionEngineResult(profile, selectedUniversityId);
  const selected = decision.selectedOption;

  const roi = buildRoiEngineResult(profile, selected.university.id);
  const roiScenario = roi.selectedScenario;

  const totalCostLakhs = roiScenario.totalCostLakhs;
  const requestedLoanLakhs = profile.needsLoan
    ? Math.min(profile.expectedLoanAmountLakhs, totalCostLakhs)
    : 0;

  const baseEligibility =
    profile.familyIncomeLakhs * (profile.hasCoApplicant ? 4.8 : 3.1);

  const meritBoost = profile.cgpa >= 8.5 ? 10 : profile.cgpa >= 7.5 ? 6 : 2;
  const rankingBoost =
    selected.university.rankingBand === "Top 50"
      ? 10
      : selected.university.rankingBand === "Top 100"
      ? 7
      : selected.university.rankingBand === "Top 200"
      ? 4
      : 2;

  const coApplicantBoost = profile.hasCoApplicant ? 12 : 0;

  const eligibleAmountLakhs = round(
    clamp(
      baseEligibility + meritBoost + rankingBoost + coApplicantBoost,
      5,
      Math.max(totalCostLakhs * 1.1, requestedLoanLakhs)
    ),
    1
  );

  let eligibilityScore = 35;

  if (!profile.needsLoan) eligibilityScore += 30;
  if (eligibleAmountLakhs >= requestedLoanLakhs) eligibilityScore += 22;
  else eligibilityScore += 8;

  if (profile.hasCoApplicant) eligibilityScore += 15;
  else eligibilityScore -= 5;

  if (profile.familyIncomeLakhs >= 18) eligibilityScore += 12;
  else if (profile.familyIncomeLakhs >= 10) eligibilityScore += 8;
  else eligibilityScore += 3;

  if (profile.cgpa >= 8) eligibilityScore += 7;
  if (profile.profileCompleteness >= 85) eligibilityScore += 6;
  if (roiScenario.riskLevel === "Low") eligibilityScore += 7;
  if (requestedLoanLakhs > profile.familyIncomeLakhs * 4.5) eligibilityScore -= 8;

  eligibilityScore = clamp(Math.round(eligibilityScore));

  const estimatedInterestRate = getEstimatedInterestRate(
    profile,
    selected.university.rankingBand
  );

  const tenureYears = getTenureYears(requestedLoanLakhs);
  const monthlyEmi = calculateEmi(
    requestedLoanLakhs,
    estimatedInterestRate,
    tenureYears
  );

  const totalRepaymentLakhs =
    requestedLoanLakhs > 0
      ? round((monthlyEmi * tenureYears * 12) / 100000, 1)
      : 0;

  const totalInterestLakhs = round(
    Math.max(totalRepaymentLakhs - requestedLoanLakhs, 0),
    1
  );

  const expectedMonthlySalary =
    selected.expectedSalaryLakhs > 0
      ? (selected.expectedSalaryLakhs * 100000) / 12
      : 1;

  const repaymentToIncomeRatio =
    monthlyEmi > 0
      ? Math.round((monthlyEmi / expectedMonthlySalary) * 100)
      : 0;

  const approvalConfidence = clamp(
    Math.round(
      eligibilityScore * 0.52 +
        selected.loanReadinessScore * 0.25 +
        (100 - selected.riskScore) * 0.13 +
        profile.profileCompleteness * 0.1
    )
  );

  const documents = buildDocuments(profile);
  const documentReadiness = getDocumentReadiness(documents);

  const riskLevel = getRiskLevel(eligibilityScore, repaymentToIncomeRatio);
  const eligibilityLabel = getEligibilityLabel(eligibilityScore);

  const offers = buildOffers({
    requestedLoanLakhs,
    eligibleAmountLakhs,
    baseInterestRate: estimatedInterestRate,
    tenureYears,
    eligibilityScore,
    profile,
  });

  const strengths: string[] = [];

  if (eligibleAmountLakhs >= requestedLoanLakhs) {
    strengths.push("Estimated eligible amount can cover the requested loan size.");
  }

  if (profile.hasCoApplicant) {
    strengths.push("Co-applicant support improves approval confidence.");
  }

  if (selected.roiScore >= 70) {
    strengths.push("ROI score supports repayment confidence.");
  }

  if (selected.university.rankingBand === "Top 50" || selected.university.rankingBand === "Top 100") {
    strengths.push("University ranking can strengthen lender confidence.");
  }

  if (strengths.length === 0) {
    strengths.push("Loan path is possible, but profile and documents need improvement.");
  }

  const risks: string[] = [];

  if (!profile.hasCoApplicant) {
    risks.push("No co-applicant support may reduce approval confidence.");
  }

  if (repaymentToIncomeRatio > 45) {
    risks.push("EMI may be high compared to expected monthly salary.");
  }

  if (requestedLoanLakhs > eligibleAmountLakhs) {
    risks.push("Requested loan is higher than estimated eligibility.");
  }

  if (documentReadiness < 60) {
    risks.push("Document readiness is low and may delay application processing.");
  }

  if (risks.length === 0) {
    risks.push("No major loan risk detected, but final lender checks are still required.");
  }

  const applicationSteps = buildApplicationSteps(
    eligibilityScore,
    documentReadiness
  );

  const aiSummary = profile.needsLoan
    ? `For ${selected.university.name}, your estimated loan eligibility is ₹${eligibleAmountLakhs}L against a requested amount of ₹${requestedLoanLakhs}L. Approval confidence is ${approvalConfidence}% with an estimated EMI of ₹${monthlyEmi.toLocaleString("en-IN")}/month.`
    : `You have not marked loan funding as required. GradPilot still estimates affordability and document readiness so you can prepare proof of funds if needed.`;

  const nextActions = [
    "Compare the best loan offer with EMI and processing fee.",
    "Prepare co-applicant income proof and bank statements.",
    "Keep university admit letter and fee structure ready for sanction.",
    "Use ROI Calculator before accepting high-cost loan options.",
  ];

  return {
    selectedUniversityName: selected.university.name,
    selectedCountry: selected.university.country,
    totalCostLakhs,
    requestedLoanLakhs,
    eligibleAmountLakhs,
    eligibilityScore,
    eligibilityLabel,
    riskLevel,
    estimatedInterestRate,
    tenureYears,
    monthlyEmi,
    totalRepaymentLakhs,
    totalInterestLakhs,
    repaymentToIncomeRatio,
    approvalConfidence,
    documentReadiness,
    aiSummary,
    strengths: strengths.slice(0, 4),
    risks: risks.slice(0, 4),
    offers,
    documents,
    applicationSteps,
    nextActions,
  };
}