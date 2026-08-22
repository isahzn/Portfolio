"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconRefresh } from "@/components/ui/icons";

const LEAD_NAME = "Sarah Wilson";
const LEAD_COMPANY = "ABC Accounting";
const LEAD_EMAIL = "sarah@abcaccounting.com";

const qualificationQuestions = [
  {
    key: "businessType",
    question: "What type of business are you?",
    options: ["Accounting", "Legal", "E-commerce", "Services", "Other"],
  },
  {
    key: "size",
    question: "How many employees does your company have?",
    options: ["Under 10", "10 – 50", "50 – 200", "200+"],
  },
  {
    key: "problem",
    question: "What's the main problem you want to solve?",
    options: ["Manual data entry", "Lead management", "Customer support", "Document processing", "Other"],
  },
  {
    key: "service",
    question: "Which service are you interested in?",
    options: ["AI Automation", "Website", "Custom Software"],
  },
  {
    key: "timeline",
    question: "When do you want to start?",
    options: ["As soon as possible", "1 – 3 months", "Just exploring"],
  },
  {
    key: "budget",
    question: "What's your budget range?",
    options: ["Under $1,000", "$1,000 – $5,000", "$5,000 – $15,000", "$15,000+"],
  },
];

type AnswerMap = Record<string, string>;

type Stage = "intro" | "questions" | "scoring" | "result";

function scoreLead(answers: AnswerMap): { score: number; status: "Hot" | "Warm" | "Cold" } {
  let score = 50;

  if (answers.timeline === "As soon as possible") score += 15;
  else if (answers.timeline === "1 – 3 months") score += 8;

  if (answers.budget === "$15,000+") score += 15;
  else if (answers.budget === "$5,000 – $15,000") score += 10;
  else if (answers.budget === "$1,000 – $5,000") score += 5;

  if (answers.size === "50 – 200" || answers.size === "200+") score += 8;

  if (answers.problem && answers.problem !== "Other") score += 7;

  score = Math.min(99, Math.max(30, score));
  const status = score >= 75 ? "Hot" : score >= 55 ? "Warm" : "Cold";
  return { score, status };
}

/**
 * Demo 3 — AI Lead Qualification + CRM (docs/06_DEMO_SPECIFICATIONS.MD).
 * A simulated prospect answers qualification questions; the lead is scored
 * and appears in a CRM preview.
 */
