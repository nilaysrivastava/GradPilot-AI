import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  Bot,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Compass,
  FileCheck2,
  Gauge,
  GraduationCap,
  Landmark,
  LineChart,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/landing/feature-card";
import { MetricCard } from "@/components/landing/metric-card";
import { ProcessStep } from "@/components/landing/process-step";
import { GlobalTopbar } from "@/components/layout/global-topbar";

const problemCards = [
  {
    title: "Scattered Information",
    description:
      "Students compare universities, courses, costs, visas, and loans across too many disconnected platforms.",
  },
  {
    title: "No ROI Clarity",
    description:
      "Most students know the tuition cost but not the long-term salary outcome, payback period, or financial risk.",
  },
  {
    title: "Loan Decisions in the Dark",
    description:
      "Financing is usually handled at the end, instead of being connected to profile strength and career outcomes.",
  },
  {
    title: "Generic Guidance",
    description:
      "One-size-fits-all counselling does not work for different budgets, countries, scores, goals, and risk levels.",
  },
];

const aiTools = [
  {
    icon: Compass,
    title: "AI Career Navigator",
    description:
      "Suggests best-fit countries, universities, and courses using profile, budget, goals, and risk preference.",
    tag: "Discovery",
  },
  {
    icon: LineChart,
    title: "ROI Calculator",
    description:
      "Compares total study cost with expected salary, break-even period, EMI load, and future affordability.",
    tag: "Finance",
  },
  {
    icon: GraduationCap,
    title: "Admission Predictor",
    description:
      "Predicts admission probability and classifies universities as safe, match, or ambitious.",
    tag: "Predictive",
  },
  {
    icon: CalendarCheck,
    title: "Timeline Generator",
    description:
      "Creates a personalized application roadmap for exams, SOPs, LORs, deadlines, visa, and loans.",
    tag: "Planning",
  },
  {
    icon: Bot,
    title: "Conversational Mentor",
    description:
      "Answers study-abroad and financing doubts using the student's profile and journey stage.",
    tag: "LLM",
  },
  {
    icon: Megaphone,
    title: "AI Growth Engine",
    description:
      "Generates personalized nudges, content loops, engagement streaks, and referral triggers.",
    tag: "Growth",
  },
];

const impactMetrics = [
  {
    value: "3.5X",
    label: "Higher Engagement",
    description: "Students explore more options and make decisions faster.",
  },
  {
    value: "2X",
    label: "Better Conversion",
    description: "A clearer path from exploration to loan application.",
  },
  {
    value: "65%",
    label: "Faster Decisions",
    description: "AI-powered clarity reduces confusion and delay.",
  },
  {
    value: "4.8/5",
    label: "Student Satisfaction",
    description: "Personalized guidance builds trust and confidence.",
  },
];

