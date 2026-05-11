"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Sparkles,
  User,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthApiResponse } from "@/types";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState(isSignup ? "" : "nilay@gradpilot.ai");
  const [password, setPassword] = useState(isSignup ? "" : "gradpilot123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        isSignup ? "/api/auth/signup" : "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isSignup
              ? {
                  name,
                  email,
                  password,
                }
              : {
                  email,
                  password,
                }
          ),
        }
      );

      const data = (await response.json()) as AuthApiResponse;

      if (!response.ok || !data.success || !data.session) {
        throw new Error(data.message || "Authentication failed.");
      }

      setSession(data.session);
      router.push("/dashboard");
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-[radial-gradient(circle_at_top_left,#ede9fe_0,#f8fafc_34%,#ffffff_72%)] lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden border-r border-violet-100 bg-white/60 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-glow">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-950">GradPilot AI</p>
            <p className="-mt-1 text-xs font-medium text-slate-500">
              Study. Decide. Finance.
            </p>
          </div>
        </Link>

        <div>
          <div className="mb-6 inline-flex rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            AI-first student ecosystem
          </div>

          <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-slate-950">
            One login for your full{" "}
            <span className="gradient-text">study and loan journey</span>.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Build your student profile once. GradPilot then personalizes
            recommendations, ROI, timelines, admission chances, AI nudges, and
            loan readiness around you.
          </p>

          <div className="mt-8 grid max-w-xl gap-4">
            <AuthFeature
              title="Personalized decision intelligence"
              description="Country, university, ROI, and admission insights linked to your profile."
            />
            <AuthFeature
              title="Financing-aware journey"
              description="Loan eligibility, EMI planning, and documents are connected early."
            />
            <AuthFeature
              title="AI mentor support"
              description="Ask doubts anytime and receive context-aware guidance."
            />
          </div>
        </div>

        <p className="text-sm text-slate-500">
          Built for TenzorX 2026 National AI Hackathon.
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-glow">
                <Sparkles className="size-5" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-slate-950">GradPilot AI</p>
                <p className="-mt-1 text-xs font-medium text-slate-500">
                  Study. Decide. Finance.
                </p>
              </div>
            </Link>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="mb-7">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                {isSignup ? (
                  <User className="size-5" />
                ) : (
                  <LockKeyhole className="size-5" />
                )}
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                {isSignup ? "Create your account" : "Welcome back"}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isSignup
                  ? "Start by creating your GradPilot student account."
                  : "Login to continue your personalized study and financing journey."}
              </p>
            </div>

            {error ? (
              <Alert className="mb-5 border-red-200 bg-red-50 text-red-700">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignup ? (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Enter your name"
                      className="h-12 rounded-2xl pl-10"
                      required
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-12 rounded-2xl pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 6 characters"
                    className="h-12 rounded-2xl pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-2xl text-base shadow-glow"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  <>
                    {isSignup ? "Create account" : "Login"}
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-violet-700 hover:text-violet-800"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <>
                  New to GradPilot?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-violet-700 hover:text-violet-800"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>

            {!isSignup ? (
              <div className="mt-6 rounded-3xl bg-violet-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-violet-700">Demo login</p>
                <p className="mt-1">Email: nilay@gradpilot.ai</p>
                <p>Password: gradpilot123</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function AuthFeature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <ArrowRight className="size-4" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
