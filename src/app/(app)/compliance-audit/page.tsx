"use client";

import { useState, useMemo } from "react";
import {
  credentialRecords,
  certificants,
  ceCredits,
  activityLog,
  programLookup,
} from "@/data/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertCircle, FileCheck, FileClock, ChevronDown, ChevronUp } from "lucide-react";

// ── Audit subject shape ─────────────────────────────────────────────────────

type AuditStatus = "Pending Documentation" | "Under Review" | "Cleared" | "Suspended";

interface AuditSubject {
  credentialId: string;
  credentialNumber: string;
  certificantId: string;
  certificantName: string;
  programAbbrev: string;
  expiryDate: string;
  ceCompleted: number;
  ceRequired: number;
  auditStatus: AuditStatus;
  credits: typeof ceCredits;
  suspensionReason?: string;
}

function buildAuditSubjects(): AuditSubject[] {
  const auditCreds = credentialRecords.filter((cr) => cr.auditSelected);
  return auditCreds.map((cr) => {
    const cert = certificants.find((c) => c.id === cr.certificantId);
    const prog = programLookup[cr.programId];
    const credits = ceCredits.filter((c) => c.credentialRecordId === cr.id);
    const allApproved = credits.every((c) => c.approved);
    const allUploaded = credits.every((c) => c.certificateUploaded);
    const isSuspended = cr.status === "Suspended";
    let auditStatus: AuditStatus;
    if (isSuspended) {
      auditStatus = "Suspended";
    } else if (!allUploaded) {
      auditStatus = "Pending Documentation";
    } else if (!allApproved) {
      auditStatus = "Under Review";
    } else {
      auditStatus = "Cleared";
    }
    return {
      credentialId: cr.id,
      credentialNumber: cr.credentialNumber,
      certificantId: cr.certificantId,
      certificantName: cert?.name ?? "Unknown",
      programAbbrev: prog?.abbreviation ?? cr.programId,
      expiryDate: cr.expiryDate,
      ceCompleted: cr.ceHoursCompleted,
      ceRequired: cr.ceRequiredHours,
      auditStatus,
      credits,
      suspensionReason: cr.suspensionReason,
    };
  });
}

const auditSubjects = buildAuditSubjects();

// Add a non-auditSelected suspended credential for completeness
// (James Whitfield is suspended but not in audit — add him via activityLog reference)

// ── Audit timeline events ───────────────────────────────────────────────────

const auditRelatedEvents = activityLog.filter(
  (e) =>
    e.action === "credential_suspended" ||
    e.action === "credential_renewed" ||
    e.action === "reinstatement_processed" ||
    e.action === "ce_credit_rejected" ||
    e.action === "ce_credit_approved"
);

const AUDIT_STATUS_ORDER: AuditStatus[] = [
  "Suspended",
  "Pending Documentation",
  "Under Review",
  "Cleared",
];

function AuditStatusBadge({ status }: { status: AuditStatus }) {
  const map: Record<AuditStatus, string> = {
    "Pending Documentation": "cert-status-badge cert-status-badge--expiring",
    "Under Review": "cert-status-badge cert-status-badge--pending",
    Cleared: "cert-status-badge cert-status-badge--active",
    Suspended: "cert-status-badge cert-status-badge--expired",
  };
  return <span className={map[status]}>{status}</span>;
}

