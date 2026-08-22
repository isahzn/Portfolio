"use client";

import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconFile, IconRefresh, IconUpload } from "@/components/ui/icons";

const MAX_FILES = 3;
const ACCEPT = ".pdf,.png,.jpg,.jpeg,.docx,.doc";

type UploadedFile = { id: string; name: string; size: number };

type ExtractedDocument = {
  name: string;
  company: string;
  reference: string;
  amount: string;
  date: string;
  category: string;
};

type ActiveStage = "uploading" | "analyzing" | "extracting" | "generating";
type ProcessingStage = ActiveStage | "idle" | "done";

const stageOrder: ActiveStage[] = ["uploading", "analyzing", "extracting", "generating"];
const stageLabels: Record<ActiveStage, string> = {
  uploading: "Uploading files",
  analyzing: "Analyzing documents",
  extracting: "Extracting information",
  generating: "Generating results",
};

const companies = ["ABC Supplies", "Meridian Office", "Northwind Traders", "Brightline Services", "Summit Partners"];
const categories = ["Business Expense", "Office Supplies", "Software", "Consulting", "Travel"];
const amounts = ["$450", "$1,280", "$87.50", "$3,650", "$240"];

/** Deterministic pseudo-random seed from the file name, so results are stable per file. */
function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function simulateExtraction(file: UploadedFile): ExtractedDocument {
  const hash = hashName(file.name);
  const day = (hash % 28) + 1;
  return {
    name: file.name,
    company: companies[hash % companies.length],
    reference: `INV-${1000 + (hash % 9000)}`,
    amount: amounts[hash % amounts.length],
    date: `0${(hash % 8) + 1}/${String(day).padStart(2, "0")}/2026`,
    category: categories[hash % categories.length],
  };
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Demo 2 — AI Document Processing (docs/06_DEMO_SPECIFICATIONS.MD).
 * Upload up to 3 files, watch the staged processing animation, and see
 * simulated structured extraction results.
 */
export function DocumentProcessingDemo() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [results, setResults] = useState<ExtractedDocument[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  const addFiles = (incoming: File[]) => {
    setError(null);
    const accepted = incoming.filter((file) => {
      const name = file.name.toLowerCase();
      return ACCEPT.split(",").some((ext) => name.endsWith(ext));
    });

    const rejected = incoming.length - accepted.length;
    const combined = [...files, ...accepted.map((file, index) => ({ id: `${file.name}-${Date.now()}-${index}`, name: file.name, size: file.size }))];

    if (rejected > 0) {
      setError(`${rejected} file${rejected === 1 ? "" : "s"} skipped — only PDF, image, or document files are supported.`);
    }
    if (combined.length > MAX_FILES) {
      setError(`You can upload up to ${MAX_FILES} files for this demo.`);
      return;
    }
    setFiles(combined);
    setResults(null);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
    setResults(null);
    setError(null);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) addFiles(Array.from(event.dataTransfer.files));
  };

  const processFiles = () => {
    if (files.length === 0 || stage !== "idle") return;
    setResults(null);

    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = stageOrder.map((stage, index) =>
      window.setTimeout(() => setStage(stage), index * 700),
    );
    timersRef.current.push(
      window.setTimeout(() => {
        setResults(files.map(simulateExtraction));
        setStage("idle");
      }, stageOrder.length * 700 + 500),
    );
  };

  const resetDemo = () => {
    setFiles([]);
    setResults(null);
    setStage("idle");
    setError(null);
  };

  const isProcessing = stage !== "idle";
  const stageIndex = stageOrder.indexOf(stage as ActiveStage);

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-8 text-center transition-colors",
          isDragging ? "border-primary/60 bg-primary/5" : "border-white/15 bg-white/[0.02]",
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-primary">
          <IconUpload className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Drop files here</p>
          <p className="mt-1 text-xs text-muted">
            or click to browse · PDF, images, documents · max {MAX_FILES} files
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          aria-label="Choose files to upload"
          onChange={(event) => {
            if (event.target.files) addFiles(Array.from(event.target.files));
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
        >
          Browse files
        </Button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* File list */}
      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
            >
              <IconFile className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground/85">{file.name}</span>
              <span className="shrink-0 text-xs text-muted">{formatSize(file.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                disabled={isProcessing}
                aria-label={`Remove ${file.name}`}
                className="shrink-0 rounded p-1 text-muted transition-colors hover:bg-white/5 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Processing stages */}
      {isProcessing && (
        <ol className="flex flex-col gap-2 rounded-xl border border-white/10 bg-surface/40 p-4">
          {stageOrder.map((name) => {
            const isDone = stageIndex > stageOrder.indexOf(name);
            const isActive = stage === name;
            return (
              <li key={name} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full",
                    isDone && "bg-primary/15 text-primary",
                    isActive && "border-2 border-primary/40",
                    !isDone && !isActive && "border border-white/15 text-muted",
                  )}
                >
                  {isDone ? (
                    <IconCheck className="h-3 w-3" />
                  ) : isActive ? (
                    <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : null}
                </span>
                <span className={cn(isDone || isActive ? "text-foreground/90" : "text-muted")}>
                  {stageLabels[name]}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {/* Results */}
      {results && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Extracted information</p>
            <Badge variant="primary">{results.length} processed</Badge>
          </div>
          <div className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
            {results.map((doc) => (
              <div key={doc.name} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
                    <IconFile className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{doc.name}</span>
                  </p>
                  <Badge variant="neutral">Processed</Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
                  {[
                    ["Company", doc.company],
                    ["Reference", doc.reference],
                    ["Amount", doc.amount],
                    ["Date", doc.date],
                    ["Category", doc.category],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-muted">{label}</dt>
                      <dd className="mt-0.5 font-medium text-foreground/90">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          onClick={processFiles}
          disabled={files.length === 0 || isProcessing}
        >
          {isProcessing ? "Processing..." : "Process documents"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={resetDemo} disabled={isProcessing}>
          <IconRefresh className="mr-1.5 h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}
