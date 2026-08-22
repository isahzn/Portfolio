"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import {
  EMPTY_LEAD,
  LEAD_FIELDS,
  getScriptedIntakeReply,
  type IntakeLead,
  type IntakeResponse,
} from "@/lib/ai/intake";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconCheck,
  IconMic,
  IconRefresh,
  IconSquare,
  IconVolume,
  IconVolumeX,
} from "@/components/ui/icons";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Status = "idle" | "listening" | "processing" | "speaking";

/* Minimal Web Speech API typings (not in the TS DOM lib). */
type TranscriptLike = { isFinal: boolean; [index: number]: { transcript: string } };
type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: { results: ArrayLike<TranscriptLike> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
};

function getRecognitionCtor(): (new () => RecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => RecognitionLike;
    webkitSpeechRecognition?: new () => RecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noopSubscribe = () => () => {};

const GREETING =
  "Hi, I'm Floza's voice project intake agent. Tap the mic and tell me about your project — your name, what you're building, anything that comes to mind. I'll capture it all as we talk.";

const TOTAL_FIELDS = LEAD_FIELDS.length;

/**
 * Voice Project Intake Agent demo — a temporary, in-browser experience.
 * Browser speech-to-text (Web Speech API) → AI agent (scripted fallback) →
 * text-to-speech reply, with a live project-brief panel that fills in as the
 * conversation progresses. Everything lives in React state: refresh resets it,
 * and nothing is written to any database.
 */
export function VoiceProjectIntakeDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [lead, setLead] = useState<IntakeLead>(EMPTY_LEAD);
  const [status, setStatus] = useState<Status>("idle");
  const [interim, setInterim] = useState("");
  const [done, setDone] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [handsFree, setHandsFree] = useState(false);
  const [input, setInput] = useState("");
  /* Client-only capability check — null on the server, real value after hydration. */
  const voiceSupported = useSyncExternalStore(
    noopSubscribe,
    () => getRecognitionCtor() !== null,
    () => null,
  );
  const logRef = useRef<HTMLDivElement>(null);

  /* Refs mirror mutable state so recognition/speech callbacks never go stale. */
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const statusRef = useRef<Status>("idle");
  const leadRef = useRef<IntakeLead>(EMPTY_LEAD);
  const doneRef = useRef(false);
  const voiceOnRef = useRef(true);
  const handsFreeRef = useRef(false);
  const lastResultsRef = useRef<ArrayLike<TranscriptLike> | null>(null);
  const autoListenRef = useRef<number | null>(null);
  const interruptedRef = useRef(false);

  const setStatusAll = (next: Status) => {
    statusRef.current = next;
    setStatus(next);
  };

  useEffect(() => {
    voiceOnRef.current = voiceOn;
  }, [voiceOn]);

  useEffect(() => {
    handsFreeRef.current = handsFree;
  }, [handsFree]);

  useEffect(() => {
    leadRef.current = lead;
  }, [lead]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status, interim]);

  const speak = (text: string) => {
    if (!voiceOnRef.current || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.04;
    utterance.pitch = 1;
    utterance.lang = "en-US";
    setStatusAll("speaking");
    utterance.onend = () => {
      setStatusAll("idle");
      // User tapped the mic mid-speech to interrupt — don't auto-listen.
      if (interruptedRef.current) {
        interruptedRef.current = false;
        return;
      }
      // Hands-free: after the agent finishes talking, start listening again.
      if (handsFreeRef.current && !doneRef.current && recognitionRef.current) {
        autoListenRef.current = window.setTimeout(() => {
          const rec = recognitionRef.current;
          if (!rec || statusRef.current !== "idle" || doneRef.current) return;
          setStatusAll("listening");
          setInterim("");
          try {
            rec.start();
          } catch {
            setStatusAll("idle");
          }
        }, 450);
      }
    };
    utterance.onerror = () => setStatusAll("idle");
    window.speechSynthesis.speak(utterance);
  };

  const sendToAi = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInterim("");
    setStatusAll("processing");

    const applyResponse = (data: IntakeResponse) => {
      leadRef.current = data.lead;
      setLead(data.lead);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      if (data.complete) {
        doneRef.current = true;
        setDone(true);
      }
      setStatusAll("idle");
      speak(data.reply);
    };

    try {
      const response = await fetch("/api/voice-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, lead: leadRef.current }),
      });

      if (response.status === 429) {
        applyResponse({
          reply: "You're moving fast! Give me a second to breathe, then try again.",
          lead: leadRef.current,
          complete: false,
        });
        return;
      }

      if (response.ok) {
        const data = (await response.json()) as Partial<IntakeResponse> & { error?: string };
        if (typeof data.reply === "string" && data.reply.trim()) {
          applyResponse({
            reply: data.reply.trim(),
            lead: data.lead ?? leadRef.current,
            complete: data.complete === true,
          });
          return;
        }
      }

      // Provider unhelpful or route error — local scripted fallback.
      applyResponse(getScriptedIntakeReply(trimmed, leadRef.current));
    } catch {
      applyResponse(getScriptedIntakeReply(trimmed, leadRef.current));
    }
  };

  const startListening = () => {
    const rec = recognitionRef.current;
    if (!rec || statusRef.current !== "idle" || doneRef.current) return;
    setStatusAll("listening");
    setInterim("");
    lastResultsRef.current = null;
    try {
      rec.start();
    } catch {
      setStatusAll("idle");
    }
  };

  const stopListening = () => {
    const rec = recognitionRef.current;
    statusRef.current = "idle";
    setStatus("idle");
    if (rec) {
      try {
        rec.stop();
      } catch {
        try {
          rec.abort();
        } catch {
          /* no-op */
        }
      }
    }
  };

  const handleMicClick = () => {
    if (status === "speaking") {
      interruptedRef.current = true;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setStatusAll("idle");
      return;
    }
    if (status === "listening") {
      stopListening();
      return;
    }
    if (status === "processing") return;
    startListening();
  };

  const resetDemo = () => {
    if (autoListenRef.current !== null) window.clearTimeout(autoListenRef.current);
    autoListenRef.current = null;
    interruptedRef.current = false;
    recognitionRef.current?.abort();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    statusRef.current = "idle";
    setStatus("idle");
    setInterim("");
    setDone(false);
    doneRef.current = false;
    leadRef.current = EMPTY_LEAD;
    setLead(EMPTY_LEAD);
    setMessages([{ role: "assistant", content: GREETING }]);
    setInput("");
  };

  /* Wire up speech recognition once, and clean up on unmount. */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (event) => {
      lastResultsRef.current = event.results;
      const parts: string[] = [];
      for (let i = 0; i < event.results.length; i += 1) {
        const entry = event.results[i];
        const transcript = entry?.[0]?.transcript ?? "";
        if (transcript) parts.push(transcript);
      }
      setInterim(parts.join(" ").trim());
    };
    rec.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") {
        setInterim("");
        if (event.error === "aborted") return;
      }
      if (statusRef.current === "listening") {
        statusRef.current = "idle";
        setStatus("idle");
      }
    };
    rec.onend = () => {
      if (statusRef.current !== "listening") return; // user cancelled
      const results = lastResultsRef.current;
      const parts: string[] = [];
      if (results) {
        for (let i = 0; i < results.length; i += 1) {
          const transcript = results[i]?.[0]?.transcript ?? "";
          if (transcript) parts.push(transcript);
        }
      }
      const transcript = parts.join(" ").trim();
      setInterim("");
      if (transcript) {
        void sendToAi(transcript);
      } else {
        statusRef.current = "idle";
        setStatus("idle");
      }
    };
    recognitionRef.current = rec;

    return () => {
      if (autoListenRef.current !== null) window.clearTimeout(autoListenRef.current);
      try {
        rec.abort();
      } catch {
        /* no-op */
      }
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recognition is wired once at mount
  }, []);

  const collected = LEAD_FIELDS.filter((field) => lead[field.key]).length;
  const skippedCount = lead.skipped.length;
  const progress = Math.min(1, (collected + skippedCount) / TOTAL_FIELDS);
  const initials = lead.name
    ? lead.name
        .split(/\s+/)
        .map((part) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const statusLabel =
    status === "listening"
      ? interim
        ? `Listening… “${interim}”`
        : "Listening… speak now"
      : status === "processing"
        ? "Floza is thinking…"
        : status === "speaking"
          ? "Floza is speaking…"
          : "Tap the mic and speak — or type below";

  return (
    <div className="flex flex-col gap-4">
      {/* Conversation */}
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        className="flex h-64 flex-col gap-3 overflow-y-auto rounded-xl border border-white/10 bg-surface/40 p-4"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              message.role === "user"
                ? "self-end rounded-br-sm bg-primary text-white"
                : "self-start rounded-bl-sm border border-white/10 bg-white/[0.04] text-foreground/90",
            )}
          >
            {message.content}
          </div>
        ))}
        {status === "processing" && (
          <div className="flex items-center gap-1.5 self-start rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-4 py-3">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
                style={{ animationDelay: `${dot * 120}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mic + status */}
      <div className="flex flex-col items-center gap-2.5">
        <div className="flex items-center gap-3">
          {voiceSupported !== false && (
            <button
              type="button"
              onClick={handleMicClick}
              disabled={status === "processing" || done}
              aria-label={
                status === "listening"
                  ? "Stop listening"
                  : status === "speaking"
                    ? "Stop speaking"
                    : "Start speaking"
              }
              className={cn(
                "relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-60",
                status === "listening"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/40 hover:bg-red-400"
                  : status === "speaking"
                    ? "border border-primary/40 bg-primary/10 text-primary"
                    : "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-95",
              )}
            >
              {status === "listening" && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/40" />
              )}
              {status === "processing" ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : status === "listening" ? (
                <IconSquare className="h-5 w-5" />
              ) : (
                <IconMic className="h-6 w-6" />
              )}
            </button>
          )}

          {status === "listening" && (
            <div className="flex h-6 items-end gap-1" aria-hidden="true">
              {[10, 18, 14, 22].map((height, index) => (
                <span
                  key={index}
                  className="w-1.5 animate-pulse rounded-full bg-red-400"
                  style={{ height, animationDelay: `${index * 140}ms` }}
                />
              ))}
            </div>
          )}
        </div>

        <p
          className={cn(
            "min-h-5 text-center text-xs transition-colors",
            status === "listening" ? "text-red-300" : status === "processing" ? "text-primary" : "text-muted",
          )}
        >
          {statusLabel}
        </p>

        {voiceSupported !== false && (
          <div className="flex items-center gap-5 text-xs">
            <button
              type="button"
              onClick={() => setVoiceOn((value) => !value)}
              className={cn(
                "inline-flex items-center gap-1.5 transition-colors hover:text-foreground",
                voiceOn ? "text-foreground" : "text-muted",
              )}
            >
              {voiceOn ? <IconVolume className="h-4 w-4" /> : <IconVolumeX className="h-4 w-4" />}
              {voiceOn ? "Voice on" : "Voice off"}
            </button>
            <button
              type="button"
              onClick={() => setHandsFree((value) => !value)}
              className={cn(
                "inline-flex items-center gap-2 transition-colors hover:text-foreground",
                handsFree ? "text-foreground" : "text-muted",
              )}
              aria-pressed={handsFree}
            >
              <span
                className={cn(
                  "relative h-3.5 w-7 rounded-full transition-colors",
                  handsFree ? "bg-primary" : "bg-white/15",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all",
                    handsFree ? "left-4" : "left-0.5",
                  )}
                />
              </span>
              Hands-free
            </button>
          </div>
        )}
      </div>

      {voiceSupported === false && (
        <p className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-center text-xs text-amber-200/90">
          Voice input isn&apos;t supported in this browser — type your answers below instead.
        </p>
      )}

      {/* Manual input (also the fallback for browsers without Web Speech) */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (status === "processing") return;
          stopListening(); // don't let a live mic transcribe while sending
          void sendToAi(input);
          setInput("");
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={done ? "Intake complete — restart to begin again" : "Or type your answer…"}
          disabled={done}
          aria-label="Type your answer"
          className="h-11 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted/60 hover:border-white/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/25 disabled:pointer-events-none disabled:opacity-50"
        />
        <Button type="submit" disabled={!input.trim() || status === "processing" || done}>
          Send
        </Button>
      </form>

      {/* Live project brief (in-memory CRM — resets on refresh) */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Project brief</p>
          {done ? (
            <Badge variant="primary">
              <IconCheck className="h-3 w-3" />
              Ready to quote
            </Badge>
          ) : (
            <Badge variant="neutral">
              {Math.min(TOTAL_FIELDS, collected + skippedCount)}/{TOTAL_FIELDS} details
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary text-sm font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex justify-between text-[11px] text-muted">
              <span>{done ? "Intake captured" : "Collecting details"}</span>
              <span className="font-semibold text-foreground">{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-linear-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
          {LEAD_FIELDS.map((field) => {
            const value = lead[field.key];
            const skipped = lead.skipped.includes(field.key);
            return (
              <div key={field.key} className={cn(field.key === "description" && "col-span-2")}>
                <dt className="text-muted">{field.label}</dt>
                <dd
                  className={cn(
                    "mt-0.5 truncate",
                    value ? "font-medium text-foreground/90" : skipped ? "italic text-muted/70" : "text-muted/50",
                  )}
                  title={value ?? undefined}
                >
                  {value ?? (skipped ? "Skipped" : "—")}
                </dd>
              </div>
            );
          })}
        </dl>

        {done && (
          <div className="flex justify-center pt-1">
            <Button size="sm" href="/contact">
              Turn this into a real project →
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Badge variant="neutral" className="self-center">
          In-browser demo — your voice and details are never stored
        </Badge>
        <button
          type="button"
          onClick={resetDemo}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <IconRefresh className="h-3.5 w-3.5" />
          Restart
        </button>
      </div>
    </div>
  );
}
