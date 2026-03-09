"use client";

import { useState, useMemo } from "react";
import {
  certificants,
  credentialRecords,
  ceCredits,
  programLookup,
} from "@/data/mock-data";
import type { CECategory } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock } from "lucide-react";

// ── CE Compliance row ────────────────────────────────────────────────────────

interface CERow {
  credentialId: string;
  certificantName: string;
  credentialNumber: string;
  program: string;
  programId: string;
  ceCompleted: number;
  ceCatI: number;
  ceCatII: number;
  ceRequired: number;
  expiryDate: string;
  status: string;
  credits: typeof ceCredits;
}

function buildCERows(): CERow[] {
  return credentialRecords.map((cr) => {
    const cert = certificants.find((c) => c.id === cr.certificantId);
    const prog = programLookup[cr.programId];
    const credits = ceCredits.filter((c) => c.credentialRecordId === cr.id);
    return {
      credentialId: cr.id,
      certificantName: cert?.name ?? "Unknown",
      credentialNumber: cr.credentialNumber,
      program: prog?.abbreviation ?? cr.programId,
      programId: cr.programId,
      ceCompleted: cr.ceHoursCompleted,
      ceCatI: cr.ceCategoryIHours,
      ceCatII: cr.ceCategoryIIHours,
      ceRequired: cr.ceRequiredHours,
      expiryDate: cr.expiryDate,
      status: cr.status,
      credits,
    };
  });
}

const ceRows = buildCERows();

function complianceLabel(completed: number, required: number): "compliant" | "deficient" | "pending" {
  if (completed >= required) return "compliant";
  if (completed >= required * 0.5) return "pending";
  return "deficient";
}

function CreditApprovalIcon({ approved }: { approved: boolean }) {
  return approved ? (
    <CheckCircle className="w-3.5 h-3.5 text-[color:var(--success)] shrink-0" />
  ) : (
    <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
  );
}