export function LeadCrmDemo() {
  const [stage, setStage] = useState<Stage>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [scored, setScored] = useState<{ score: number; status: "Hot" | "Warm" | "Cold" } | null>(null);
  const [displayedScore, setDisplayedScore] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [stage, questionIndex, answers, displayedScore]);

  useEffect(() => {
    if (stage !== "scoring" || !scored) return;
    const target = scored.score;
    const interval = window.setInterval(() => {
      setDisplayedScore((current) => {
        if (current >= target) {
          window.clearInterval(interval);
          return target;
        }
        return Math.min(target, current + Math.max(1, Math.round(target / 18)));
      });
    }, 40);
    const finish = window.setTimeout(() => setStage("result"), 1100);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(finish);
    };
  }, [stage, scored]);

  const startDemo = () => {
    setStage("questions");
    setQuestionIndex(0);
    setAnswers({});
    setScored(null);
    setDisplayedScore(0);
  };

  const answerQuestion = (option: string) => {
    if (stage !== "questions") return;

    const question = qualificationQuestions[questionIndex];
    const nextAnswers = { ...answers, [question.key]: option };
    setAnswers(nextAnswers);

    if (questionIndex + 1 < qualificationQuestions.length) {
      window.setTimeout(() => setQuestionIndex((index) => index + 1), 450);
    } else {
      window.setTimeout(() => {
        setDisplayedScore(0);
        setScored(scoreLead(nextAnswers));
        setStage("scoring");
      }, 500);
    }
  };

  const resetDemo = () => {
    setStage("intro");
    setQuestionIndex(0);
    setAnswers({});
    setScored(null);
    setDisplayedScore(0);
  };

  const currentQuestion = stage === "questions" ? qualificationQuestions[questionIndex] : null;
  const pipeline = ["New", "Contacted", "Qualified", "Closed"];
  const need =
    answers.service ??
    (answers.problem === "Other" ? "Automation" : (answers.problem ?? "Document Automation"));

  return (
    <div className="flex flex-col gap-4">
      {/* Chat area */}
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        className="flex h-72 flex-col gap-3 overflow-y-auto rounded-xl border border-white/10 bg-surface/40 p-4"
      >
        {stage === "intro" && (
          <>
            <div className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-white">
              I need an automation system for my accounting company.
            </div>
            <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm leading-relaxed text-foreground/90">
              Let&apos;s qualify this quickly. I&apos;ll ask a few questions and build a lead
              profile automatically.
            </div>
          </>
        )}

        {stage === "questions" && currentQuestion && (
          <>
            {Object.entries(answers)
              .slice(0, questionIndex)
              .map(([key, answer]) => (
                <div
                  key={key}
                  className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-white"
                >
                  {answer}
                </div>
              ))}
            <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm leading-relaxed text-foreground/90">
              {currentQuestion.question}
            </div>
          </>
        )}

        {stage === "scoring" && (
          <div className="flex items-center gap-2 text-sm text-foreground/90">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Scoring lead {displayedScore}/100...
          </div>
        )}

        {stage === "result" && scored && (
          <div className="flex flex-col gap-3">
            <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm leading-relaxed text-foreground/90">
              Thanks {LEAD_NAME.split(" ")[0]}! Lead created and scored.
            </div>
            <div className="self-end rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-white">
              ✓ Captured automatically
            </div>
          </div>
        )}
      </div>

      {/* Option chips */}
      {stage === "questions" && currentQuestion && (
        <div className="flex flex-wrap gap-2">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => answerQuestion(option)}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Start / scoring / result actions */}
      {stage === "intro" && (
        <div className="flex justify-center">
          <Button onClick={startDemo}>Run qualification</Button>
        </div>
      )}

      {stage === "scoring" && (
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>Lead score</span>
            <span className="font-semibold text-foreground">{displayedScore}/100</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary to-secondary transition-all duration-100"
              style={{ width: `${displayedScore}%` }}
            />
          </div>
        </div>
      )}

      {/* CRM preview */}
      {stage === "result" && scored && (
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">New lead</p>
            <Badge
              variant={scored.status === "Hot" ? "primary" : scored.status === "Warm" ? "secondary" : "neutral"}
            >
              {scored.status} lead
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary text-sm font-bold text-white">
              {LEAD_NAME.split(" ").map((part) => part[0]).join("")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{LEAD_NAME}</p>
              <p className="truncate text-xs text-muted">{LEAD_COMPANY}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {[
              ["Email", LEAD_EMAIL],
              ["Need", need],
              ["Score", `${scored.score}/100`],
              ["Status", scored.status],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted">{label}</dt>
                <dd className="mt-0.5 font-medium text-foreground/90">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex items-center gap-1.5 pt-1">
            {pipeline.map((step, index) => (
              <div key={step} className="flex flex-1 flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex h-2 w-full rounded-full",
                    index === 0 ? "bg-primary" : "bg-white/10",
                  )}
                />
                <span className={cn("text-[10px]", index === 0 ? "text-primary" : "text-muted")}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage !== "intro" && (
        <Button type="button" variant="ghost" size="sm" onClick={resetDemo} className="self-center">
          <IconRefresh className="mr-1.5 h-3.5 w-3.5" />
          Restart demo
        </Button>
      )}

      {stage === "result" && (
        <div className="flex justify-center">
          <Button size="sm" href="/contact">
            Qualify a real lead →
          </Button>
        </div>
      )}

      <Badge variant="neutral" className="self-center">
        Simulated prospect — answers stay in your browser
      </Badge>
    </div>
  );
}
