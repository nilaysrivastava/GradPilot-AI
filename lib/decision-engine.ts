import { UNIVERSITY_DATA, type UniversityData } from "@/data/universities";
import { buildAdmissionEngineResult } from "@/lib/admission-engine";
import { buildRoiEngineResult, type RoiScenario } from "@/lib/roi-engine";
import type { Country, StudentProfile } from "@/types";

export type DecisionLabel =
  | "Best Overall"
  | "High ROI"
  | "Safer Admit"
  | "Loan Friendly"
  | "Needs Review";

export type DecisionOption = {
  university: UniversityData;
  finalScore: number;
  decisionLabel: DecisionLabel;
  admissionProbability: number;
  admissionFit: string;
  roiScore: number;
  affordabilityScore: number;
  loanReadinessScore: number;
  countryFitScore: number;
  opportunityScore: number;
  riskScore: number;
  riskLevel: RoiScenario["riskLevel"];
  totalCostLakhs: number;
  expectedSalaryLakhs: number;
  monthlyEmi: number;
  breakEvenYears: number;
  strengths: string[];
  risks: string[];
  recommendation: string;
};

export type CountryDecisionInsight = {
  country: Country;
  decisionScore: number;
  averageCostLakhs: number;
  averageSalaryLakhs: number;
  averageAdmission: number;
  averageRoi: number;
  bestUniversity: string;
  label: "Strong Fit" | "Balanced Fit" | "Explore Carefully";
  reasons: string[];
};

