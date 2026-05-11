"use client";

import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  buildMentorReply,
  buildSuggestedPrompts,
  type MentorAction,
  type MentorMetric,
  type MentorReply,
} from "@/lib/mentor-engine";
import { useProfileStore } from "@/store/useProfileStore";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: MentorReply["intent"];
  confidence?: number;
  actions?: MentorAction[];
  metrics?: MentorMetric[];
  suggestedFollowUps?: string[];
};

type MentorApiResponse = {
  success: boolean;
  message: string;
  reply?: MentorReply;
};

export default function MentorPage() {
  const profile = useProfileStore((state) => state.profile);

  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const suggestedPrompts = useMemo(() => {
    return profile ? buildSuggestedPrompts(profile) : [];
  }, [profile]);

  const initialAssistantMessage: ChatMessage | null = useMemo(() => {
    if (!profile) return null;

    return {
      id: "initial-ai-message",
      role: "assistant",
      content: `Hi ${
        profile.name || "there"
      }! I’m your GradPilot AI Mentor. I can help you compare countries, understand ROI, predict admission chances, plan your application timeline, and think through education loan readiness using your Digital Twin.`,
      intent: "general",
      confidence: 90,
      actions: [
        { label: "Open Decision Hub", href: "/decision-hub" },
        { label: "Open Timeline", href: "/timeline" },
      ],
      metrics: [
        { label: "Profile", value: `${profile.profileCompleteness}%` },
        { label: "Target", value: profile.targetCourse },
        { label: "Budget", value: `₹${profile.budgetLakhs}L` },
      ],
      suggestedFollowUps: suggestedPrompts.slice(0, 3),
    };
  }, [profile, suggestedPrompts]);

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initialAssistantMessage ? [initialAssistantMessage] : []
  );

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  function scrollToBottom() {
    setTimeout(() => {
      scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  async function sendMessage(messageText?: string) {
    if (!profile) return;

    const cleanMessage = (messageText ?? input).trim();

    if (!cleanMessage) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: cleanMessage,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);
    setStatus("");
    scrollToBottom();

    try {
      const response = await fetch("/api/mentor", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          message: cleanMessage,
        }),
      });

      const data = (await response.json()) as MentorApiResponse;

      let reply: MentorReply;

      if (response.ok && data.success && data.reply) {
        reply = data.reply;
        setStatus("AI Mentor responded using backend logic.");
      } else {
        reply = buildMentorReply(profile, cleanMessage);
        setStatus("AI Mentor responded locally for the prototype.");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply.answer,
        intent: reply.intent,
        confidence: reply.confidence,
        actions: reply.actions,
        metrics: reply.metrics,
        suggestedFollowUps: reply.suggestedFollowUps,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch {
      const reply = buildMentorReply(profile, cleanMessage);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply.answer,
        intent: reply.intent,
        confidence: reply.confidence,
        actions: reply.actions,
        metrics: reply.metrics,
        suggestedFollowUps: reply.suggestedFollowUps,
      };

      setMessages((current) => [...current, assistantMessage]);
      setStatus("AI Mentor responded locally for the prototype.");
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  if (!profile) {
    return (
      <AppShell>
        <section className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
            <Bot className="size-7" />
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Build your <span className="gradient-text">Digital Twin</span>{" "}
            first.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            The AI Mentor needs your profile before it can answer using your
            country, course, budget, admission, ROI, and loan context.
          </p>

          <Button asChild className="mt-8 rounded-2xl shadow-glow">
            <Link href="/profile">
              Complete Digital Twin
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-sm">
          <div className="grid gap-8 p-6 xl:grid-cols-[1fr_0.72fr] xl:p-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                <Sparkles className="size-4" />
                Conversational AI Mentor
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Ask anything about your{" "}
                <span className="gradient-text">study and loan journey</span>.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                The mentor uses your Digital Twin to answer questions about
                countries, universities, ROI, admission chances, timelines,
                SOP/LORs, visa planning, and education loans.
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 p-1">
              <div className="h-full rounded-[1.35rem] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Mentor context
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {profile.targetCourse}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {profile.preferredCountries.join(", ")}
                    </p>
                  </div>

                  <div className="flex size-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
                    <Brain className="size-7" />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600">
                      Digital Twin completeness
                    </p>
                    <p className="text-sm font-bold text-violet-700">
                      {profile.profileCompleteness}%
                    </p>
                  </div>
                  <Progress
                    value={profile.profileCompleteness}
                    className="h-3"
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MiniMetric label="CGPA" value={String(profile.cgpa)} />
                  <MiniMetric
                    label="Budget"
                    value={`₹${profile.budgetLakhs}L`}
                  />
                  <MiniMetric
                    label="Loan"
                    value={
                      profile.needsLoan
                        ? `₹${profile.expectedLoanAmountLakhs}L`
                        : "No"
                    }
                  />
                  <MiniMetric
                    label="Stage"
                    value={profile.journeyStage.replace("-", " ")}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {status ? (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <Bot className="size-6" />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Suggested Prompts
              </p>

              <div className="mt-5 space-y-3">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    disabled={isSending}
                    className="w-full rounded-2xl border border-violet-100 bg-slate-50 px-4 py-3 text-left text-sm leading-6 text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 disabled:opacity-60"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-violet-100 bg-slate-950 p-6 text-white shadow-sm">
              
              <p className="mt-3 text-sm leading-6 text-slate-300">
                This chatbot is not generic. It pulls from the same profile,
                ROI, admission, timeline, and decision engines used across the
                product, so every answer is personalized.
              </p>
            </div>
          </aside>

          <div className="flex min-h-[720px] flex-col rounded-[2rem] border border-violet-100 bg-white shadow-sm">
            <div className="border-b border-violet-100 p-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarFallback className="bg-violet-100 text-violet-700">
                    <Bot className="size-5" />
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-semibold text-slate-950">
                    GradPilot AI Mentor
                  </p>
                  <p className="text-sm text-slate-500">
                    Profile-aware study abroad and loan copilot
                  </p>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-slate-50/70 p-5">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}

              {isSending ? (
                <div className="flex items-center gap-3 rounded-3xl border border-violet-100 bg-white p-4 text-sm text-slate-600 shadow-sm">
                  <Loader2 className="size-4 animate-spin text-violet-700" />
                  GradPilot Mentor is thinking...
                </div>
              ) : null}

              <div ref={scrollAnchorRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-violet-100 bg-white p-5"
            >
              <div className="flex gap-3">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask: Should I choose Canada or Germany? Is my EMI manageable? Which universities are safe for me?"
                  className="min-h-12 flex-1 resize-none rounded-2xl"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                />

                <Button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="h-12 rounded-2xl px-5 shadow-glow"
                >
                  {isSending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Press Enter to send. Use Shift + Enter for a new line.
              </p>
            </form>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-[1.5rem] bg-violet-600 px-5 py-4 text-white shadow-sm">
          <p className="whitespace-pre-line text-sm leading-6">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] rounded-[1.5rem] border border-violet-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
            {message.intent ?? "mentor"}
          </Badge>

          {message.confidence ? (
            <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              {message.confidence}% confidence
            </Badge>
          ) : null}
        </div>

        <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
          {message.content}
        </p>

        {message.metrics && message.metrics.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {message.metrics.map((metric) => (
              <MiniMetric
                key={`${metric.label}-${metric.value}`}
                label={metric.label}
                value={metric.value}
              />
            ))}
          </div>
        ) : null}

        {message.actions && message.actions.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {message.actions.map((action) => (
              <Button
                key={action.href}
                asChild
                variant="outline"
                className="rounded-2xl border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
              >
                <Link href={action.href}>
                  {action.label}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            ))}
          </div>
        ) : null}

        {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 ? (
          <div className="mt-5 rounded-3xl bg-violet-50 p-4">
            <p className="mb-3 text-sm font-semibold text-violet-700">
              Good follow-up questions
            </p>
            <div className="space-y-2">
              {message.suggestedFollowUps.map((item) => (
                <div key={item} className="flex gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-violet-50 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 line-clamp-2 text-sm font-bold capitalize text-slate-950">
        {value}
      </p>
    </div>
  );
}
