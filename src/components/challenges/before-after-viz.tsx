"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const beforeItems = [
  "Direct SFTP edits to the live database — every change is irreversible",
  "No documentation: understanding a feature requires reading fragile, untested PHP",
  '"Forensic debugging" before every new task — 2-4 hours just to understand the context',
  "One misplaced query can corrupt credential records for hundreds of members",
  "No way to trace what changed, when, or why after an incident",
];

const afterItems = [
  "Codebase mapped and key logic documented before any new feature work begins",
  "Change impact assessed systematically — every affected table and function identified",
  "New features developed against a staging environment, never directly on production",
  "Rollback path defined before deployment — no permanent surprises",
  "Audit trail in Git: every change attributed, reviewable, and reversible",
];

export function BeforeAfterViz() {
  const [view, setView] = useState<"before" | "after">("before");

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex items-center gap-1 p-1 rounded-sm w-fit"
        style={{ background: "color-mix(in oklch, var(--border) 40%, transparent)" }}>
        <button
          onClick={() => setView("before")}
          className="px-3 py-1 text-xs font-medium rounded-sm transition-all"
          style={{
            background: view === "before" ? "var(--card)" : "transparent",
            color: view === "before" ? "color-mix(in oklch, var(--destructive) 80%, var(--foreground))" : "var(--muted-foreground)",
            boxShadow: view === "before" ? "0 1px 2px oklch(0 0 0 / 0.08)" : "none",
          }}
        >
          Current State
        </button>
        <button
          onClick={() => setView("after")}
          className="px-3 py-1 text-xs font-medium rounded-sm transition-all"
          style={{
            background: view === "after" ? "var(--card)" : "transparent",
            color: view === "after" ? "color-mix(in oklch, var(--success) 80%, var(--foreground))" : "var(--muted-foreground)",
            boxShadow: view === "after" ? "0 1px 2px oklch(0 0 0 / 0.08)" : "none",
          }}
        >
          With My Approach
        </button>
      </div>

      {/* Panel */}
      <div
        className="rounded-sm p-4 border transition-all duration-150"
        style={
          view === "before"
            ? {
                background: "color-mix(in oklch, var(--destructive) 5%, transparent)",
                borderColor: "color-mix(in oklch, var(--destructive) 20%, transparent)",
              }
            : {
                background: "color-mix(in oklch, var(--success) 5%, transparent)",
                borderColor: "color-mix(in oklch, var(--success) 20%, transparent)",
              }
        }
      >
        <div className="flex items-center gap-2 mb-3">
          {view === "before" ? (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--destructive)" }} />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[color:var(--success)]" />
          )}
          <p className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: view === "before" ? "var(--destructive)" : "var(--success)" }}>
            {view === "before" ? "The problem today" : "How I approach it"}
          </p>
        </div>
        <ul className="space-y-2">
          {(view === "before" ? beforeItems : afterItems).map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
              <span
                className="mt-1 h-1.5 w-1.5 rounded-full shrink-0"
                style={{
                  background: view === "before" ? "var(--destructive)" : "var(--success)",
                  opacity: 0.7,
                }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
