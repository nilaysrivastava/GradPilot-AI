"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeIndianRupee,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Loader2,
  MapPin,
  Save,
  Sparkles,
  UserCircle,
  WalletCards,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  countryOptions,
  createDefaultStudentProfile,
  journeyStageOptions,
  normalizeProfile,
  riskPreferenceOptions,
} from "@/lib/profile-utils";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";
import type {
  Country,
  JourneyStage,
  ProfileApiResponse,
  RiskPreference,
  StudentProfile,
} from "@/types";

const steps = [
  {
    id: "personal",
    title: "Personal",
    icon: UserCircle,
  },
  {
    id: "academic",
    title: "Academic",
    icon: GraduationCap,
  },
  {
    id: "goals",
    title: "Goals",
    icon: MapPin,
  },
  {
    id: "finance",
    title: "Finance",
    icon: WalletCards,
  },
];

type StepId = (typeof steps)[number]["id"];

export function ProfileWizard() {
  const session = useAuthStore((state) => state.session);
  const storedProfile = useProfileStore((state) => state.profile);
  const setStoredProfile = useProfileStore((state) => state.setProfile);

  const didInitializeRef = useRef(false);

  const [activeStep, setActiveStep] = useState<StepId>("personal");
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const normalizedProfile = useMemo(() => {
    return profile ? normalizeProfile(profile) : null;
  }, [profile]);

  useEffect(() => {
    if (!session || didInitializeRef.current) return;

    didInitializeRef.current = true;

    const sameUserStoredProfile =
      storedProfile && storedProfile.userId === session.user.id
        ? storedProfile
        : null;

    const initialProfile =
      sameUserStoredProfile ?? createDefaultStudentProfile(session.user);

    const cleanProfile = normalizeProfile(initialProfile);

    setProfile(cleanProfile);
    setStoredProfile(cleanProfile);
    setIsFetching(false);
  }, [session, storedProfile, setStoredProfile]);

  function updateProfile<K extends keyof StudentProfile>(
    key: K,
    value: StudentProfile[K]
  ) {
    setProfile((current) => {
      if (!current) return current;

      return normalizeProfile({
        ...current,
        [key]: value,
      });
    });

    setStatus("");
    setError("");
  }

  function toggleCountry(country: Country) {
    setProfile((current) => {
      if (!current) return current;

      const exists = current.preferredCountries.includes(country);
      const preferredCountries = exists
        ? current.preferredCountries.filter((item) => item !== country)
        : [...current.preferredCountries, country];

      return normalizeProfile({
        ...current,
        preferredCountries,
      });
    });

    setStatus("");
    setError("");
  }

  async function saveProfile() {
    if (!session || !normalizedProfile) return;

    setIsSaving(true);
    setError("");
    setStatus("");

    const profileToSave = normalizeProfile({
      ...normalizedProfile,
      userId: session.user.id,
      email: session.user.email,
    });

    setProfile(profileToSave);
    setStoredProfile(profileToSave);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
          "X-GradPilot-User": JSON.stringify(session.user),
        },
        body: JSON.stringify({
          profile: profileToSave,
        }),
      });

      const data = (await response.json()) as ProfileApiResponse;

      if (response.ok && data.success && data.profile) {
        setProfile(data.profile);
        setStoredProfile(data.profile);
        setStatus("Student Digital Twin saved successfully.");
      } else {
        setStatus("Student Digital Twin saved locally for the prototype.");
      }
    } catch {
      setStatus("Student Digital Twin saved locally for the prototype.");
    } finally {
      setIsSaving(false);
    }
  }

  function goNext() {
    const currentIndex = steps.findIndex((step) => step.id === activeStep);
    const nextStep = steps[currentIndex + 1];

    if (nextStep) {
      setActiveStep(nextStep.id);
    }
  }

  function goBack() {
    const currentIndex = steps.findIndex((step) => step.id === activeStep);
    const previousStep = steps[currentIndex - 1];

    if (previousStep) {
      setActiveStep(previousStep.id);
    }
  }

  if (isFetching || !normalizedProfile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="size-5 animate-spin text-violet-700" />
            Loading your student profile...
          </div>
        </div>
      </div>
    );
  }

  const profileCompleteness = normalizedProfile.profileCompleteness;
  const currentStepIndex = steps.findIndex((step) => step.id === activeStep);
  const isLastStep = activeStep === "finance";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-sm">
        <div className="grid gap-8 p-6 lg:grid-cols-[1fr_0.72fr] lg:p-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
              <Sparkles className="size-4" />
              Student Digital Twin
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Build the profile that powers every{" "}
              <span className="gradient-text">AI decision</span>.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              This profile becomes the intelligence layer for recommendations,
              ROI analysis, admission prediction, timeline planning, AI mentor
              responses, and loan eligibility.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 p-1">
            <div className="h-full rounded-[1.35rem] bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Profile completeness
                  </p>
                  <p className="mt-2 text-4xl font-bold text-slate-950">
                    {profileCompleteness}%
                  </p>
                </div>
                <div className="flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
                  <CheckCircle2 className="size-7" />
                </div>
              </div>

              <Progress value={profileCompleteness} className="mt-5 h-3" />

              <div className="mt-5 rounded-3xl bg-violet-50 p-4">
                <p className="text-sm font-semibold text-violet-700">
                  AI readiness
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  A richer profile gives stronger country fit, ROI, loan, and
                  timeline recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <Alert className="border-red-200 bg-red-50 text-red-700">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {status ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[0.28fr_0.72fr]">
        <Card className="rounded-[2rem] border-violet-100 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-2">
              {steps.map((step, index) => {
                const isActive = step.id === activeStep;
                const isCompleted = index < currentStepIndex;
                const Icon = step.icon;

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition",
                      isActive
                        ? "bg-violet-600 text-white shadow-glow"
                        : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-2xl",
                        isActive
                          ? "bg-white/15 text-white"
                          : isCompleted
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-50 text-slate-500"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="size-5" />
                      ) : (
                        <Icon className="size-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p
                        className={cn(
                          "text-xs",
                          isActive ? "text-violet-100" : "text-slate-400"
                        )}
                      >
                        Step {index + 1} of {steps.length}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-3xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">
                Journey stage
              </p>
              <p className="mt-1 text-sm capitalize text-slate-600">
                {normalizedProfile.journeyStage.replace("-", " ")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-violet-100 shadow-sm">
          <CardContent className="p-6">
            {activeStep === "personal" ? (
              <PersonalStep
                profile={normalizedProfile}
                updateProfile={updateProfile}
              />
            ) : null}

            {activeStep === "academic" ? (
              <AcademicStep
                profile={normalizedProfile}
                updateProfile={updateProfile}
              />
            ) : null}

            {activeStep === "goals" ? (
              <GoalsStep
                profile={normalizedProfile}
                updateProfile={updateProfile}
                toggleCountry={toggleCountry}
              />
            ) : null}

            {activeStep === "finance" ? (
              <FinanceStep
                profile={normalizedProfile}
                updateProfile={updateProfile}
              />
            ) : null}

            <div className="mt-8 flex flex-col justify-between gap-3 border-t border-violet-100 pt-6 sm:flex-row">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={currentStepIndex === 0}
                  className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                >
                  Back
                </Button>

                {!isLastStep ? (
                  <Button
                    type="button"
                    onClick={goNext}
                    className="rounded-2xl shadow-glow"
                  >
                    Next
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                ) : null}
              </div>

              <Button
                type="button"
                onClick={saveProfile}
                disabled={isSaving}
                className="rounded-2xl shadow-glow"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Save Digital Twin
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function PersonalStep({
  profile,
  updateProfile,
}: {
  profile: StudentProfile;
  updateProfile: <K extends keyof StudentProfile>(
    key: K,
    value: StudentProfile[K]
  ) => void;
}) {
  return (
    <div>
      <StepHeader
        icon={<UserCircle className="size-6" />}
        title="Personal information"
        description="Basic student details used for profile identity and personalized communication."
      />

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <TextField
          label="Full name"
          value={profile.name}
          onChange={(value) => updateProfile("name", value)}
        />
        <TextField
          label="Email"
          value={profile.email}
          onChange={(value) => updateProfile("email", value)}
        />
        <TextField
          label="Phone"
          value={profile.phone}
          onChange={(value) => updateProfile("phone", value)}
          placeholder="+91 98765 43210"
        />
        <TextField
          label="City"
          value={profile.city}
          onChange={(value) => updateProfile("city", value)}
          placeholder="Gwalior"
        />
      </div>
    </div>
  );
}

function AcademicStep({
  profile,
  updateProfile,
}: {
  profile: StudentProfile;
  updateProfile: <K extends keyof StudentProfile>(
    key: K,
    value: StudentProfile[K]
  ) => void;
}) {
  return (
    <div>
      <StepHeader
        icon={<GraduationCap className="size-6" />}
        title="Academic background"
        description="Academic strength helps estimate admission probability and university fit."
      />

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <TextField
          label="Current degree"
          value={profile.currentDegree}
          onChange={(value) => updateProfile("currentDegree", value)}
          placeholder="Integrated M.Tech / B.Tech / B.Sc"
        />
        <TextField
          label="Current institution"
          value={profile.currentInstitution}
          onChange={(value) => updateProfile("currentInstitution", value)}
          placeholder="IIITM Gwalior"
        />
        <TextField
          label="Graduation year"
          value={String(profile.graduationYear || "")}
          onChange={(value) =>
            updateProfile("graduationYear", value ? Number(value) : 0)
          }
          placeholder="2026"
        />
        <NumberField
          label="CGPA"
          value={profile.cgpa}
          min={0}
          max={10}
          step={0.1}
          onChange={(value) => updateProfile("cgpa", value)}
        />
        <NumberField
          label="Backlogs"
          value={profile.backlogs}
          min={0}
          max={20}
          onChange={(value) => updateProfile("backlogs", value)}
        />
        <NumberField
          label="Work experience months"
          value={profile.workExperienceMonths}
          min={0}
          max={120}
          onChange={(value) => updateProfile("workExperienceMonths", value)}
        />
      </div>
    </div>
  );
}

function GoalsStep({
  profile,
  updateProfile,
  toggleCountry,
}: {
  profile: StudentProfile;
  updateProfile: <K extends keyof StudentProfile>(
    key: K,
    value: StudentProfile[K]
  ) => void;
  toggleCountry: (country: Country) => void;
}) {
  return (
    <div>
      <StepHeader
        icon={<BookOpen className="size-6" />}
        title="Study goals"
        description="Target countries, course, intake, test scores, and journey stage shape the AI roadmap."
      />

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <TextField
          label="Target course"
          value={profile.targetCourse}
          onChange={(value) => updateProfile("targetCourse", value)}
          placeholder="MS in Computer Science"
        />
        <TextField
          label="Target intake"
          value={profile.targetIntake}
          onChange={(value) => updateProfile("targetIntake", value)}
          placeholder="Fall 2026"
        />

        <div className="space-y-2">
          <Label>Test type</Label>
          <Select
            value={profile.testScoreType}
            onValueChange={(value) =>
              updateProfile(
                "testScoreType",
                value as StudentProfile["testScoreType"]
              )
            }
          >
            <SelectTrigger className="h-12 rounded-2xl">
              <SelectValue placeholder="Select test" />
            </SelectTrigger>
            <SelectContent>
              {["GRE", "GMAT", "IELTS", "TOEFL", "None"].map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <NumberField
          label="Test score"
          value={profile.testScore}
          min={0}
          max={340}
          onChange={(value) => updateProfile("testScore", value)}
        />

        <NumberField
          label="English score / IELTS equivalent"
          value={profile.englishScore}
          min={0}
          max={9}
          step={0.5}
          onChange={(value) => updateProfile("englishScore", value)}
        />

        <div className="space-y-2">
          <Label>Journey stage</Label>
          <Select
            value={profile.journeyStage}
            onValueChange={(value) =>
              updateProfile("journeyStage", value as JourneyStage)
            }
          >
            <SelectTrigger className="h-12 rounded-2xl">
              <SelectValue placeholder="Select journey stage" />
            </SelectTrigger>
            <SelectContent>
              {journeyStageOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Label>Preferred countries</Label>
        <div className="flex flex-wrap gap-3">
          {countryOptions.map((country) => {
            const selected = profile.preferredCountries.includes(country);

            return (
              <button
                type="button"
                key={country}
                onClick={() => toggleCountry(country)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  selected
                    ? "border-violet-600 bg-violet-600 text-white shadow-glow"
                    : "border-violet-100 bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                )}
              >
                {country}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FinanceStep({
  profile,
  updateProfile,
}: {
  profile: StudentProfile;
  updateProfile: <K extends keyof StudentProfile>(
    key: K,
    value: StudentProfile[K]
  ) => void;
}) {
  return (
    <div>
      <StepHeader
        icon={<BadgeIndianRupee className="size-6" />}
        title="Finance and loan readiness"
        description="Financing details help estimate affordability, EMI pressure, eligibility, and conversion readiness."
      />

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <NumberField
          label="Budget in lakhs"
          value={profile.budgetLakhs}
          min={0}
          max={200}
          onChange={(value) => updateProfile("budgetLakhs", value)}
        />
        <NumberField
          label="Family income in lakhs/year"
          value={profile.familyIncomeLakhs}
          min={0}
          max={200}
          onChange={(value) => updateProfile("familyIncomeLakhs", value)}
        />
        <NumberField
          label="Expected loan amount in lakhs"
          value={profile.expectedLoanAmountLakhs}
          min={0}
          max={200}
          onChange={(value) => updateProfile("expectedLoanAmountLakhs", value)}
        />

        <div className="space-y-2">
          <Label>Risk preference</Label>
          <Select
            value={profile.riskPreference}
            onValueChange={(value) =>
              updateProfile("riskPreference", value as RiskPreference)
            }
          >
            <SelectTrigger className="h-12 rounded-2xl">
              <SelectValue placeholder="Select risk preference" />
            </SelectTrigger>
            <SelectContent>
              {riskPreferenceOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ToggleCard
          label="Needs education loan"
          description="Turn this on if the student needs financing support."
          active={profile.needsLoan}
          onClick={() => updateProfile("needsLoan", !profile.needsLoan)}
        />
        <ToggleCard
          label="Has co-applicant"
          description="A co-applicant can improve loan eligibility confidence."
          active={profile.hasCoApplicant}
          onClick={() =>
            updateProfile("hasCoApplicant", !profile.hasCoApplicant)
          }
        />
      </div>
    </div>
  );
}

function StepHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
        {icon}
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-2xl"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        value={Number.isNaN(value) ? "" : value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-12 rounded-2xl"
      />
    </div>
  );
}

function ToggleCard({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-3xl border p-5 text-left transition",
        active
          ? "border-violet-600 bg-violet-50"
          : "border-violet-100 bg-white hover:bg-violet-50"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-950">{label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <Badge
          className={cn(
            "rounded-full",
            active
              ? "bg-violet-600 text-white hover:bg-violet-600"
              : "bg-slate-100 text-slate-600 hover:bg-slate-100"
          )}
        >
          {active ? "Yes" : "No"}
        </Badge>
      </div>
    </button>
  );
}
