"use client";

import { useEffect, useState } from "react";
import type { Conversation } from "@/lib/database";
import { adminFetch, handleLoadError } from "@/lib/admin-api";
import { ConversationsViewer } from "@/components/dashboard/conversations-viewer";
import { Button } from "@/components/ui/button";

/** Conversations section — chatbot chats captured from the site. */
export function ConversationsSection() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    adminFetch<{ conversations: Conversation[] }>("/api/admin/conversations")
      .then((data) => {
        setConversations(data.conversations);
        setError(null);
      })
      .catch((loadError) => handleLoadError(loadError, setError));
  }

  useEffect(() => {
    let cancelled = false;
    adminFetch<{ conversations: Conversation[] }>("/api/admin/conversations")
      .then((data) => {
        if (!cancelled) {
          setConversations(data.conversations);
          setError(null);
        }
      })
      .catch((loadError) => {
        if (!cancelled) handleLoadError(loadError, setError);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refresh}>
            Retry
          </Button>
        </div>
      )}
      {conversations === null ? (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-white/10">
          <span className="text-sm text-muted">Loading…</span>
        </div>
      ) : (
        <ConversationsViewer conversations={conversations} />
      )}
    </div>
  );
}
