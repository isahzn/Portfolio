"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { Lead, LeadStatus } from "@/lib/database";
import { cn } from "@/lib/utils";
import { IconCheck, IconTrash } from "@/components/ui/icons";
import { StatusBadge } from "@/components/dashboard/status-badge";

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type LeadTableProps = {
  leads: Lead[];
  busyId: string | null;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
};

/**
 * LeadTable (docs/04_COMPONENT_LIBARY.MD #12). Responsive table with
 * expandable rows showing the full inquiry; status is updated in place.
 */
export function LeadTable({ leads, busyId, onStatusChange, onDelete }: LeadTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const confirmTimer = useRef<number | null>(null);

  // Clear any pending confirm timer when the table unmounts.
  useEffect(
    () => () => {
      if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current);
    },
    [],
  );

  /** Arm the two-step confirm for a row; auto-cancels after 3s. */
  function armConfirm(id: string) {
    setConfirmDeleteId(id);
    if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current);
    confirmTimer.current = window.setTimeout(() => {
      setConfirmDeleteId((current) => (current === id ? null : current));
      confirmTimer.current = null;
    }, 3000);
  }

  /** Execute the delete once the confirm state is armed for this row. */
  function confirmDelete(id: string) {
    if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current);
    confirmTimer.current = null;
    setConfirmDeleteId(null);
    onDelete(id);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Lead</th>
              <th scope="col" className="px-4 py-3 font-medium">Service</th>
              <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Budget</th>
              <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Date</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="w-20 px-4 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.map((lead) => {
              const isOpen = expanded === lead.id;
              return (
                <Fragment key={lead.id}>
                  <tr className={cn("transition-colors hover:bg-white/[0.02]", isOpen && "bg-white/[0.03]")}>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : lead.id)}
                        className="text-left"
                      >
                        <span className="block font-medium text-foreground">{lead.name}</span>
                        <span className="block text-xs text-muted">
                          {lead.company} · {lead.email}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted">{lead.service ?? "—"}</td>
                    <td className="hidden px-4 py-3 text-muted md:table-cell">{lead.budget ?? "—"}</td>
                    <td className="hidden px-4 py-3 text-muted lg:table-cell">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        disabled={busyId === lead.id}
                        onChange={(event) =>
                          onStatusChange(lead.id, event.target.value as LeadStatus)
                        }
                        aria-label={`Status for ${lead.name}`}
                        className="h-8 rounded-lg border border-white/10 bg-surface px-2 text-xs text-foreground outline-none transition-colors hover:border-white/25 focus:border-primary/50 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status[0].toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirmDeleteId === lead.id) {
                              confirmDelete(lead.id);
                            } else {
                              armConfirm(lead.id);
                            }
                          }}
                          disabled={busyId === lead.id}
                          aria-label={
                            confirmDeleteId === lead.id
                              ? `Confirm delete ${lead.name}`
                              : `Delete ${lead.name}`
                          }
                          title={
                            confirmDeleteId === lead.id ? "Click again to confirm" : "Delete lead"
                          }
                          className={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted transition-all hover:border-red-400/40 hover:text-red-300 disabled:opacity-50",
                            confirmDeleteId === lead.id &&
                              "border-red-400/50 bg-red-400/10 text-red-300",
                          )}
                        >
                          {confirmDeleteId === lead.id ? (
                            <IconCheck className="h-4 w-4" />
                          ) : (
                            <IconTrash className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpanded(isOpen ? null : lead.id)}
                          aria-label={isOpen ? "Hide details" : "Show details"}
                          aria-expanded={isOpen}
                          className={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted transition-all hover:border-white/25 hover:text-foreground",
                            isOpen && "rotate-180 border-primary/40 text-primary",
                          )}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-white/[0.02]">
                      <td colSpan={6} className="px-4 py-4 sm:px-6">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={lead.status} />
                            {lead.service && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted">
                                {lead.service}
                              </span>
                            )}
                            {lead.timeline && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted">
                                Timeline: {lead.timeline}
                              </span>
                            )}
                          </div>
                          <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                            {lead.message}
                          </p>
                          <dl className="grid gap-x-8 gap-y-2 text-xs sm:grid-cols-3">
                            <div>
                              <dt className="text-muted">Email</dt>
                              <dd className="mt-0.5 text-foreground/90">
                                <a href={`mailto:${lead.email}`} className="underline decoration-white/20 underline-offset-2 hover:text-primary">
                                  {lead.email}
                                </a>
                              </dd>
                            </div>
                            {lead.phone && (
                              <div>
                                <dt className="text-muted">Phone</dt>
                                <dd className="mt-0.5 text-foreground/90">
                                  <a href={`tel:${lead.phone}`} className="underline decoration-white/20 underline-offset-2 hover:text-primary">
                                    {lead.phone}
                                  </a>
                                </dd>
                              </div>
                            )}
                            {lead.budget && (
                              <div>
                                <dt className="text-muted">Budget</dt>
                                <dd className="mt-0.5 text-foreground/90">{lead.budget}</dd>
                              </div>
                            )}
                            <div>
                              <dt className="text-muted">Received</dt>
                              <dd className="mt-0.5 text-foreground/90">{formatDate(lead.createdAt)}</dd>
                            </div>
                          </dl>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {leads.length === 0 && (
        <div className="px-4 py-14 text-center text-sm text-muted">
          No leads yet — they appear here when visitors submit the contact form.
        </div>
      )}
    </div>
  );
}
