"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import { adminFetch, handleLoadError } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { IconChevronDown, IconChevronUp, IconEdit, IconPlus, IconTrash } from "@/components/ui/icons";
import { ProjectEditor } from "@/components/admin/project-editor";

/**
 * Admin Projects manager (docs/07_PROJECT_CASE_STUDY_SYSTEM.MD): create,
 * edit, delete and reorder portfolio projects, plus quick featured toggles.
 * All changes are live on the public site immediately.
 */
export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    adminFetch<{ projects: Project[] }>("/api/admin/projects")
      .then((data) => {
        setProjects(data.projects);
        setError(null);
      })
      .catch((loadError) => handleLoadError(loadError, setError));
  }

  useEffect(() => {
    let cancelled = false;
    adminFetch<{ projects: Project[] }>("/api/admin/projects")
      .then((data) => {
        if (!cancelled) {
          setProjects(data.projects);
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
    if (!projects) return;
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    const next = [...projects];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setProjects(next);
    try {
      await adminFetch("/api/admin/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((project) => project.id) }),
      });
    } catch {
      refresh();
      setError("Could not reorder projects.");
    }
  }

  async function toggleFeatured(project: Project) {
    setBusyId(project.id);
    setProjects((current) =>
      current?.map((item) =>
        item.id === project.id ? { ...item, featured: !item.featured } : item,
      ) ?? null,
    );
    try {
      await adminFetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !project.featured }),
      });
    } catch {
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(project: Project) {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    try {
      await adminFetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
      setProjects((current) => current?.filter((item) => item.id !== project.id) ?? null);
    } catch {
      setError("Could not delete the project.");
    }
  }

  const categories = [...new Set((projects ?? []).map((project) => project.category))];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Create, edit, reorder and delete portfolio projects. Changes appear on the site
          immediately.
        </p>
        <Button size="sm" onClick={() => setEditing("new")}>
          <IconPlus className="h-4 w-4" />
          New project
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

      {projects === null ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10">
          <span className="text-sm text-muted">Loading…</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 text-sm text-muted">
          <p>No projects yet.</p>
          <Button size="sm" variant="outline" onClick={() => setEditing("new")}>
            Create your first project
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((project, index) => (
            <li
              key={project.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image || undefined}
                alt=""
                className="h-12 w-20 shrink-0 rounded-lg border border-white/10 bg-surface object-cover"
                onError={(event) => {
                  (event.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{project.title}</p>
                <p className="truncate text-xs text-muted">
                  {project.category} · /projects/{project.slug}
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={project.featured}
                  disabled={busyId === project.id}
                  onChange={() => void toggleFeatured(project)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                Featured
              </label>

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
                  disabled={index === projects.length - 1}
                  onClick={() => void move(index, 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted transition-colors hover:border-white/25 hover:text-foreground disabled:opacity-30"
                >
                  <IconChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Edit project"
                  onClick={() => setEditing(project)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted transition-colors hover:border-white/25 hover:text-foreground"
                >
                  <IconEdit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Delete project"
                  onClick={() => void remove(project)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted transition-colors hover:border-red-400/40 hover:text-red-300"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing !== null && (
        <ProjectEditor
          project={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={(project) => {
            setProjects((current) => {
              const exists = (current ?? []).some((item) => item.id === project.id);
              if (exists) {
                return (current ?? []).map((item) => (item.id === project.id ? project : item));
              }
              return [...(current ?? []), project];
            });
          }}
        />
      )}
    </div>
  );
}
