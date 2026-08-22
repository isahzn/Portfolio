"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { getScriptedReply } from "@/lib/ai/scripted";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconRefresh } from "@/components/ui/icons";

const MAX_MESSAGES = 5;

type Message = { role: "user" | "assistant"; content: string };

const suggestedQuestions = [
  "What services do you offer?",
  "How can automation help my business?",
  "How much time can AI save?",
  "Can you build something similar?",
];

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Hi! I'm Floza's AI assistant demo. Ask me about our services, automation, or how we could help your business.",
  },
];

/**
 * Demo 1 — AI Business Assistant (docs/06_DEMO_SPECIFICATIONS.MD).
 * Chat interface backed by POST /api/chat (real AI when configured, scripted
 * fallback otherwise), with a 5-message limit that ends in a conversion CTA.
 */
export function AiAssistantDemo() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const visitorIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let visitorId = window.localStorage.getItem("floza-visitor");
    if (!visitorId) {
      visitorId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem("floza-visitor", visitorId);
    }
    visitorIdRef.current = visitorId;
  }, []);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const limitReached = userMessageCount >= MAX_MESSAGES;

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping || limitReached) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: visitorIdRef.current, message: trimmed }),
      });

      if (response.ok) {
        const data = (await response.json()) as { reply?: unknown };
        const reply =
          typeof data.reply === "string" && data.reply.trim()
            ? data.reply.trim()
            : getScriptedReply(trimmed);
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } else if (response.status === 429) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "You've reached the demo limit. Want a custom AI assistant for your business? Start a project from the contact page.",
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: getScriptedReply(trimmed) }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: getScriptedReply(trimmed) }]);
    } finally {
      setIsTyping(false);
    }
  };

  const resetDemo = () => {
    setMessages(initialMessages);
    setInput("");
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted">
          Messages used:
          <span className="font-semibold text-foreground">
            {userMessageCount}/{MAX_MESSAGES}
          </span>
        </div>
        <button
          type="button"
          onClick={resetDemo}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <IconRefresh className="h-3.5 w-3.5" />
          Restart
        </button>
      </div>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        className="flex h-80 flex-col gap-3 overflow-y-auto rounded-xl border border-white/10 bg-surface/40 p-4"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              message.role === "user"
                ? "self-end rounded-br-sm bg-primary text-white"
                : "self-start rounded-bl-sm border border-white/10 bg-white/[0.04] text-foreground/90",
            )}
          >
            {message.content}
          </div>
        ))}
        {isTyping && (
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

      {limitReached ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 p-5 text-center">
          <p className="text-sm font-medium text-foreground">You&apos;ve reached the demo limit.</p>
          <p className="text-sm text-muted">
            Want a custom AI assistant for your business?
          </p>
          <Button size="sm" href="/contact">
            Start a project →
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                disabled={isTyping}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted transition-colors hover:border-primary/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about automation..."
              aria-label="Message the assistant"
              className="h-11 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted/60 hover:border-white/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/25"
            />
            <Button type="submit" disabled={isTyping || !input.trim()}>
              Send
            </Button>
          </form>
        </>
      )}

      <Badge variant="neutral" className="self-center">
        Demo limits responses to {MAX_MESSAGES} messages per visitor
      </Badge>
    </div>
  );
}
