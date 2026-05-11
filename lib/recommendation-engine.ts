import { UNIVERSITY_DATA, type UniversityData } from "@/data/universities";
import type { Country, FitLevel, StudentProfile } from "@/types";

export type UniversityRecommendation = {
  university: UniversityData;
  matchScore: number;
  admissionChance: number;
  affordabilityScore: number;
  roiScore: number;
  careerScore: number;
  fitLevel: FitLevel;
  reasons: string[];
  improvementTips: string[];
};

export type CountryFitInsight = {
  country: Country;
  countryScore: number;
  averageAdmission: number;
  averageTotalCost: number;
  averageSalary: number;
  averageRoi: number;
  bestFitLabel: "High Fit" | "Balanced Fit" | "Emerging Fit";
  topUniversities: string[];
  reasons: string[];
};

export type CareerNavigatorResult = {
  recommendedCountries: CountryFitInsight[];
  recommendedUniversities: UniversityRecommendation[];
  topRecommendation: UniversityRecommendation;
  aiSummary: string;
  nextActions: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getRankingBonus(rankingBand: UniversityData["rankingBand"]) {
  if (rankingBand === "Top 50") return 12;
  if (rankingBand === "Top 100") return 9;
  if (rankingBand === "Top 200") return 6;
  return 3;
}

function getPreferenceBonus(country: Country, profile: StudentProfile) {
  const index = profile.preferredCountries.indexOf(country);

  if (index === 0) return 14;
  if (index === 1) return 10;
  if (index === 2) return 7;
  if (index >= 3) return 4;

  return 0;
}

function getCourseFit(university: UniversityData, profile: StudentProfile) {
  const target = profile.targetCourse.toLowerCase();

  const exactCourseMatch = university.courses.some((course) =>
    target.includes(course.toLowerCase())
  );

  const broadTechMatch =
    target.includes("computer") ||
    target.includes("software") ||
    target.includes("data") ||
    target.includes("ai") ||
    target.includes("machine");

  const universityHasTech = university.courses.some((course) => {
    const lower = course.toLowerCase();
    return (
      lower.includes("computer") ||
      lower.includes("software") ||
      lower.includes("data") ||
      lower.includes("ai")
    );
  });

  if (exactCourseMatch) return 100;
  if (broadTechMatch && universityHasTech) return 88;
  if (universityHasTech) return 72;

  return 55;
}

function getAdmissionChance(
  university: UniversityData,
  profile: StudentProfile
) {
  let score = 45;

  const cgpaGap = profile.cgpa - university.minimumCgpa;

  if (cgpaGap >= 0.7) score += 25;
  else if (cgpaGap >= 0.2) score += 18;
  else if (cgpaGap >= 0) score += 12;
  else if (cgpaGap >= -0.5) score += 5;
  else score -= 10;

  if (university.preferredEnglishScore === 0) {
    score += 10;
  } else if (profile.englishScore >= university.preferredEnglishScore + 0.5) {
    score += 15;
  } else if (profile.englishScore >= university.preferredEnglishScore) {
    score += 10;
  } else {
    score -= 8;
  }

  if (profile.testScoreType !== "None" && profile.testScore > 0) {
    score += 8;
  }

  if (profile.workExperienceMonths >= 12) {
    score += 7;
  } else if (profile.workExperienceMonths >= 6) {
    score += 4;
  }

  score -= Math.min(profile.backlogs * 5, 20);
  score += getRankingBonus(university.rankingBand);

  return clamp(Math.round(score));
}

function getAffordabilityScore(
  university: UniversityData,
  profile: StudentProfile
) {
  const totalCost = university.averageTuitionLakhs + university.livingCostLakhs;
  const budgetGap = profile.budgetLakhs - totalCost;

  let score = 50;

  if (budgetGap >= 10) score += 30;
  else if (budgetGap >= 0) score += 20;
  else if (budgetGap >= -10) score += 8;
  else score -= 15;

  if (profile.needsLoan) {
    const loanCoverage =
      profile.expectedLoanAmountLakhs / Math.max(totalCost, 1);

    if (loanCoverage >= 0.75) score += 10;
    else if (loanCoverage >= 0.5) score += 5;
    else score -= 6;
  }

  if (university.scholarshipChance >= 60) {
    score += 8;
  }

  return clamp(Math.round(score));
}

function getRoiScore(university: UniversityData, profile: StudentProfile) {
  const totalCost = university.averageTuitionLakhs + university.livingCostLakhs;
  const salaryToCostRatio =
    university.averageSalaryLakhs / Math.max(totalCost, 1);

  let score = 35;

  if (salaryToCostRatio >= 2.2) score += 35;
  else if (salaryToCostRatio >= 1.5) score += 25;
  else if (salaryToCostRatio >= 1) score += 15;
  else score += 5;

  score +=
    university.careerDemand >= 90 ? 15 : university.careerDemand >= 80 ? 10 : 5;
  score +=
    profile.riskPreference === "Conservative" &&
    totalCost <= profile.budgetLakhs
      ? 7
      : 0;
  score +=
    profile.riskPreference === "Aggressive" &&
    university.averageSalaryLakhs >= 60
      ? 7
      : 0;

  return clamp(Math.round(score));
}

function getFitLevel(admissionChance: number): FitLevel {
  if (admissionChance >= 76) return "Safe";
  if (admissionChance >= 55) return "Match";
  return "Ambitious";
}

function getReasons(
  university: UniversityData,
  profile: StudentProfile,
  admissionChance: number,
  affordabilityScore: number,
  roiScore: number
) {
  const reasons: string[] = [];

  if (profile.preferredCountries.includes(university.country)) {
    reasons.push(
      `${university.country} is already in your preferred country list.`
    );
  }

  if (admissionChance >= 70) {
    reasons.push("Your academic profile is competitive for this university.");
  } else {
    reasons.push("This university may stretch your current academic profile.");
  }

  if (affordabilityScore >= 70) {
    reasons.push(
      "The cost is reasonably aligned with your budget and loan plan."
    );
  }

  if (roiScore >= 70) {
    reasons.push("Salary potential looks strong compared to total investment.");
  }

  if (university.careerDemand >= 85) {
    reasons.push(
      "Career demand for your target field is strong in this market."
    );
  }

  if (university.prOpportunity >= 80) {
    reasons.push(
      "Post-study and long-term settlement opportunities are favorable."
    );
  }

  return reasons.slice(0, 4);
}

function getImprovementTips(
  university: UniversityData,
  profile: StudentProfile,
  admissionChance: number
) {
  const tips: string[] = [];

  if (profile.cgpa < university.minimumCgpa) {
    tips.push(
      "Strengthen your SOP and projects because your CGPA is below the typical profile range."
    );
  }

  if (
    university.preferredEnglishScore > 0 &&
    profile.englishScore < university.preferredEnglishScore
  ) {
    tips.push(
      `Aim for an English score of ${university.preferredEnglishScore}+ for safer admission chances.`
    );
  }

  if (profile.testScoreType === "None" || profile.testScore === 0) {
    tips.push(
      "Add GRE/GMAT/IELTS/TOEFL details to improve recommendation accuracy."
    );
  }

  if (profile.needsLoan && !profile.hasCoApplicant) {
    tips.push(
      "Adding a co-applicant can improve loan confidence for this option."
    );
  }

  if (admissionChance < 60) {
    tips.push(
      "Apply to this as an ambitious option and balance it with safer universities."
    );
  }

  if (tips.length === 0) {
    tips.push(
      "Your profile is well aligned. Focus on SOP, LORs, and early application deadlines."
    );
  }

  return tips.slice(0, 3);
}

function recommendUniversity(
  university: UniversityData,
  profile: StudentProfile
): UniversityRecommendation {
  const courseFit = getCourseFit(university, profile);
  const admissionChance = getAdmissionChance(university, profile);
  const affordabilityScore = getAffordabilityScore(university, profile);
  const roiScore = getRoiScore(university, profile);
  const careerScore = university.careerDemand;
  const preferenceBonus = getPreferenceBonus(university.country, profile);

  const matchScore = clamp(
    Math.round(
      courseFit * 0.18 +
        admissionChance * 0.22 +
        affordabilityScore * 0.2 +
        roiScore * 0.18 +
        careerScore * 0.14 +
        university.visaFriendliness * 0.04 +
        preferenceBonus
    )
  );

  return {
    university,
    matchScore,
    admissionChance,
    affordabilityScore,
    roiScore,
    careerScore,
    fitLevel: getFitLevel(admissionChance),
    reasons: getReasons(
      university,
      profile,
      admissionChance,
      affordabilityScore,
      roiScore
    ),
    improvementTips: getImprovementTips(university, profile, admissionChance),
  };
}

function buildCountryInsights(
  recommendations: UniversityRecommendation[],
  profile: StudentProfile
): CountryFitInsight[] {
  const countryMap = new Map<Country, UniversityRecommendation[]>();

  recommendations.forEach((recommendation) => {
    const country = recommendation.university.country;
    const existing = countryMap.get(country) ?? [];
    countryMap.set(country, [...existing, recommendation]);
  });

  return Array.from(countryMap.entries())
    .map(([country, items]) => {
      const average = (values: number[]) =>
        Math.round(
          values.reduce((sum, value) => sum + value, 0) / values.length
        );

      const averageTotalCost = average(
        items.map(
          (item) =>
            item.university.averageTuitionLakhs +
            item.university.livingCostLakhs
        )
      );

      const averageSalary = average(
        items.map((item) => item.university.averageSalaryLakhs)
      );

      const averageAdmission = average(
        items.map((item) => item.admissionChance)
      );
      const averageRoi = average(items.map((item) => item.roiScore));
      const averageMatch = average(items.map((item) => item.matchScore));

      const preferenceBonus = getPreferenceBonus(country, profile);
      const countryScore = clamp(
        Math.round(averageMatch + preferenceBonus / 2)
      );

      const reasons: string[] = [];

      if (profile.preferredCountries.includes(country)) {
        reasons.push("Already preferred by the student.");
      }

      if (averageTotalCost <= profile.budgetLakhs) {
        reasons.push("Average cost is close to the current budget.");
      }

      if (averageSalary >= 50) {
        reasons.push("Strong salary potential after graduation.");
      }

      if (country === "Canada") {
        reasons.push("Balanced study, work, and long-term opportunity path.");
      }

      if (country === "Germany") {
        reasons.push("Strong ROI because of lower tuition options.");
      }

      if (country === "USA") {
        reasons.push("High career upside, but higher cost and visa risk.");
      }

      const bestFitLabel: CountryFitInsight["bestFitLabel"] =
        countryScore >= 75
          ? "High Fit"
          : countryScore >= 60
          ? "Balanced Fit"
          : "Emerging Fit";

      return {
        country,
        countryScore,
        averageAdmission,
        averageTotalCost,
        averageSalary,
        averageRoi,
        bestFitLabel,
        topUniversities: items
          .slice()
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 3)
          .map((item) => item.university.name),
        reasons: reasons.slice(0, 3),
      };
    })
    .sort((a, b) => b.countryScore - a.countryScore);
}

export function buildCareerNavigatorResult(
  profile: StudentProfile
): CareerNavigatorResult {
  const recommendedUniversities = UNIVERSITY_DATA.map((university) =>
    recommendUniversity(university, profile)
  ).sort((a, b) => b.matchScore - a.matchScore);

  const recommendedCountries = buildCountryInsights(
    recommendedUniversities,
    profile
  );

  const topRecommendation = recommendedUniversities[0];

  const aiSummary = `${topRecommendation.university.name} in ${topRecommendation.university.country} is currently your strongest match with a ${topRecommendation.matchScore}% fit score. The recommendation balances admission probability, ROI, affordability, course fit, career demand, and your preferred countries.`;

  const nextActions = [
    "Compare the top 3 countries in the Decision Hub.",
    "Use the ROI Calculator to check break-even period and EMI pressure.",
    "Open Admission Predictor for safe, match, and ambitious classification.",
    "Review Loan Engine once you finalize your target country and budget.",
  ];

  return {
    recommendedCountries,
    recommendedUniversities: recommendedUniversities.slice(0, 8),
    topRecommendation,
    aiSummary,
    nextActions,
  };
}
