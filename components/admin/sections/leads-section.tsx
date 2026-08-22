"use client";

import { useEffect, useState } from "react";
import type { Lead, LeadStatus } from "@/lib/database";
import { adminFetch, handleLoadError } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { IconDownload } from "@/components/ui/icons";
import { LeadTable } from "@/components/dashboard/lead-table";

/** Build a CSV file (RFC 4180 escaping) and trigger a browser download. */
function downloadLeadsCsv(leads: Lead[]) {
  const escape = (value: string) => {
    const text = value ?? "";
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const header = [
    "Name",
    "Email",
    "Phone",
    "Company",
    "Service",
    "Budget",
    "Timeline",
    "Message",
    "Status",
    "Received",
  ];
  const rows = leads.map((lead) =>
    [
      lead.name,
      lead.email,
      lead.phone ?? "",
      lead.company,
      lead.service ?? "",
      lead.budget ?? "",
      lead.timeline ?? "",
      lead.message,
      lead.status,
      new Date(lead.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    ]
      .map(escape)
      .join(","),
  );
  // BOM keeps Excel from misreading UTF-8 characters (é, –, …).
  const csv = `\uFEFF${[header.join(","), ...rows].join("\r\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `floza-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}

/** Leads section (docs/00_PROJECT_OVERVIEW.MD #11) — inquiries + status pipeline. */
export function LeadsSection() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    adminFetch<{ leads: Lead[] }>("/api/admin/leads")
      .then((data) => {
        setLeads(data.leads);
        setError(null);
      })
      .catch((loadError) => handleLoadError(loadError, setError));
  }

  useEffect(() => {
    let cancelled = false;
    adminFetch<{ leads: Lead[] }>("/api/admin/leads")
      .then((data) => {
        if (!cancelled) {
          setLeads(data.leads);
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

  async function changeStatus(id: string, status: LeadStatus) {
    setBusyId(id);
    const previous = leads;
    setLeads((current) => current?.map((lead) => (lead.id === id ? { ...lead, status } : lead)) ?? null);
    try {
      await adminFetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (updateError) {
      setLeads(previous);
      setError(updateError instanceof Error ? updateError.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  /** Remove a lead optimistically; roll back and show an error on failure. */
  async function removeLead(id: string) {
    setBusyId(id);
    const previous = leads;
    setLeads((current) => current?.filter((lead) => lead.id !== id) ?? null);
    try {
      await adminFetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    } catch (deleteError) {
      setLeads(previous);
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  const countByStatus = (status: LeadStatus) =>
    leads?.filter((lead) => lead.status === status).length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refresh}>
            Retry
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Leads</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => leads && downloadLeadsCsv(leads)}
          disabled={!leads || leads.length === 0}
        >
          <IconDownload className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total" value={leads?.length ?? 0} />
        <StatCard label="New" value={countByStatus("new")} />
        <StatCard label="Contacted" value={countByStatus("contacted")} />
        <StatCard label="Qualified" value={countByStatus("qualified")} />
        <StatCard label="Closed" value={countByStatus("closed")} />
      </div>

      {leads === null ? (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-white/10">
          <span className="text-sm text-muted">Loading…</span>
        </div>
      ) : (
        <LeadTable
          leads={leads}
          busyId={busyId}
          onStatusChange={(id, status) => void changeStatus(id, status)}
          onDelete={(id) => void removeLead(id)}
        />
      )}
    </div>
  );
}
