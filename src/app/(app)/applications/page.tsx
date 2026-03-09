"use client";

import { useState, useMemo } from "react";
import { applications, programLookup } from "@/data/mock-data";
import type { ApplicationStatus } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, ChevronUp, FileCheck, FileClock, CheckCircle, XCircle } from "lucide-react";

function AppStatusBadge({ status }: { status: ApplicationStatus }) {
  const config: Record<
    ApplicationStatus,
    { variant: "active" | "expired" | "pending" | "expiring" }
  > = {
    Submitted: { variant: "pending" },
    "Under Review": { variant: "expiring" },
    Approved: { variant: "active" },
    Rejected: { variant: "expired" },
    "Awaiting Documentation": { variant: "expiring" },
    "Pending Payment": { variant: "pending" },
  };
  const c = config[status];
  const cls = {
    active: "cert-status-badge cert-status-badge--active",
    expired: "cert-status-badge cert-status-badge--expired",
    pending: "cert-status-badge cert-status-badge--pending",
    expiring: "cert-status-badge cert-status-badge--expiring",
  }[c.variant];
  return <span className={cls}>{status}</span>;
}

const PIPELINE_STAGES: ApplicationStatus[] = [
  "Submitted",
  "Under Review",
  "Awaiting Documentation",
  "Pending Payment",
  "Approved",
  "Rejected",
];

const STATUS_OPTIONS: ApplicationStatus[] = [
  "Submitted",
  "Under Review",
  "Approved",
  "Rejected",
  "Awaiting Documentation",
  "Pending Payment",
];

function DocIcon({ submitted }: { submitted: boolean }) {
  return submitted ? (
    <FileCheck className="w-3.5 h-3.5 text-[color:var(--success)]" />
  ) : (
    <FileClock className="w-3.5 h-3.5 text-[color:var(--warning)]" />
  );
}

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"pipeline" | "list">("pipeline");

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    return applications.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (
        q &&
        !a.candidateName.toLowerCase().includes(q) &&
        !a.id.toLowerCase().includes(q) &&
        !a.email.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [search, statusFilter]);

  function getByStage(stage: ApplicationStatus) {
    return applications.filter((a) => a.status === stage);
  }

  const stageIconMap: Record<string, React.ReactNode> = {
    Approved: <CheckCircle className="w-3.5 h-3.5 text-[color:var(--success)]" />,
    Rejected: <XCircle className="w-3.5 h-3.5 text-destructive" />,
  };

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight aesthetic-heading">
            Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Applicant pipeline — new certification candidates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "pipeline" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("pipeline")}
          >
            Pipeline
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search applicants or application #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground shrink-0">
          {displayed.length} application{displayed.length !== 1 ? "s" : ""}
        </span>
      </div>

      {viewMode === "pipeline" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PIPELINE_STAGES.map((stage) => {
            const stageItems = getByStage(stage);
            const isTerminal = stage === "Approved" || stage === "Rejected";
            return (
              <div key={stage} className="space-y-2">
                <div
                  className={cn(
                    "flex items-center justify-between p-2 rounded-sm text-xs font-medium border",
                    isTerminal ? "bg-muted/40" : "bg-muted/20"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {stageIconMap[stage] ?? null}
                    {stage}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {stageItems.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {stageItems.map((app) => {
                    const prog = programLookup[app.programId];
                    return (
                      <Card
                        key={app.id}
                        className="p-2 cursor-pointer hover:border-primary/30 transition-colors"
                        onClick={() =>
                          setExpandedId(expandedId === app.id ? null : app.id)
                        }
                      >
                        <p className="text-xs font-medium leading-snug">
                          {app.candidateName}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          <span className="font-mono">{prog?.abbreviation}</span>
                          {" · "}
                          <span className="cert-id text-[10px]">{app.id}</span>
                        </p>
                        {expandedId === app.id && (
                          <div className="mt-2 pt-2 border-t border-border/60 space-y-1.5">
                            <p className="text-[10px] text-muted-foreground">
                              Submitted {app.submitDate}
                            </p>
                            {app.reviewerNotes && (
                              <p className="text-[10px] text-foreground/80 leading-snug">
                                {app.reviewerNotes}
                              </p>
                            )}
                            <div className="space-y-0.5">
                              {app.documentsRequired.map((doc) => {
                                const isSubmitted = app.documentsSubmitted.includes(doc);
                                return (
                                  <div key={doc} className="flex items-start gap-1">
                                    <DocIcon submitted={isSubmitted} />
                                    <span
                                      className={cn(
                                        "text-[10px] leading-snug",
                                        isSubmitted
                                          ? "text-foreground/70"
                                          : "text-[color:var(--warning)]"
                                      )}
                                    >
                                      {doc}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <div className="mt-1.5 flex justify-end">
                          {expandedId === app.id ? (
                            <ChevronUp className="w-3 h-3 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                      </Card>
                    );
                  })}
                  {stageItems.length === 0 && (
                    <div className="text-[11px] text-muted-foreground text-center py-3 border border-dashed border-border/50 rounded-sm">
                      None
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "list" && (
        <div className="space-y-2">
          {displayed.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-12">
              No applications match this filter.
            </div>
          )}
          {displayed.map((app) => {
            const prog = programLookup[app.programId];
            const isExpanded = expandedId === app.id;
            const docsPct = Math.round(
              (app.documentsSubmitted.length / app.documentsRequired.length) * 100
            );
            return (
              <Card key={app.id} className="overflow-hidden">
                <CardHeader
                  className="py-3 px-4 cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="cert-id">{app.id}</span>
                      <span className="font-medium text-sm">{app.candidateName}</span>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {app.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground tabular-nums hidden md:block">
                        {app.submitDate}
                      </span>
                      <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded-sm">
                        {prog?.abbreviation}
                      </span>
                      <AppStatusBadge status={app.status} />
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-0 pb-4 px-4 bg-muted/20 border-t border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Documents
                        </p>
                        <div className="space-y-1">
                          {app.documentsRequired.map((doc) => {
                            const submitted = app.documentsSubmitted.includes(doc);
                            return (
                              <div key={doc} className="flex items-center gap-2">
                                <DocIcon submitted={submitted} />
                                <span
                                  className={cn(
                                    "text-sm",
                                    submitted
                                      ? "text-foreground/80"
                                      : "text-[color:var(--warning)] font-medium"
                                  )}
                                >
                                  {doc}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {docsPct}% of required documents received
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Reviewer Notes
                        </p>
                        {app.reviewerNotes ? (
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {app.reviewerNotes}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No reviewer notes on record.
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            Exam eligibility:
                          </span>
                          {app.examEligibilityGranted ? (
                            <span className="cert-status-badge cert-status-badge--active">
                              Granted
                            </span>
                          ) : (
                            <span className="cert-status-badge cert-status-badge--pending">
                              Not yet granted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
