import { UNIVERSITY_DATA, type UniversityData } from "@/data/universities";
import type { StudentProfile } from "@/types";

export type RoiRiskLevel = "Low" | "Medium" | "High";

export type RoiScenario = {
  university: UniversityData;
  totalCostLakhs: number;
  tuitionLakhs: number;
  livingCostLakhs: number;
  expectedSalaryLakhs: number;
  expectedMonthlySalary: number;
  loanAmountLakhs: number;
  interestRate: number;
  repaymentYears: number;
  monthlyEmi: number;
  totalRepaymentLakhs: number;
  totalInterestLakhs: number;
  breakEvenYears: number;
  roiScore: number;
  affordabilityScore: number;
  salaryToCostRatio: number;
  riskLevel: RoiRiskLevel;
  affordabilityLabel: "Comfortable" | "Manageable" | "Stretched";
  recommendation: "Strong ROI" | "Balanced ROI" | "Risky ROI";
  reasons: string[];
  warnings: string[];
};

export type RoiEngineResult = {
  scenarios: RoiScenario[];
  selectedScenario: RoiScenario;
  aiSummary: string;
  financialTips: string[];
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
  repaymentYears: number
) {
  if (loanAmountLakhs <= 0) {
    return 0;
  }

  const principal = loanAmountLakhs * 100000;
  const monthlyRate = annualInterestRate / 100 / 12;
  const months = repaymentYears * 12;

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return Math.round(emi);
}

function getInterestRate(profile: StudentProfile, university: UniversityData) {
  let rate = 11.2;

  if (profile.hasCoApplicant) rate -= 0.6;
  if (profile.familyIncomeLakhs >= 18) rate -= 0.4;
  if (profile.cgpa >= 8) rate -= 0.25;
  if (university.rankingBand === "Top 50") rate -= 0.35;
  if (university.rankingBand === "Top 100") rate -= 0.2;
  if (university.country === "India") rate -= 0.6;

  if (!profile.hasCoApplicant) rate += 0.45;
  if (profile.expectedLoanAmountLakhs > profile.familyIncomeLakhs * 4)
    rate += 0.5;

  return round(clamp(rate, 8.8, 13.5), 2);
}

function getRepaymentYears(profile: StudentProfile) {
  if (profile.expectedLoanAmountLakhs >= 45) return 12;
  if (profile.expectedLoanAmountLakhs >= 25) return 10;
  return 7;
}

function getRiskLevel(
  emiToIncomeRatio: number,
  salaryToCostRatio: number
): RoiRiskLevel {
  if (emiToIncomeRatio <= 0.28 && salaryToCostRatio >= 1.25) return "Low";
  if (emiToIncomeRatio <= 0.45 && salaryToCostRatio >= 0.85) return "Medium";
  return "High";
}

function getAffordabilityLabel(
  score: number
): RoiScenario["affordabilityLabel"] {
  if (score >= 75) return "Comfortable";
  if (score >= 50) return "Manageable";
  return "Stretched";
}

function getRecommendation(score: number): RoiScenario["recommendation"] {
  if (score >= 75) return "Strong ROI";
  if (score >= 55) return "Balanced ROI";
  return "Risky ROI";
}