export type DecisionEngineResult = {
  selectedOption: DecisionOption;
  rankedOptions: DecisionOption[];
  countryInsights: CountryDecisionInsight[];
  overallScore: number;
  decisionSummary: string;
  whatIfSummary: string;
  bestBy: {
    overall: string;
    roi: string;
    admission: string;
    affordability: string;
    loan: string;
  };
  portfolioAdvice: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

function getPreferenceBonus(country: Country, profile: StudentProfile) {
  const index = profile.preferredCountries.indexOf(country);

  if (index === 0) return 18;
  if (index === 1) return 13;
  if (index === 2) return 9;
  if (index >= 3) return 5;

  return 0;
}

function getCountryFitScore(
  university: UniversityData,
  profile: StudentProfile
) {
  let score = 42;

  score += getPreferenceBonus(university.country, profile);
  score += university.visaFriendliness * 0.18;
  score += university.prOpportunity * 0.18;
  score += university.scholarshipChance * 0.08;

  if (
    university.country === "Germany" &&
    profile.riskPreference === "Conservative"
  ) {
    score += 8;
  }

  if (university.country === "USA" && profile.riskPreference === "Aggressive") {
    score += 8;
  }

  if (
    university.country === "Canada" &&
    profile.riskPreference === "Balanced"
  ) {
    score += 8;
  }

  return clamp(Math.round(score));
}

function getLoanReadinessScore(
  university: UniversityData,
  profile: StudentProfile,
  roiScenario: RoiScenario
) {
  const totalCost = university.averageTuitionLakhs + university.livingCostLakhs;

  if (!profile.needsLoan) {
    return profile.budgetLakhs >= totalCost ? 94 : 72;
  }

  let score = 38;

  if (profile.hasCoApplicant) score += 22;
  else score += 5;

  if (profile.expectedLoanAmountLakhs >= totalCost * 0.75) score += 18;
  else if (profile.expectedLoanAmountLakhs >= totalCost * 0.5) score += 10;
  else score += 3;

  if (profile.familyIncomeLakhs >= 18) score += 12;
  else if (profile.familyIncomeLakhs >= 10) score += 8;
  else score += 3;

  if (roiScenario.riskLevel === "Low") score += 10;
  else if (roiScenario.riskLevel === "Medium") score += 5;
  else score -= 6;

  if (profile.cgpa >= 8) score += 6;

  return clamp(Math.round(score));
}

function getOpportunityScore(
  university: UniversityData,
  roiScenario: RoiScenario
) {
  let score = 0;

  score += university.careerDemand * 0.38;
  score += university.prOpportunity * 0.22;
  score += university.visaFriendliness * 0.14;
  score += university.scholarshipChance * 0.1;
  score +=
    roiScenario.salaryToCostRatio >= 1.5
      ? 16
      : roiScenario.salaryToCostRatio >= 1
      ? 10
      : 5;

  return clamp(Math.round(score));
}

function getRiskScore(
  university: UniversityData,
  admissionProbability: number,
  roiScenario: RoiScenario,
  profile: StudentProfile
) {
  let risk = 25;

  if (admissionProbability < 45) risk += 28;
  else if (admissionProbability < 60) risk += 16;
  else if (admissionProbability < 75) risk += 8;

  if (roiScenario.riskLevel === "High") risk += 24;
  else if (roiScenario.riskLevel === "Medium") risk += 12;
  else risk += 4;

  if (roiScenario.totalCostLakhs > profile.budgetLakhs) risk += 12;
  if (profile.needsLoan && !profile.hasCoApplicant) risk += 10;
  if (university.visaFriendliness < 70) risk += 8;

  if (profile.riskPreference === "Conservative") risk += 4;
  if (profile.riskPreference === "Aggressive") risk -= 6;

  return clamp(Math.round(risk));
}

function getDecisionLabel(
  option: Omit<DecisionOption, "decisionLabel">
): DecisionLabel {
  if (option.finalScore >= 82) return "Best Overall";
  if (option.roiScore >= 82 && option.riskScore <= 55) return "High ROI";
  if (option.admissionProbability >= 78) return "Safer Admit";
  if (option.loanReadinessScore >= 82) return "Loan Friendly";
  return "Needs Review";
}

function buildStrengths(
  university: UniversityData,
  admissionProbability: number,
  roiScenario: RoiScenario,
  loanReadinessScore: number,
  countryFitScore: number,
  opportunityScore: number
) {
  const strengths: string[] = [];

  if (admissionProbability >= 72) {
    strengths.push(
      "Admission probability is relatively strong for your profile."
    );
  }

  if (roiScenario.roiScore >= 75) {
    strengths.push("ROI looks strong compared to total study investment.");
  }

  if (loanReadinessScore >= 75) {
    strengths.push("Loan readiness is healthy for this option.");
  }

  if (countryFitScore >= 75) {
    strengths.push(
      `${university.country} aligns well with your country preferences and journey goals.`
    );
  }

  if (opportunityScore >= 78) {
    strengths.push("Career and post-study opportunity potential is strong.");
  }

  if (strengths.length === 0) {
    strengths.push(
      "This option is possible but needs careful planning before finalizing."
    );
  }

  return strengths.slice(0, 4);
}

function buildRisks(
  university: UniversityData,
  admissionProbability: number,
  roiScenario: RoiScenario,
  riskScore: number,
  profile: StudentProfile
) {
  const risks: string[] = [];

  if (admissionProbability < 55) {
    risks.push(
      "Admission probability is low, so this should be treated as an ambitious option."
    );
  }

  if (roiScenario.totalCostLakhs > profile.budgetLakhs) {
    risks.push("Total cost is higher than your current budget.");
  }

  if (roiScenario.riskLevel === "High") {
    risks.push("Estimated EMI and repayment pressure may be high.");
  }

  if (profile.needsLoan && !profile.hasCoApplicant) {
    risks.push(
      "Missing co-applicant support may reduce loan approval confidence."
    );
  }

  if (university.visaFriendliness < 70) {
    risks.push("Visa or post-study pathway may require additional planning.");
  }

  if (riskScore <= 40) {
    risks.push(
      "No major risk detected, but final choice should still be checked against deadlines and documents."
    );
  }

  return risks.slice(0, 4);
}

function buildDecisionOption(
  university: UniversityData,
  profile: StudentProfile
): DecisionOption {
  const admissionResult = buildAdmissionEngineResult(profile, university.id);
  const prediction = admissionResult.selectedPrediction;

  const roiResult = buildRoiEngineResult(profile, university.id);
  const roiScenario = roiResult.selectedScenario;

  const countryFitScore = getCountryFitScore(university, profile);
  const loanReadinessScore = getLoanReadinessScore(
    university,
    profile,
    roiScenario
  );
  const opportunityScore = getOpportunityScore(university, roiScenario);
  const riskScore = getRiskScore(
    university,
    prediction.probability,
    roiScenario,
    profile
  );

  const riskSafetyScore = 100 - riskScore;

  const finalScore = clamp(
    Math.round(
      prediction.probability * 0.21 +
        roiScenario.roiScore * 0.22 +
        roiScenario.affordabilityScore * 0.14 +
        loanReadinessScore * 0.14 +
        countryFitScore * 0.12 +
        opportunityScore * 0.12 +
        riskSafetyScore * 0.05
    )
  );

  const optionWithoutLabel = {
    university,
    finalScore,
    admissionProbability: prediction.probability,
    admissionFit: prediction.fitLevel,
    roiScore: roiScenario.roiScore,
    affordabilityScore: roiScenario.affordabilityScore,
    loanReadinessScore,
    countryFitScore,
    opportunityScore,
    riskScore,
    riskLevel: roiScenario.riskLevel,
    totalCostLakhs: roiScenario.totalCostLakhs,
    expectedSalaryLakhs: roiScenario.expectedSalaryLakhs,
    monthlyEmi: roiScenario.monthlyEmi,
    breakEvenYears: roiScenario.breakEvenYears,
    strengths: buildStrengths(
      university,
      prediction.probability,
      roiScenario,
      loanReadinessScore,
      countryFitScore,
      opportunityScore
    ),
    risks: buildRisks(
      university,
      prediction.probability,
      roiScenario,
      riskScore,
      profile
    ),
    recommendation: "",
  };

  const decisionLabel = getDecisionLabel(optionWithoutLabel);

  const recommendation = `${
    university.name
  } is a ${decisionLabel.toLowerCase()} option with ${finalScore}% final decision score, ${
    prediction.probability
  }% admission probability, ${
    roiScenario.roiScore
  }% ROI score, and ${loanReadinessScore}% loan readiness.`;

  return {
    ...optionWithoutLabel,
    decisionLabel,
    recommendation,
  };
}

function buildCountryInsights(
  options: DecisionOption[]
): CountryDecisionInsight[] {
  const countryMap = new Map<Country, DecisionOption[]>();

  options.forEach((option) => {
    const country = option.university.country;
    const existing = countryMap.get(country) ?? [];
    countryMap.set(country, [...existing, option]);
  });

  return Array.from(countryMap.entries())
    .map(([country, items]) => {
      const decisionScore = average(items.map((item) => item.finalScore));
      const averageCostLakhs = average(
        items.map((item) => item.totalCostLakhs)
      );
      const averageSalaryLakhs = average(
        items.map((item) => item.expectedSalaryLakhs)
      );
      const averageAdmission = average(
        items.map((item) => item.admissionProbability)
      );
      const averageRoi = average(items.map((item) => item.roiScore));
      const bestOption = items
        .slice()
        .sort((a, b) => b.finalScore - a.finalScore)[0];

      const reasons: string[] = [];

      if (averageRoi >= 75) reasons.push("Strong ROI potential.");
      if (averageAdmission >= 70)
        reasons.push("Admission chances are relatively healthy.");
      if (averageCostLakhs <= 35)
        reasons.push("Average cost is comparatively manageable.");
      if (country === "Canada")
        reasons.push("Balanced career, study, and long-term pathway.");
      if (country === "Germany")
        reasons.push("Lower-cost options can improve overall affordability.");
      if (country === "USA")
        reasons.push("High upside, but cost and visa planning need attention.");

      const label: CountryDecisionInsight["label"] =
        decisionScore >= 75
          ? "Strong Fit"
          : decisionScore >= 60
          ? "Balanced Fit"
          : "Explore Carefully";

      return {
        country,
        decisionScore,
        averageCostLakhs,
        averageSalaryLakhs,
        averageAdmission,
        averageRoi,
        bestUniversity: bestOption.university.name,
        label,
        reasons: reasons.slice(0, 3),
      };
    })
    .sort((a, b) => b.decisionScore - a.decisionScore);
}

export function buildDecisionEngineResult(
  profile: StudentProfile,
  selectedUniversityId?: string
): DecisionEngineResult {
  const rankedOptions = UNIVERSITY_DATA.map((university) =>
    buildDecisionOption(university, profile)
  ).sort((a, b) => b.finalScore - a.finalScore);

  const selectedOption =
    rankedOptions.find(
      (option) => option.university.id === selectedUniversityId
    ) ?? rankedOptions[0];

  const countryInsights = buildCountryInsights(rankedOptions);

  const overallScore = Math.round(
    (selectedOption.finalScore +
      selectedOption.roiScore +
      selectedOption.admissionProbability +
      selectedOption.loanReadinessScore) /
      4
  );

  const bestBy = {
    overall: rankedOptions[0].university.name,
    roi: rankedOptions.slice().sort((a, b) => b.roiScore - a.roiScore)[0]
      .university.name,
    admission: rankedOptions
      .slice()
      .sort((a, b) => b.admissionProbability - a.admissionProbability)[0]
      .university.name,
    affordability: rankedOptions
      .slice()
      .sort((a, b) => b.affordabilityScore - a.affordabilityScore)[0].university
      .name,
    loan: rankedOptions
      .slice()
      .sort((a, b) => b.loanReadinessScore - a.loanReadinessScore)[0].university
      .name,
  };

  const decisionSummary = `${selectedOption.university.name} currently has the strongest decision profile with ${selectedOption.finalScore}% final score. The engine combines admission probability, ROI, affordability, loan readiness, country fit, opportunity, and risk.`;

  const whatIfSummary = `With CGPA ${profile.cgpa}, budget ₹${
    profile.budgetLakhs
  }L, English score ${profile.englishScore}, and ${
    profile.hasCoApplicant ? "co-applicant support" : "no co-applicant support"
  }, your strongest pathway is ${rankedOptions[0].university.country}.`;

  const portfolioAdvice = [
    "Choose one best-overall option, two ROI-safe options, and two admission-safe options.",
    "Do not finalize a university only by ranking; compare EMI pressure and break-even period.",
    "Use ambitious universities only if your SOP, LORs, and project profile can support the risk.",
    "Check loan readiness before finalizing expensive options.",
  ];

  return {
    selectedOption,
    rankedOptions,
    countryInsights,
    overallScore,
    decisionSummary,
    whatIfSummary,
    bestBy,
    portfolioAdvice,
  };
}
