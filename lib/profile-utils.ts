import type {
  AuthUser,
  Country,
  JourneyStage,
  RiskPreference,
  StudentProfile,
} from "@/types";

export const countryOptions: Country[] = [
  "USA",
  "Canada",
  "UK",
  "Germany",
  "Australia",
  "India",
];

export const journeyStageOptions: {
  label: string;
  value: JourneyStage;
}[] = [
  { label: "Exploring options", value: "exploring" },
  { label: "Shortlisting universities", value: "shortlisting" },
  { label: "Preparing for tests", value: "test-prep" },
  { label: "Applications in progress", value: "applying" },
  { label: "Planning education loan", value: "loan-planning" },
  { label: "Visa process", value: "visa" },
];

export const riskPreferenceOptions: RiskPreference[] = [
  "Conservative",
  "Balanced",
  "Aggressive",
];

export function createDefaultStudentProfile(user: AuthUser): StudentProfile {
  return {
    id: `profile-${user.id}`,
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: "",
    city: "",

    currentDegree: "",
    currentInstitution: "",
    graduationYear: 2026,
    cgpa: 7.5,
    backlogs: 0,

    targetCourse: "MS in Computer Science",
    targetIntake: "Fall 2026",
    preferredCountries: ["Canada", "Germany", "USA"],

    testScoreType: "IELTS",
    testScore: 0,
    englishScore: 7,
    workExperienceMonths: 0,

    budgetLakhs: 35,
    familyIncomeLakhs: 12,
    needsLoan: true,
    expectedLoanAmountLakhs: 30,
    hasCoApplicant: true,

    riskPreference: "Balanced",
    journeyStage: "exploring",

    profileCompleteness: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function calculateProfileCompleteness(profile: StudentProfile): number {
  const checks = [
    Boolean(profile.name.trim()),
    Boolean(profile.email.trim()),
    Boolean(profile.phone.trim()),
    Boolean(profile.city.trim()),

    Boolean(profile.currentDegree.trim()),
    Boolean(profile.currentInstitution.trim()),
    profile.graduationYear > 0,
    profile.cgpa > 0,

    Boolean(profile.targetCourse.trim()),
    Boolean(profile.targetIntake.trim()),
    profile.preferredCountries.length > 0,

    Boolean(profile.testScoreType),
    profile.testScoreType === "None" || profile.testScore > 0,
    profile.englishScore > 0,

    profile.budgetLakhs > 0,
    profile.familyIncomeLakhs > 0,
    profile.needsLoan ? profile.expectedLoanAmountLakhs > 0 : true,

    Boolean(profile.riskPreference),
    Boolean(profile.journeyStage),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export function normalizeProfile(profile: StudentProfile): StudentProfile {
  return {
    ...profile,
    cgpa: Number(profile.cgpa) || 0,
    backlogs: Number(profile.backlogs) || 0,
    testScore: Number(profile.testScore) || 0,
    englishScore: Number(profile.englishScore) || 0,
    workExperienceMonths: Number(profile.workExperienceMonths) || 0,
    budgetLakhs: Number(profile.budgetLakhs) || 0,
    familyIncomeLakhs: Number(profile.familyIncomeLakhs) || 0,
    expectedLoanAmountLakhs: Number(profile.expectedLoanAmountLakhs) || 0,
    profileCompleteness: calculateProfileCompleteness(profile),
    updatedAt: new Date().toISOString(),
  };
}
