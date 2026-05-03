export type Country =
  | "USA"
  | "UK"
  | "Canada"
  | "Germany"
  | "Australia"
  | "India";

export type FitLevel = "Safe" | "Match" | "Ambitious";

export type RiskPreference = "Conservative" | "Balanced" | "Aggressive";

export type TestScoreType = "None" | "GRE" | "GMAT" | "IELTS" | "TOEFL";

export type JourneyStage =
  | "exploring"
  | "shortlisting"
  | "test-prep"
  | "applying"
  | "loan-planning"
  | "visa"
  | "converted";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type AuthApiResponse = {
  success: boolean;
  message: string;
  session?: AuthSession;
};

export type StudentProfile = {
  id: string;
  userId: string;

  name: string;
  email: string;
  phone: string;
  city: string;

  currentInstitution: string;
  currentDegree: string;
  graduationYear: number;

  cgpa: number;
  backlogs: number;
  workExperienceMonths: number;

  targetCourse: string;
  targetIntake: string;
  preferredCountries: Country[];

  testScoreType: TestScoreType;
  testScore: number;
  englishScore: number;

  budgetLakhs: number;
  familyIncomeLakhs: number;
  needsLoan: boolean;
  expectedLoanAmountLakhs: number;
  hasCoApplicant: boolean;

  riskPreference: RiskPreference;
  journeyStage: JourneyStage;

  profileCompleteness: number;
  updatedAt: string;
};

export type ProfileApiResponse = {
  success: boolean;
  message: string;
  profile?: StudentProfile;
};