function AuditStatusIcon({ status }: { status: AuditStatus }) {
  if (status === "Cleared")
    return <CheckCircle className="w-4 h-4 text-[color:var(--success)]" />;
  if (status === "Suspended")
    return <AlertCircle className="w-4 h-4 text-destructive" />;
  if (status === "Under Review")
    return <Clock className="w-4 h-4 text-[color:var(--warning)]" />;
  return <FileClock className="w-4 h-4 text-muted-foreground" />;
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function ComplianceAuditPage() {
  const [statusFilter, setStatusFilter] = useState<AuditStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);

  const displayed = useMemo(() => {
    return auditSubjects
      .filter((a) => statusFilter === "all" || a.auditStatus === statusFilter)
      .sort(
        (a, b) =>
          AUDIT_STATUS_ORDER.indexOf(a.auditStatus) -
          AUDIT_STATUS_ORDER.indexOf(b.auditStatus)
      );
  }, [statusFilter]);

  const counts = useMemo(() => {
    const c: Record<AuditStatus | "all", number> = {
      all: auditSubjects.length,
      Suspended: 0,
      "Pending Documentation": 0,
      "Under Review": 0,
      Cleared: 0,
    };
    auditSubjects.forEach((a) => c[a.auditStatus]++);
    return c;
  }, []);

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight aesthetic-heading">
            Compliance Audit
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            CE verification audit queue for selected certificants
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTimeline(!showTimeline)}
        >
          {showTimeline ? "Hide" : "Show"} Activity Log
        </Button>
      </div>

      {/* Status summary + filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["all", ...AUDIT_STATUS_ORDER] as (AuditStatus | "all")[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "text-left p-3 rounded-sm border transition-colors",
              statusFilter === s
                ? "bg-primary/8 border-primary/30"
                : "bg-card border-border hover:bg-[color:var(--surface-hover)]"
            )}
          >
            <p className="text-lg font-semibold tabular-nums">{counts[s]}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s === "all" ? "All Audits" : s}</p>
          </button>
        ))}
      </div>

      {/* Audit subjects */}
      <div className="space-y-3">
        {displayed.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-12">
            No audit subjects match this filter.
          </div>
        )}
        {displayed.map((subject) => {
          const isExpanded = expandedId === subject.credentialId;
          const allDocsPresent = subject.credits.every((c) => c.certificateUploaded);
          const allApproved = subject.credits.every((c) => c.approved);
          const pendingDocs = subject.credits.filter((c) => !c.certificateUploaded).length;
          const rejectedCredits = subject.credits.filter((c) => !c.approved && c.certificateUploaded).length;

          return (
            <Card key={subject.credentialId} className="overflow-hidden">
              <div
                className="px-4 py-3 cursor-pointer hover:bg-[color:var(--surface-hover)] transition-colors"
                onClick={() =>
                  setExpandedId(isExpanded ? null : subject.credentialId)
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AuditStatusIcon status={subject.auditStatus} />
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">
                          {subject.certificantName}
                        </span>
                        <span className="cert-id">{subject.credentialNumber}</span>
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded-sm">
                          {subject.programAbbrev}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Expires {subject.expiryDate}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          CE: {subject.ceCompleted}/{subject.ceRequired} hrs
                        </span>
                        {pendingDocs > 0 && (
                          <span className="text-xs text-[color:var(--warning)]">
                            {pendingDocs} doc{pendingDocs !== 1 ? "s" : ""} missing
                          </span>
                        )}
                        {rejectedCredits > 0 && (
                          <span className="text-xs text-destructive">
                            {rejectedCredits} credit{rejectedCredits !== 1 ? "s" : ""} rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <AuditStatusBadge status={subject.auditStatus} />
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border/50 bg-muted/10 px-4 py-3">
                  {subject.suspensionReason && (
                    <div className="mb-3 p-3 bg-destructive/8 border border-destructive/20 rounded-sm">
                      <p className="text-xs font-medium text-destructive mb-1">
                        Suspension Reason
                      </p>
                      <p className="text-sm text-foreground/80">
                        {subject.suspensionReason}
                      </p>
                    </div>
                  )}
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    CE Credit Verification
                  </p>
                  {subject.credits.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No CE credits on record for this credential.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {subject.credits.map((credit) => (
                        <div
                          key={credit.id}
                          className={cn(
                            "p-3 rounded-sm border",
                            credit.approved
                              ? "border-[color:var(--success)]/20 bg-[color:var(--success)]/5"
                              : credit.certificateUploaded
                              ? "border-destructive/20 bg-destructive/5"
                              : "border-[color:var(--warning)]/20 bg-[color:var(--warning)]/5"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            {credit.approved ? (
                              <FileCheck className="w-3.5 h-3.5 text-[color:var(--success)] shrink-0 mt-0.5" />
                            ) : credit.certificateUploaded ? (
                              <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                            ) : (
                              <FileClock className="w-3.5 h-3.5 text-[color:var(--warning)] shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{credit.courseName}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {credit.provider} · {credit.completionDate} · {credit.hours} hrs Cat {credit.category}
                              </p>
                              {!credit.approved && credit.rejectionReason && (
                                <p className="text-xs text-destructive mt-1">
                                  {credit.rejectionReason}
                                </p>
                              )}
                              {!credit.certificateUploaded && (
                                <p className="text-xs text-[color:var(--warning)] mt-1">
                                  Certificate of completion not uploaded.
                                </p>
                              )}
                            </div>
                            <span className="text-xs font-medium tabular-nums shrink-0">
                              {credit.approved ? "Verified" : credit.certificateUploaded ? "Rejected" : "Awaiting Docs"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Activity timeline */}
      {showTimeline && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Audit-Related Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0 divide-y divide-border/40">
              {auditRelatedEvents.map((event) => (
                <div key={event.id} className="py-3 flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        event.action.includes("rejected") ||
                          event.action.includes("suspended")
                          ? "bg-destructive"
                          : event.action.includes("approved") ||
                            event.action.includes("renewed")
                          ? "bg-[color:var(--success)]"
                          : "bg-[color:var(--warning)]"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{event.entityLabel}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {event.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {event.timestamp.replace("T", " ").replace("Z", "")} · {event.performedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
