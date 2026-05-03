"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserCircle,
} from "lucide-react";

import { GlobalTopbar } from "@/components/layout/global-topbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthSession } from "@/types";

type AuthApiResponse = {
  success: boolean;
  message: string;
  session?: AuthSession;
};

function createLocalSignupSession(name: string, email: string): AuthSession {
  return {
    token: `signup-token-${Date.now()}`,
    user: {
      id: `user-${Date.now()}`,
      name,
      email,
    },
  } as AuthSession;
}

export default function SignupPage() {
  const router = useRouter();
  const { session, login } = useAuthStore();

  const [name, setName] = useState("Shreya");
  const [email, setEmail] = useState("shreya@gradpilot.ai");
  const [password, setPassword] = useState("gradpilot123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      setError("Please fill all fields.");
      setIsLoading(false);
      return;
    }

    if (cleanPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      const data = (await response.json()) as AuthApiResponse;

      if (response.ok && data.success && data.session) {
        login(data.session);
        router.push("/profile");
        return;
      }

      const fallbackSession = createLocalSignupSession(cleanName, cleanEmail);
      login(fallbackSession);
      router.push("/profile");
    } catch {
      const fallbackSession = createLocalSignupSession(cleanName, cleanEmail);
      login(fallbackSession);
      router.push("/profile");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.16),transparent_35%),linear-gradient(135deg,#ffffff,#f8fbff)]">
      <GlobalTopbar pageTitle="Create Account" />

      <main className="flex min-h-[calc(100vh-5rem)] w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full max-w-[430px] rounded-[2rem] border border-violet-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
            <UserCircle className="size-6" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Create your account
          </h1>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
            Start your personalized higher studies and education financing
            journey.
          </p>

          {error ? (
            <Alert className="mt-5 border-red-200 bg-red-50 text-red-700">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="space-y-2">
              <Label>Full name</Label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-12 rounded-2xl pl-11"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 rounded-2xl pl-11"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 rounded-2xl pl-11 pr-11"
                  placeholder="Minimum 6 characters"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-700"
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
              className="h-12 w-full rounded-2xl shadow-glow"
            >
              {isLoading ? "Creating account..." : "Create account"}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-violet-700">
              Login
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}