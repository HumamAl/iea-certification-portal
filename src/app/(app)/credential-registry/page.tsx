"use client";

import { useState, useMemo } from "react";
import {
  certificants,
  credentialRecords,
  certificationPrograms,
  programLookup,
} from "@/data/mock-data";
import type { CredentialStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, ChevronUp, ChevronDown, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// ── Status Badge ──────────────────────────────────────────────────────────────

function CredentialStatusBadge({ status }: { status: CredentialStatus }) {
  const config: Record<
    CredentialStatus,
    { variant: "active" | "expired" | "pending" | "expiring" | "muted" }
  > = {
    Active: { variant: "active" },
    Reinstated: { variant: "active" },
    "Active – Renewal Due": { variant: "expiring" },
    "Expiring Soon": { variant: "expiring" },
    "CE Deficient": { variant: "expiring" },
    "Pending Exam": { variant: "pending" },
    "Under Review": { variant: "pending" },
    "Pending Payment": { variant: "pending" },
    Lapsed: { variant: "expired" },
    Suspended: { variant: "expired" },
    Revoked: { variant: "expired" },
  };
  const c = config[status] ?? { variant: "muted" };
  const variantClass = {
    active: "cert-status-badge cert-status-badge--active",
    expired: "cert-status-badge cert-status-badge--expired",
    pending: "cert-status-badge cert-status-badge--pending",
    expiring: "cert-status-badge cert-status-badge--expiring",
    muted: "cert-status-badge",
  }[c.variant];
  return <span className={variantClass}>{status}</span>;
}

// ── Row data shape ─────────────────────────────────────────────────────────────

interface RegistryRow {
  certificantId: string;
  certificantName: string;
  credentialNumber: string;
  credentialId: string;
  program: string;
  programId: string;
  issueDate: string;
  expiryDate: string;
  ceCompleted: number;
  ceRequired: number;
  status: CredentialStatus;
}

// ── Build flat rows from relational data ────────────────────────────────────────

const registryRows: RegistryRow[] = credentialRecords.map((cr) => {
  const cert = certificants.find((c) => c.id === cr.certificantId);
  const prog = programLookup[cr.programId];
  return {
    certificantId: cr.certificantId,
    certificantName: cert?.name ?? "Unknown",
    credentialNumber: cr.credentialNumber,
    credentialId: cr.id,
    program: prog?.abbreviation ?? cr.programId,
    programId: cr.programId,
    issueDate: cr.issueDate,
    expiryDate: cr.expiryDate,
    ceCompleted: cr.ceHoursCompleted,
    ceRequired: cr.ceRequiredHours,
    status: cr.status,
  };
});

type SortKey = keyof Pick<
  RegistryRow,
  "certificantName" | "credentialNumber" | "program" | "issueDate" | "expiryDate" | "status"
>;

const STATUS_OPTIONS: CredentialStatus[] = [
  "Active",
  "Active – Renewal Due",
  "Expiring Soon",
  "CE Deficient",
  "Lapsed",
  "Suspended",
  "Pending Exam",
  "Under Review",
  "Pending Payment",
  "Reinstated",
  "Revoked",
];

const PROGRAM_OPTIONS = certificationPrograms.map((p) => ({
  id: p.id,
  label: p.abbreviation,
}));

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CredentialRegistryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("expiryDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    return registryRows
      .filter((r) => {
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (programFilter !== "all" && r.programId !== programFilter) return false;
        if (
          q &&
          !r.certificantName.toLowerCase().includes(q) &&
          !r.credentialNumber.toLowerCase().includes(q) &&
          !r.program.toLowerCase().includes(q)
        )
          return false;
        return true;
      })
      .sort((a, b) => {
        const av = a[sortKey] as string;
        const bv = b[sortKey] as string;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [search, statusFilter, programFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 ml-1 inline" />
    ) : (
      <ChevronDown className="w-3 h-3 ml-1 inline" />
    );
  }

  function isExpiringSoon(expiryDate: string): boolean {
    const diff = new Date(expiryDate).getTime() - Date.now();
    return diff > 0 && diff < 1000 * 60 * 60 * 24 * 30;
  }

  return (
    <div className="page-container space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight aesthetic-heading">
            Credential Registry
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Master record of all issued certifications
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
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
        <Select value={programFilter} onValueChange={setProgramFilter}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="All programs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {PROGRAM_OPTIONS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground shrink-0">
          {displayed.length} of {registryRows.length} credentials
        </span>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {(
                  [
                    { key: "certificantName", label: "Certificant" },
                    { key: "credentialNumber", label: "Credential #" },
                    { key: "program", label: "Program" },
                    { key: "issueDate", label: "Issue Date" },
                    { key: "expiryDate", label: "Expiry Date" },
                    { key: null, label: "CE Progress" },
                    { key: "status", label: "Status" },
                  ] as { key: SortKey | null; label: string }[]
                ).map((col) => (
                  <TableHead
                    key={col.label}
                    className={cn(
                      "text-xs font-medium text-muted-foreground uppercase tracking-wide",
                      col.key && "cursor-pointer select-none hover:text-foreground transition-colors"
                    )}
                    onClick={col.key ? () => toggleSort(col.key as SortKey) : undefined}
                  >
                    {col.label}
                    {col.key && <SortIcon col={col.key as SortKey} />}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No credentials match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((row) => {
                  const cePercent = row.ceRequired > 0
                    ? Math.min(100, Math.round((row.ceCompleted / row.ceRequired) * 100))
                    : 100;
                  return (
                    <TableRow
                      key={row.credentialId}
                      className="hover:bg-[color:var(--surface-hover)] transition-colors"
                    >
                      <TableCell className="text-sm font-medium">
                        {row.certificantName}
                      </TableCell>
                      <TableCell>
                        <span className="cert-id">{row.credentialNumber}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-mono">
                          {row.program}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground tabular-nums">
                        {row.issueDate}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        <span
                          className={cn(
                            isExpiringSoon(row.expiryDate) && "cert-expiry-warn"
                          )}
                        >
                          {row.expiryDate}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={cePercent}
                            className="h-1.5 flex-1"
                          />
                          <span className="text-xs text-muted-foreground tabular-nums w-16 text-right shrink-0">
                            {row.ceCompleted}/{row.ceRequired} hrs
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CredentialStatusBadge status={row.status} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