function buildScenario(
  university: UniversityData,
  profile: StudentProfile
): RoiScenario {
  const tuitionLakhs = university.averageTuitionLakhs;
  const livingCostLakhs = university.livingCostLakhs;
  const totalCostLakhs = tuitionLakhs + livingCostLakhs;

  const expectedSalaryLakhs = university.averageSalaryLakhs;
  const expectedMonthlySalary = Math.round((expectedSalaryLakhs * 100000) / 12);

  const loanAmountLakhs = profile.needsLoan
    ? Math.min(profile.expectedLoanAmountLakhs, totalCostLakhs)
    : 0;

  const interestRate = getInterestRate(profile, university);
  const repaymentYears = getRepaymentYears(profile);
  const monthlyEmi = calculateEmi(
    loanAmountLakhs,
    interestRate,
    repaymentYears
  );

  const totalRepaymentLakhs =
    loanAmountLakhs > 0
      ? round((monthlyEmi * repaymentYears * 12) / 100000, 1)
      : 0;

  const totalInterestLakhs = round(
    Math.max(totalRepaymentLakhs - loanAmountLakhs, 0),
    1
  );

  const salaryToCostRatio = round(
    expectedSalaryLakhs / Math.max(totalCostLakhs, 1),
    2
  );

  const estimatedAnnualSavingsLakhs = expectedSalaryLakhs * 0.32;
  const breakEvenYears = round(
    totalCostLakhs / Math.max(estimatedAnnualSavingsLakhs, 1),
    1
  );

  const emiToIncomeRatio =
    expectedMonthlySalary > 0 ? monthlyEmi / expectedMonthlySalary : 0;

  let affordabilityScore = 55;

  const budgetGap = profile.budgetLakhs - totalCostLakhs;

  if (budgetGap >= 10) affordabilityScore += 25;
  else if (budgetGap >= 0) affordabilityScore += 16;
  else if (budgetGap >= -10) affordabilityScore += 5;
  else affordabilityScore -= 12;

  if (loanAmountLakhs <= profile.expectedLoanAmountLakhs)
    affordabilityScore += 5;
  if (profile.hasCoApplicant) affordabilityScore += 7;
  if (emiToIncomeRatio < 0.3) affordabilityScore += 8;
  if (emiToIncomeRatio > 0.5) affordabilityScore -= 18;

  affordabilityScore = clamp(Math.round(affordabilityScore));

  let roiScore = 35;

  if (salaryToCostRatio >= 2) roiScore += 34;
  else if (salaryToCostRatio >= 1.4) roiScore += 25;
  else if (salaryToCostRatio >= 1) roiScore += 15;
  else roiScore += 5;

  if (breakEvenYears <= 2.5) roiScore += 16;
  else if (breakEvenYears <= 4) roiScore += 10;
  else if (breakEvenYears <= 5.5) roiScore += 5;
  else roiScore -= 8;

  if (university.careerDemand >= 90) roiScore += 10;
  else if (university.careerDemand >= 80) roiScore += 7;
  else roiScore += 3;

  if (affordabilityScore >= 70) roiScore += 6;
  if (loanAmountLakhs > totalCostLakhs * 0.85) roiScore -= 5;

  roiScore = clamp(Math.round(roiScore));

  const riskLevel = getRiskLevel(emiToIncomeRatio, salaryToCostRatio);

  const reasons: string[] = [];

  if (salaryToCostRatio >= 1.4) {
    reasons.push(
      "Expected salary is strong compared to total study investment."
    );
  }

  if (breakEvenYears <= 4) {
    reasons.push("Break-even period is within a practical range.");
  }

  if (totalCostLakhs <= profile.budgetLakhs) {
    reasons.push("Total cost is aligned with the student’s current budget.");
  }

  if (university.careerDemand >= 85) {
    reasons.push(
      "Career demand in this destination is strong for the chosen field."
    );
  }

  if (profile.needsLoan && profile.hasCoApplicant) {
    reasons.push(
      "Co-applicant support improves repayment and approval confidence."
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      "This option is possible, but needs careful financial planning."
    );
  }

  const warnings: string[] = [];

  if (totalCostLakhs > profile.budgetLakhs) {
    warnings.push("Total cost is higher than the current budget.");
  }

  if (emiToIncomeRatio > 0.45) {
    warnings.push(
      "Estimated EMI may create repayment pressure after graduation."
    );
  }

  if (breakEvenYears > 5) {
    warnings.push("Break-even period is relatively long.");
  }

  if (loanAmountLakhs > profile.familyIncomeLakhs * 4) {
    warnings.push("Loan amount is high compared to current family income.");
  }

  return {
    university,
    totalCostLakhs,
    tuitionLakhs,
    livingCostLakhs,
    expectedSalaryLakhs,
    expectedMonthlySalary,
    loanAmountLakhs,
    interestRate,
    repaymentYears,
    monthlyEmi,
    totalRepaymentLakhs,
    totalInterestLakhs,
    breakEvenYears,
    roiScore,
    affordabilityScore,
    salaryToCostRatio,
    riskLevel,
    affordabilityLabel: getAffordabilityLabel(affordabilityScore),
    recommendation: getRecommendation(roiScore),
    reasons: reasons.slice(0, 4),
    warnings: warnings.slice(0, 4),
  };
}

export function buildRoiEngineResult(
  profile: StudentProfile,
  selectedUniversityId?: string
): RoiEngineResult {
  const scenarios = UNIVERSITY_DATA.map((university) =>
    buildScenario(university, profile)
  ).sort((a, b) => b.roiScore - a.roiScore);

  const selectedScenario =
    scenarios.find(
      (scenario) => scenario.university.id === selectedUniversityId
    ) ?? scenarios[0];

  const aiSummary = `${
    selectedScenario.university.name
  } gives a ${selectedScenario.recommendation.toLowerCase()} profile with a ${
    selectedScenario.roiScore
  }% ROI score, estimated break-even of ${
    selectedScenario.breakEvenYears
  } years, and monthly EMI of ₹${selectedScenario.monthlyEmi.toLocaleString(
    "en-IN"
  )}.`;

  const financialTips = [
    "Compare ROI before finalizing universities, not after receiving admits.",
    "Keep EMI below 35–40% of expected monthly salary for safer repayment.",
    "Use lower-cost countries like Germany or India as ROI stabilizers if budget is tight.",
    "Improve scholarship chances and co-applicant readiness to reduce repayment pressure.",
  ];

  return {
    scenarios,
    selectedScenario,
    aiSummary,
    financialTips,
  };
}
