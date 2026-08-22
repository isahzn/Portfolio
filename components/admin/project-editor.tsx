"use client";

import { useState } from "react";
import type { Project, ProjectInput } from "@/lib/types";
import { slugify } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { IconTrash } from "@/components/ui/icons";
import { ImageUpload } from "@/components/admin/image-upload";
import { StringListEditor } from "@/components/admin/string-list-editor";

type Draft = {
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  image: string;
  gallery: string[];
  featured: boolean;
  problem: string;
  solution: string;
  workflow: string[];
  results: string[];
  technologies: string[];
  links: { live: string; github: string; caseStudy: string };
};

const EMPTY_DRAFT: Draft = {
  title: "",
  slug: "",
  category: "",
  shortDescription: "",
  image: "",
  gallery: [],
  featured: false,
  problem: "",
  solution: "",
  workflow: [""],
  results: [""],
  technologies: [""],
  links: { live: "", github: "", caseStudy: "" },
};

function toDraft(project: Project | null): Draft {
  if (!project) return EMPTY_DRAFT;
  return {
    title: project.title,
    slug: project.slug,
    category: project.category,
    shortDescription: project.shortDescription,
    image: project.image,
    gallery: project.gallery ?? [],
    featured: project.featured,
    problem: project.problem ?? "",
    solution: project.solution ?? "",
    workflow: (project.workflow ?? []).length ? (project.workflow ?? []) : [""],
    results: (project.results ?? []).length ? (project.results ?? []) : [""],
    technologies: (project.technologies ?? []).length ? (project.technologies ?? []) : [""],
    links: {
      live: project.links?.live ?? "",
      github: project.links?.github ?? "",
      caseStudy: project.links?.caseStudy ?? "",
    },
  };
}

function toInput(draft: Draft): ProjectInput {
  const clean = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);
  return {
    slug: draft.slug.trim() || slugify(draft.title),
    title: draft.title.trim(),
    category: draft.category.trim() || "Website",
    shortDescription: draft.shortDescription.trim(),
    image: draft.image.trim(),
    gallery: draft.gallery,
    featured: draft.featured,
    problem: draft.problem.trim() || undefined,
    solution: draft.solution.trim() || undefined,
    workflow: clean(draft.workflow),
    results: clean(draft.results),
    technologies: clean(draft.technologies),
    links: {
      live: draft.links.live.trim() || undefined,
      github: draft.links.github.trim() || undefined,
      caseStudy: draft.links.caseStudy.trim() || undefined,
    },
  };
}

/**
 * Project editor modal (docs/07_PROJECT_CASE_STUDY_SYSTEM.MD) — create and
 * edit every project field, including the cover image and gallery uploads
 * (reusable ImageUpload → Media Library). Empty fields stay empty, so case
 * study sections render only when content exists.
 *
 * Rendered only while open (parent conditionally mounts it), so state is
 * initialised fresh from the project on each open — no reset effect needed.
 */
export function ProjectEditor({
  onClose,
  project,
  categories,
  onSaved,
}: {
  onClose: () => void;
  /** null = create a new project. */
  project: Project | null;
  categories: string[];
  onSaved: (project: Project) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(project));
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof Draft>(field: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const addGallery = (url: string) => {
    if (url) update("gallery", [...draft.gallery, url]);
  };

  async function save() {
    if (status === "saving") return;
    if (!draft.title.trim()) {
      setError("A project title is required.");
      return;
    }
    setStatus("saving");
    setError(null);
    try {
      const response = await fetch(
        project ? `/api/admin/projects/${project.id}` : "/api/admin/projects",
        {
          method: project ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toInput(draft)),
        },
      );
      const data = (await response.json().catch(() => ({}))) as {
        project?: Project;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "Could not save the project.");
      onSaved(data.project!);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the project.");
      setStatus("idle");
    }
  }

  return (
    <Modal open onClose={onClose} title={project ? "Edit project" : "New project"} className="max-w-2xl">
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Title *"
            value={draft.title}
            onChange={(event) => {
              update("title", event.target.value);
              if (!draft.slug || draft.slug === slugify(draft.title)) {
                update("slug", slugify(event.target.value));
              }
            }}
          />
          <Input
            label="Slug"
            hint="URL: /projects/this-value"
            value={draft.slug}
            onChange={(event) => update("slug", slugify(event.target.value))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Category"
            list="project-categories"
            placeholder="e.g. AI Automation"
            value={draft.category}
            onChange={(event) => update("category", event.target.value)}
          />
          <datalist id="project-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="text-sm font-medium text-foreground/80">Featured on homepage</span>
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(event) => update("featured", event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
          </label>
        </div>

        <Textarea
          label="Short description"
          value={draft.shortDescription}
          onChange={(event) => update("shortDescription", event.target.value)}
        />

        <ImageUpload
          value={draft.image}
          onChange={(url) => update("image", url)}
          label="Cover image"
          hint="Shown on the card and case-study hero. Leave empty for a clean placeholder."
        />

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground/80">Gallery images</span>
          {draft.gallery.map((url) => (
            <div key={url} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-14 w-24 shrink-0 rounded-lg object-cover" />
              <span className="min-w-0 flex-1 truncate text-xs text-muted">{url}</span>
              <button
                type="button"
                aria-label="Remove gallery image"
                onClick={() => update("gallery", draft.gallery.filter((item) => item !== url))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-muted transition-colors hover:border-red-400/40 hover:text-red-300"
              >
                <IconTrash className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <ImageUpload value="" onChange={addGallery} label="Add gallery image" aspectClass="aspect-[16/7]" />
        </div>

        <Textarea
          label="Problem"
          value={draft.problem}
          onChange={(event) => update("problem", event.target.value)}
        />
        <Textarea
          label="Solution"
          value={draft.solution}
          onChange={(event) => update("solution", event.target.value)}
        />

        <StringListEditor
          label="Workflow steps"
          values={draft.workflow}
          onChange={(value) => update("workflow", value)}
          placeholder="e.g. Invoice received by email"
        />
        <StringListEditor
          label="Results"
          values={draft.results}
          onChange={(value) => update("results", value)}
          placeholder="e.g. Hours of manual work removed"
        />
        <StringListEditor
          label="Technologies"
          values={draft.technologies}
          onChange={(value) => update("technologies", value)}
          placeholder="e.g. Next.js"
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Live site link"
            placeholder="https://…"
            value={draft.links.live}
            onChange={(event) => update("links", { ...draft.links, live: event.target.value })}
          />
          <Input
            label="Code link"
            placeholder="https://github.com/…"
            value={draft.links.github}
            onChange={(event) => update("links", { ...draft.links, github: event.target.value })}
          />
          <Input
            label="Case study link"
            placeholder="https://…"
            value={draft.links.caseStudy}
            onChange={(event) => update("links", { ...draft.links, caseStudy: event.target.value })}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <div className="mt-5 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => void save()} disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : project ? "Save changes" : "Create project"}
        </Button>
      </div>
    </Modal>
  );
}
