"use client";

import { useEffect, useState } from "react";
import type { Experience } from "@/lib/database";
import { adminFetch, handleLoadError } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { ImageUpload } from "@/components/admin/image-upload";
import { StringListEditor } from "@/components/admin/string-list-editor";
import {
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@/components/ui/icons";

type Draft = {
  company: string;
  projectTitle: string;
  description: string;
  technologies: string[];
  completionDate: string;
  logo: string;
};

const EMPTY_DRAFT: Draft = {
  company: "",
  projectTitle: "",
  description: "",
  technologies: [""],
  completionDate: "",
  logo: "",
};

/**
 * Admin "Previous Experience" manager — companies/clients Floza has worked
 * with (name, project, description, technologies, completion date, logo).
 * Changes appear on /experience immediately.
 */
export function ExperiencesManager() {
  const [entries, setEntries] = useState<Experience[] | null>(null);
  const [editing, setEditing] = useState<Experience | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    adminFetch<{ experiences: Experience[] }>("/api/admin/experiences")
      .then((data) => {
        setEntries(data.experiences);
        setError(null);
      })
      .catch((loadError) => handleLoadError(loadError, setError));
  }

  useEffect(() => {
    let cancelled = false;
    adminFetch<{ experiences: Experience[] }>("/api/admin/experiences")
      .then((data) => {
        if (!cancelled) {
          setEntries(data.experiences);
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

  async function move(index: number, direction: -1 | 1) {
    if (!entries) return;
    const target = index + direction;
    if (target < 0 || target >= entries.length) return;
    const next = [...entries];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setEntries(next);
    try {
      await adminFetch("/api/admin/experiences/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((entry) => entry.id) }),
      });
    } catch {
      refresh();
      setError("Could not reorder entries.");
    }
  }

  async function remove(entry: Experience) {
    if (!window.confirm(`Delete "${entry.company}"? This cannot be undone.`)) return;
    try {
      await adminFetch(`/api/admin/experiences/${entry.id}`, { method: "DELETE" });
      setEntries((current) => current?.filter((item) => item.id !== entry.id) ?? null);
    } catch {
      setError("Could not delete the entry.");
    }
  }

  function openEditor(entry: Experience | "new") {
    setEditing(entry);
    setDraft(
      entry === "new"
        ? EMPTY_DRAFT
        : {
            company: entry.company,
            projectTitle: entry.projectTitle,
            description: entry.description,
            technologies: (entry.technologies ?? []).length ? (entry.technologies ?? []) : [""],
            completionDate: entry.completionDate,
            logo: entry.logo,
          },
    );
    setError(null);
  }

  async function save() {
    if (saving) return;
    if (!draft.company.trim()) {
      setError("A company name is required.");
      return;
    }
    setSaving(true);
    try {
      const clean = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);
      const data = await adminFetch<{ experience: Experience }>(
        editing !== null && editing !== "new" ? `/api/admin/experiences/${editing.id}` : "/api/admin/experiences",
        {
          method: editing !== null && editing !== "new" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: draft.company,
            projectTitle: draft.projectTitle,
            description: draft.description,
            technologies: clean(draft.technologies),
            completionDate: draft.completionDate,
            logo: draft.logo,
          }),
        },
      );
      setEntries((current) => {
        const exists = (current ?? []).some((item) => item.id === data.experience.id);
        if (exists) {
          return (current ?? []).map((item) =>
            item.id === data.experience.id ? data.experience : item,
          );
        }
        return [...(current ?? []), data.experience];
      });
      setEditing(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the entry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Companies and clients Floza has worked with, shown on the Past Projects page.
        </p>
        <Button size="sm" onClick={() => openEditor("new")}>
          <IconPlus className="h-4 w-4" />
          Add entry
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refresh}>
            Retry
          </Button>
        </div>
      )}

      {entries === null ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10">
          <span className="text-sm text-muted">Loading…</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 text-sm text-muted">
          <p>No experience entries yet.</p>
          <Button size="sm" variant="outline" onClick={() => openEditor("new")}>
            Add your first client
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-surface text-sm font-semibold text-primary">
                {entry.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={entry.logo} alt="" className="h-full w-full object-cover" />
                ) : (
                  entry.company.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{entry.company}</p>
                <p className="truncate text-xs text-muted">
                  {entry.projectTitle || "No project title"}
                  {entry.completionDate ? ` · ${entry.completionDate}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => void move(index, -1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted transition-colors hover:border-white/25 hover:text-foreground disabled:opacity-30"
                >
                  <IconChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === entries.length - 1}
                  onClick={() => void move(index, 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted transition-colors hover:border-white/25 hover:text-foreground disabled:opacity-30"
                >
                  <IconChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Edit entry"
                  onClick={() => openEditor(entry)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted transition-colors hover:border-white/25 hover:text-foreground"
                >
                  <IconEdit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Delete entry"
                  onClick={() => void remove(entry)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted transition-colors hover:border-red-400/40 hover:text-red-300"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing !== null && editing !== "new" ? `Edit ${editing.company}` : "Add experience entry"}
        className="max-w-xl"
      >
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Company / client *"
              value={draft.company}
              onChange={(event) => setDraft({ ...draft, company: event.target.value })}
            />
            <Input
              label="Project title"
              placeholder="e.g. Invoice automation platform"
              value={draft.projectTitle}
              onChange={(event) => setDraft({ ...draft, projectTitle: event.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Completion date"
              placeholder="e.g. 2025 or 2025-03"
              value={draft.completionDate}
              onChange={(event) => setDraft({ ...draft, completionDate: event.target.value })}
            />
            <ImageUpload
              value={draft.logo}
              onChange={(url) => setDraft({ ...draft, logo: url })}
              label="Company logo"
              aspectClass="aspect-[2/1]"
            />
          </div>

          <Textarea
            label="Description"
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          />

          <StringListEditor
            label="Technologies"
            values={draft.technologies}
            onChange={(value) => setDraft({ ...draft, technologies: value })}
            placeholder="e.g. AI workflow"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="mt-5 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : editing !== null && editing !== "new" ? "Save changes" : "Add entry"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
