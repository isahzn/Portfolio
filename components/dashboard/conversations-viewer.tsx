"use client";

import { useState } from "react";
import type { Conversation } from "@/lib/database";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Conversation transcript — expandable chat bubbles for the admin dashboard. */
export function ConversationsViewer({ conversations }: { conversations: Conversation[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 px-4 py-14 text-center text-sm text-muted">
        No conversations yet — they appear here when visitors chat with the AI assistant.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {conversations.map((conversation) => {
        const isOpen = openId === conversation.id;
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        return (
          <li key={conversation.id} className="overflow-hidden rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : conversation.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03] sm:px-5"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  Visitor conversation
                  <span className="ml-2 font-mono text-xs text-muted">
                    {conversation.visitorId.slice(0, 18)}
                    {conversation.visitorId.length > 18 ? "…" : ""}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  {conversation.messages.length} message{conversation.messages.length === 1 ? "" : "s"}
                  {lastMessage ? ` · ${lastMessage.content.slice(0, 70)}${lastMessage.content.length > 70 ? "…" : ""}` : ""}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="hidden text-xs text-muted sm:block">{formatDate(conversation.updatedAt)}</span>
                <svg
                  className={cn("h-4 w-4 text-muted transition-transform", isOpen && "rotate-180 text-primary")}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="flex max-h-96 flex-col gap-2.5 overflow-y-auto border-t border-white/10 bg-white/[0.02] p-4 sm:p-5">
                {conversation.messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[82%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                        message.role === "user"
                          ? "rounded-br-md bg-primary text-white"
                          : "rounded-bl-md border border-white/10 bg-white/5 text-foreground/90",
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
