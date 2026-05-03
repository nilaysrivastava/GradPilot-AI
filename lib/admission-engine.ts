import { UNIVERSITY_DATA, type UniversityData } from "@/data/universities";
import type { FitLevel, StudentProfile } from "@/types";

export type AdmissionPrediction = {
  university: UniversityData;
  probability: number;
  fitLevel: FitLevel;
  academicScore: number;
  testScore: number;
  profileScore: number;
  competitionRisk: "Low" | "Medium" | "High";
  decisionLabel: "Likely Admit" | "Competitive" | "Reach";
  reasons: string[];
  gaps: string[];
  actionPlan: string[];
};

export type AdmissionEngineResult = {
  predictions: AdmissionPrediction[];
  selectedPrediction: AdmissionPrediction;
  profileStrength: number;
  averageProbability: number;
  safeCount: number;
  matchCount: number;
  ambitiousCount: number;
  aiSummary: string;
  overallAdvice: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getRankingDifficulty(rankingBand: UniversityData["rankingBand"]) {
  if (rankingBand === "Top 50") return 18;
  if (rankingBand === "Top 100") return 12;
  if (rankingBand === "Top 200") return 7;
  return 3;
}

function getFitLevel(probability: number): FitLevel {
  if (probability >= 75) return "Safe";
  if (probability >= 52) return "Match";
  return "Ambitious";
}

function getDecisionLabel(
  probability: number
): AdmissionPrediction["decisionLabel"] {
  if (probability >= 75) return "Likely Admit";
  if (probability >= 52) return "Competitive";
  return "Reach";
}

function getCompetitionRisk(
  probability: number
): AdmissionPrediction["competitionRisk"] {
  if (probability >= 72) return "Low";
  if (probability >= 50) return "Medium";
  return "High";
}

function getAcademicScore(profile: StudentProfile, university: UniversityData) {
  let score = 45;

  const cgpaGap = profile.cgpa - university.minimumCgpa;

  if (cgpaGap >= 0.8) score += 32;
  else if (cgpaGap >= 0.4) score += 25;
  else if (cgpaGap >= 0) score += 18;
  else if (cgpaGap >= -0.4) score += 8;
  else score -= 12;

  if (profile.backlogs === 0) score += 8;
  else score -= Math.min(profile.backlogs * 5, 20);

  if (profile.workExperienceMonths >= 18) score += 8;
  else if (profile.workExperienceMonths >= 6) score += 5;
  else score += 2;

  return clamp(Math.round(score));
}

function getTestScore(profile: StudentProfile, university: UniversityData) {
  let score = 40;

  if (university.preferredEnglishScore === 0) {
    score += 20;
  } else if (profile.englishScore >= university.preferredEnglishScore + 0.5) {
    score += 28;
  } else if (profile.englishScore >= university.preferredEnglishScore) {
    score += 20;
  } else if (profile.englishScore >= university.preferredEnglishScore - 0.5) {
    score += 10;
  } else {
    score -= 8;
  }

  if (profile.testScoreType === "GRE") {
    if (profile.testScore >= 325) score += 22;
    else if (profile.testScore >= 315) score += 16;
    else if (profile.testScore >= 305) score += 9;
    else if (profile.testScore > 0) score += 4;
    else score -= 8;
  } else if (profile.testScoreType === "GMAT") {
    if (profile.testScore >= 700) score += 22;
    else if (profile.testScore >= 650) score += 16;
    else if (profile.testScore >= 600) score += 9;
    else if (profile.testScore > 0) score += 4;
    else score -= 8;
  } else if (
    profile.testScoreType === "IELTS" ||
    profile.testScoreType === "TOEFL"
  ) {
    score += profile.testScore > 0 ? 8 : 2;
  } else {
    score -= 4;
  }

  return clamp(Math.round(score));
}

function getCourseAlignment(
  profile: StudentProfile,
  university: UniversityData
) {
  const target = profile.targetCourse.toLowerCase();

  const targetKeywords = target
    .split(/[\s,-]+/)
    .filter((word) => word.length > 2);

  const courseText = university.courses.join(" ").toLowerCase();

  const matchedKeywords = targetKeywords.filter((word) =>
    courseText.includes(word)
  );

  const techIntent =
    target.includes("computer") ||
    target.includes("software") ||
    target.includes("data") ||
    target.includes("ai") ||
    target.includes("machine") ||
    target.includes("business analytics");

  const universityTech =
    courseText.includes("computer") ||
    courseText.includes("software") ||
    courseText.includes("data") ||
    courseText.includes("ai") ||
    courseText.includes("analytics");

  if (matchedKeywords.length >= 2) return 95;
  if (matchedKeywords.length === 1) return 82;
  if (techIntent && universityTech) return 78;
  if (universityTech) return 65;

  return 52;
}

function getProfileScore(profile: StudentProfile, university: UniversityData) {
  let score = 35;

  score += getCourseAlignment(profile, university) * 0.25;
  score +=
    profile.profileCompleteness >= 85
      ? 18
      : profile.profileCompleteness >= 65
      ? 10
      : 4;
  score += profile.preferredCountries.includes(university.country) ? 10 : 2;
  score += university.scholarshipChance >= 60 ? 5 : 2;
  score += university.visaFriendliness >= 80 ? 5 : 2;

  return clamp(Math.round(score));
}

function buildReasons(
  profile: StudentProfile,
  university: UniversityData,
  academicScore: number,
  testScore: number,
  profileScore: number
) {
  const reasons: string[] = [];

  if (academicScore >= 72) {
    reasons.push(
      "Your CGPA and academic profile are competitive for this university."
    );
  } else if (academicScore >= 55) {
    reasons.push(
      "Your academics are close to the expected range, but not fully safe."
    );
  }

  if (testScore >= 70) {
    reasons.push("Your English/test readiness supports this application.");
  }

  if (profileScore >= 70) {
    reasons.push(
      "Your course preference and country preference align well with this option."
    );
  }

  if (university.rankingBand === "Top 50") {
    reasons.push(
      "This is a highly ranked university, so competition will be stronger."
    );
  }

  if (university.careerDemand >= 85) {
    reasons.push(
      "Career demand is strong for your target area in this destination."
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      "This option is possible, but profile strengthening is needed before applying."
    );
  }

  return reasons.slice(0, 4);
}

function buildGaps(profile: StudentProfile, university: UniversityData) {
  const gaps: string[] = [];

  if (profile.cgpa < university.minimumCgpa) {
    gaps.push(
      `CGPA is below the typical range. Target profile range is around ${university.minimumCgpa}+.`
    );
  }

  if (
    university.preferredEnglishScore > 0 &&
    profile.englishScore < university.preferredEnglishScore
  ) {
    gaps.push(
      `English score should ideally be ${university.preferredEnglishScore}+ for this university.`
    );
  }

  if (profile.testScoreType === "None" || profile.testScore === 0) {
    gaps.push(
      "Standardized test information is missing, so prediction confidence is lower."
    );
  }

  if (profile.backlogs > 0) {
    gaps.push(
      "Backlogs may reduce admission confidence for competitive universities."
    );
  }

  if (profile.profileCompleteness < 80) {
    gaps.push(
      "Digital Twin is not fully complete, which limits prediction accuracy."
    );
  }

  if (gaps.length === 0) {
    gaps.push(
      "No major profile gap detected. Focus on SOP, LORs, and early application."
    );
  }

  return gaps.slice(0, 4);
}

function buildActionPlan(
  profile: StudentProfile,
  university: UniversityData,
  fitLevel: FitLevel
) {
  const actions: string[] = [];

  if (fitLevel === "Ambitious") {
    actions.push(
      "Use this as a reach option and pair it with at least 3 safer universities."
    );
  }

  if (profile.cgpa < university.minimumCgpa) {
    actions.push(
      "Highlight projects, research work, internships, and technical depth in SOP."
    );
  }

  if (
    university.preferredEnglishScore > 0 &&
    profile.englishScore < university.preferredEnglishScore
  ) {
    actions.push("Improve English test score before submitting applications.");
  }

  if (profile.testScoreType === "None" || profile.testScore === 0) {
    actions.push(
      "Add GRE/GMAT/IELTS/TOEFL plan to improve prediction confidence."
    );
  }

  actions.push(
    "Prepare university-specific SOP and align it with the target course."
  );
  actions.push("Request strong LORs from faculty or project mentors early.");

  return actions.slice(0, 5);
}

function predictAdmission(
  profile: StudentProfile,
  university: UniversityData
): AdmissionPrediction {
  const academicScore = getAcademicScore(profile, university);
  const testScore = getTestScore(profile, university);
  const profileScore = getProfileScore(profile, university);
  const courseAlignment = getCourseAlignment(profile, university);
  const rankingDifficulty = getRankingDifficulty(university.rankingBand);

  const probability = clamp(
    Math.round(
      academicScore * 0.34 +
        testScore * 0.24 +
        profileScore * 0.22 +
        courseAlignment * 0.14 +
        university.visaFriendliness * 0.06 -
        rankingDifficulty
    )
  );

  const fitLevel = getFitLevel(probability);

  return {
    university,
    probability,
    fitLevel,
    academicScore,
    testScore,
    profileScore,
    competitionRisk: getCompetitionRisk(probability),
    decisionLabel: getDecisionLabel(probability),
    reasons: buildReasons(
      profile,
      university,
      academicScore,
      testScore,
      profileScore
    ),
    gaps: buildGaps(profile, university),
    actionPlan: buildActionPlan(profile, university, fitLevel),
  };
}

export function buildAdmissionEngineResult(
  profile: StudentProfile,
  selectedUniversityId?: string
): AdmissionEngineResult {
  const predictions = UNIVERSITY_DATA.map((university) =>
    predictAdmission(profile, university)
  ).sort((a, b) => b.probability - a.probability);

  const selectedPrediction =
    predictions.find(
      (prediction) => prediction.university.id === selectedUniversityId
    ) ?? predictions[0];

  const safeCount = predictions.filter(
    (item) => item.fitLevel === "Safe"
  ).length;
  const matchCount = predictions.filter(
    (item) => item.fitLevel === "Match"
  ).length;
  const ambitiousCount = predictions.filter(
    (item) => item.fitLevel === "Ambitious"
  ).length;

  const averageProbability = Math.round(
    predictions.reduce((sum, item) => sum + item.probability, 0) /
      predictions.length
  );

  const profileStrength = Math.round(
    (selectedPrediction.academicScore +
      selectedPrediction.testScore +
      selectedPrediction.profileScore +
      profile.profileCompleteness) /
      4
  );

  const aiSummary = `${selectedPrediction.university.name} is currently classified as ${selectedPrediction.fitLevel} with a ${selectedPrediction.probability}% admission probability. The prediction considers CGPA, English/test readiness, course alignment, university competitiveness, country preference, and profile completeness.`;

  const overallAdvice = [
    "Apply with a balanced mix of safe, match, and ambitious universities.",
    "Use ambitious options only if your SOP, LORs, and projects strongly support your profile.",
    "Improve English/test scores before deadlines if the target university expects higher scores.",
    "Finalize documents early because early applications usually reduce avoidable risk.",
  ];

  return {
    predictions,
    selectedPrediction,
    profileStrength,
    averageProbability,
    safeCount,
    matchCount,
    ambitiousCount,
    aiSummary,
    overallAdvice,
  };
}