export default function HomePage() {
  return (
    <main className="page-shell min-h-screen overflow-hidden">
      <GlobalTopbar pageTitle="Home" />

      <section className="relative px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pb-28 lg:pt-40">
        <div className="container-xl relative">
          <div className="absolute -right-20 top-0 hidden size-72 rounded-full bg-violet-200/40 blur-3xl lg:block" />
          <div className="absolute -left-20 top-40 hidden size-72 rounded-full bg-blue-200/40 blur-3xl lg:block" />

          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
                <Sparkles className="size-4" />
                Unified Student Engagement Ecosystem
              </div>

              <h1 className="max-w-5xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Your{" "}
                <span className="gradient-text">
                  study abroad and loan copilot
                </span>
                .
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                GradPilot AI helps Indian students discover universities,
                compare ROI, predict admission chances, plan applications, and
                move smoothly toward education financing in one intelligent
                journey.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-12 rounded-2xl px-6 text-base shadow-glow"
                >
                  <Link href="/signup">
                    Start Your Journey
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-2xl border-violet-200 bg-white px-6 text-base text-violet-700 hover:bg-violet-50"
                >
                  <a href="#platform">Explore Platform</a>
                </Button>
              </div>

              <div className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
                <HeroStat value="12L+" label="Indian students abroad/year" />
                <HeroStat value="70%" label="Feel unprepared" />
                <HeroStat value="₹3L+" label="Loss per wrong decision" />
              </div>
            </div>

            <div className="relative z-10">
              <div className="glass-card rounded-[2rem] p-4 shadow-soft">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 p-1">
                  <div className="rounded-[1.35rem] bg-white p-6">
                    <div className="mb-6 flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-violet-700">
                          AI Decision Intelligence
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                          Student Command Center
                        </h2>
                      </div>
                      <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                        <Brain className="size-6" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <DashboardPreviewCard
                        icon={Compass}
                        title="Best-fit country"
                        value="Canada"
                        note="High affordability + strong PR pathway"
                        score="91%"
                      />
                      <DashboardPreviewCard
                        icon={LineChart}
                        title="Projected ROI"
                        value="2.8 years"
                        note="Estimated break-even period"
                        score="High"
                      />
                      <DashboardPreviewCard
                        icon={Landmark}
                        title="Loan eligibility"
                        value="₹42L"
                        note="Based on profile and repayment capacity"
                        score="82%"
                      />
                    </div>

                    <div className="mt-6 rounded-3xl bg-violet-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-white p-2 text-violet-700 shadow-sm">
                          <Bot className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            AI Mentor Nudge
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Your profile is strong for Canada and Germany.
                            Complete IELTS planning this week to improve your
                            admission readiness.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -left-6 hidden rounded-3xl border border-violet-100 bg-white p-4 shadow-soft sm:block">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Journey clarity improved
                    </p>
                    <p className="text-xs text-slate-500">
                      8 tasks generated automatically
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="platform" className="pt-24">
            <div className="grid gap-4 md:grid-cols-4">
              <ProcessStep
                step="01"
                title="Discover & Plan"
                description="Get personalized country, university, and course recommendations."
              />
              <ProcessStep
                step="02"
                title="Analyze & Decide"
                description="Compare ROI, risks, admission chances, and what-if scenarios."
              />
              <ProcessStep
                step="03"
                title="Plan & Finance"
                description="Check eligibility, calculate EMI, compare offers, and prepare documents."
              />
              <ProcessStep
                step="04"
                title="Succeed"
                description="Track progress, receive AI nudges, and stay on top of every step."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white" id="problem">
        <div className="container-xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-semibold text-violet-700">The Real Problem</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Students do not lack potential. They lack a personal guide.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              The journey from university discovery to education financing is
              fragmented, stressful, and high-risk. GradPilot AI connects the
              entire funnel.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {problemCards.map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-slate-100 bg-slate-50/70 p-6"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm">
                  <Target className="size-5" />
                </div>
                <h3 className="font-semibold text-slate-950">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding muted-gradient" id="ai-tools">
        <div className="container-xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="font-semibold text-violet-700">AI Services Layer</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Intelligent tools that attract, engage, and build trust.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              We turn conversations into clarity, data into decisions, and
              doubts into confidence using LLM guidance, predictive scoring, and
              personalized automation.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {aiTools.map((tool) => (
              <FeatureCard
                key={tool.title}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                tag={tool.tag}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white" id="loan-engine">
        <div className="container-xl grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="font-semibold text-violet-700">Loan Engine</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Smart financing options based on profile, ROI, and affordability.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Instead of showing loans at the end, GradPilot connects financing
              to career outcomes, university choice, repayment scenarios, and
              document readiness.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <LoanPoint
                icon={WalletCards}
                title="Eligibility Estimator"
                description="Estimate eligible amount and approval confidence."
              />
              <LoanPoint
                icon={BadgeIndianRupee}
                title="EMI Planner"
                description="Compare repayment plans before applying."
              />
              <LoanPoint
                icon={FileCheck2}
                title="Smart Checklist"
                description="Generate country and lender-specific documents."
              />
              <LoanPoint
                icon={ShieldCheck}
                title="Application Flow"
                description="Move from awareness to loan application smoothly."
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-violet-50/60 p-4 shadow-soft">
            <div className="rounded-[1.5rem] bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Personalized Loan Snapshot
                  </p>
                  <h3 className="text-2xl font-semibold text-slate-950">
                    Education Finance Readiness
                  </h3>
                </div>
                <Landmark className="size-7 text-violet-700" />
              </div>

              <div className="grid gap-4">
                <FinanceRow label="Eligible loan estimate" value="₹42,00,000" />
                <FinanceRow label="Approval confidence" value="82%" />
                <FinanceRow label="Estimated EMI" value="₹48,300/month" />
                <FinanceRow label="Document readiness" value="7/10 complete" />
              </div>

              <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
                <div className="flex items-start gap-4">
                  <Gauge className="mt-1 size-6 text-violet-300" />
                  <div>
                    <p className="font-semibold">AI Recommendation</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Your ROI is strong, but approval confidence improves if
                      you add co-applicant income and finalize university offer
                      proof.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding muted-gradient" id="impact">
        <div className="container-xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-semibold text-violet-700">Business Impact</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Turning guidance into growth and decisions into dreams.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              The platform is designed to drive awareness, engagement, trust,
              and finally loan conversion.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {impactMetrics.map((metric) => (
              <MetricCard
                key={metric.label}
                value={metric.value}
                label={metric.label}
                description={metric.description}
              />
            ))}
          </div>

          <div className="mt-12 rounded-[2rem] border border-violet-100 bg-white p-6 shadow-soft lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="font-semibold text-violet-700">
                  Monetization Model
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  Built for scalable student engagement and loan lead
                  generation.
                </h3>
                <p className="mt-4 leading-7 text-slate-600">
                  GradPilot can monetize through approved loan leads, premium
                  subscriptions, and university partnerships while improving
                  student decision quality.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <RevenueCard
                  title="Loan Leads"
                  value="₹5K–₹15K"
                  description="Per approved education loan."
                />
                <RevenueCard
                  title="Premium Tools"
                  value="₹999+"
                  description="Advanced analytics and planning."
                />
                <RevenueCard
                  title="Scale Case"
                  value="₹5 Cr/mo"
                  description="At 1L users and 5% conversion."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-slate-950">
        <div className="container-xl">
          <div className="rounded-[2rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 p-8 text-center shadow-glow sm:p-12">
            <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-white/15 text-white">
              <Sparkles className="size-7" />
            </div>
            <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              One platform. Every decision. Seamlessly connected.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-violet-100">
              From chatting with AI to applying for loans, GradPilot AI creates
              a complete student journey.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="container-xl flex flex-col justify-between gap-4 text-sm text-slate-500 md:flex-row md:items-center">
          <p>© 2026 GradPilot AI. Built with love 💜 by Team_Scoobaa.</p>
          <div className="flex gap-5">
            <a href="#platform" className="hover:text-violet-700">
              Platform
            </a>
            <a href="#ai-tools" className="hover:text-violet-700">
              AI Tools
            </a>
            <a href="#loan-engine" className="hover:text-violet-700">
              Loan Engine
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-white/80 p-4 shadow-sm backdrop-blur">
      <p className="text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{label}</p>
    </div>
  );
}

function DashboardPreviewCard({
  icon: Icon,
  title,
  value,
  note,
  score,
}: {
  icon: typeof Compass;
  title: string;
  value: string;
  note: string;
  score: string;
}) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <Icon className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{note}</p>
        </div>

        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          {score}
        </div>
      </div>
    </div>
  );
}

function LoanPoint({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof WalletCards;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
        <Icon className="size-5" />
      </div>
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function FinanceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function RevenueCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl bg-violet-50 p-5">
      <BarChart3 className="size-5 text-violet-700" />
      <p className="mt-4 text-sm font-semibold text-slate-600">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}