export default function CETrackingPage() {
  const [search, setSearch] = useState("");
  const [complianceFilter, setComplianceFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    return ceRows.filter((r) => {
      const compliance = complianceLabel(r.ceCompleted, r.ceRequired);
      if (complianceFilter !== "all" && compliance !== complianceFilter) return false;
      if (programFilter !== "all" && r.programId !== programFilter) return false;
      if (
        q &&
        !r.certificantName.toLowerCase().includes(q) &&
        !r.credentialNumber.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [search, complianceFilter, programFilter]);

  const stats = useMemo(() => {
    const all = ceRows;
    const compliant = all.filter((r) => complianceLabel(r.ceCompleted, r.ceRequired) === "compliant").length;
    const deficient = all.filter((r) => complianceLabel(r.ceCompleted, r.ceRequired) === "deficient").length;
    const pending = all.filter((r) => complianceLabel(r.ceCompleted, r.ceRequired) === "pending").length;
    return { compliant, deficient, pending, total: all.length };
  }, []);

  const programOptions = Object.values(programLookup).map((p) => ({
    id: p.id,
    label: p.abbreviation,
  }));

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight aesthetic-heading">
            CE Tracking
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Continuing education compliance by credential
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "CE Compliant",
            value: stats.compliant,
            color: "text-[color:var(--success)]",
            bg: "bg-[color:var(--success)]/8",
            filter: "compliant",
          },
          {
            label: "In Progress",
            value: stats.pending,
            color: "text-[color:var(--warning)]",
            bg: "bg-[color:var(--warning)]/8",
            filter: "pending",
          },
          {
            label: "CE Deficient",
            value: stats.deficient,
            color: "text-destructive",
            bg: "bg-destructive/8",
            filter: "deficient",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className={cn(
              "cursor-pointer transition-colors hover:border-primary/30",
              complianceFilter === stat.filter ? stat.bg : ""
            )}
            onClick={() =>
              setComplianceFilter(
                complianceFilter === stat.filter ? "all" : stat.filter
              )
            }
          >
            <CardContent className="p-4">
              <p className={cn("text-2xl font-semibold tabular-nums", stat.color)}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search certificants or credential #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={complianceFilter} onValueChange={setComplianceFilter}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="All compliance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="compliant">Compliant</SelectItem>
            <SelectItem value="pending">In Progress</SelectItem>
            <SelectItem value="deficient">Deficient</SelectItem>
          </SelectContent>
        </Select>
        <Select value={programFilter} onValueChange={setProgramFilter}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="All programs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programOptions.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground shrink-0">
          {displayed.length} credentials
        </span>
      </div>

      {/* CE compliance list */}
      <div className="space-y-2">
        {displayed.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-12">
            No credentials match this filter.
          </div>
        )}
        {displayed.map((row) => {
          const compliance = complianceLabel(row.ceCompleted, row.ceRequired);
          const cePercent = row.ceRequired > 0
            ? Math.min(100, Math.round((row.ceCompleted / row.ceRequired) * 100))
            : 100;
          const catIPercent = row.ceRequired > 0
            ? Math.min(100, Math.round((row.ceCatI / row.ceRequired) * 100))
            : 0;
          const isExpanded = expandedId === row.credentialId;

          const barColor =
            compliance === "compliant"
              ? "bg-[color:var(--success)]"
              : compliance === "deficient"
              ? "bg-destructive"
              : "bg-[color:var(--warning)]";

          return (
            <Card key={row.credentialId} className="overflow-hidden">
              <div
                className="px-4 py-3 cursor-pointer hover:bg-[color:var(--surface-hover)] transition-colors"
                onClick={() =>
                  setExpandedId(isExpanded ? null : row.credentialId)
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-medium text-sm">
                        {row.certificantName}
                      </span>
                      <span className="cert-id">{row.credentialNumber}</span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {row.program}
                      </Badge>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {/* Overall progress */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              Total CE
                            </span>
                            <span className="text-xs tabular-nums font-medium">
                              {row.ceCompleted}/{row.ceRequired} hrs
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-none overflow-hidden">
                            <div
                              className={cn("h-full transition-all", barColor)}
                              style={{ width: `${cePercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Category split */}
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Cat I:</span>
                          <span className="text-xs tabular-nums font-medium">
                            {row.ceCatI} hrs
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Cat II:</span>
                          <span className="text-xs tabular-nums font-medium">
                            {row.ceCatII} hrs
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-xs text-muted-foreground">
                            Expires:
                          </span>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {row.expiryDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {compliance === "compliant" ? (
                      <span className="cert-status-badge cert-status-badge--active">
                        Compliant
                      </span>
                    ) : compliance === "deficient" ? (
                      <span className="cert-status-badge cert-status-badge--expired">
                        Deficient
                      </span>
                    ) : (
                      <span className="cert-status-badge cert-status-badge--expiring">
                        In Progress
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* CE Credit Log */}
              {isExpanded && (
                <div className="border-t border-border/50 bg-muted/10">
                  <div className="px-4 py-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      CE Credit Log
                    </p>
                  </div>
                  {row.credits.length === 0 ? (
                    <div className="px-4 pb-3 text-sm text-muted-foreground">
                      No CE credits recorded for this credential.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {row.credits.map((credit) => (
                        <div
                          key={credit.id}
                          className="px-4 py-2.5 flex items-start gap-3"
                        >
                          <CreditApprovalIcon approved={credit.approved} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-snug">
                              {credit.courseName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {credit.provider}
                              {" · "}
                              {credit.completionDate}
                            </p>
                            {!credit.approved && credit.rejectionReason && (
                              <p className="text-xs text-destructive mt-1 leading-snug">
                                {credit.rejectionReason}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-sm font-medium tabular-nums">
                              {credit.hours} hrs
                            </span>
                            <p className="text-xs text-muted-foreground">
                              Cat {credit.category}
                            </p>
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
    </div>
  );
}
