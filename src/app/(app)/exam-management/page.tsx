"use client";

import { useState, useMemo } from "react";
import { examAttempts, programLookup } from "@/data/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Download, TrendingUp, TrendingDown } from "lucide-react";

// ── Stat cards ──────────────────────────────────────────────────────────────

function computeStats() {
  const completed = examAttempts.filter((e) => e.score > 0);
  const passed = completed.filter((e) => e.passed).length;
  const failed = completed.filter((e) => !e.passed).length;
  const firstAttempt = completed.filter((e) => e.attempt === "1st");
  const firstPassed = firstAttempt.filter((e) => e.passed).length;
  const firstPassRate =
    firstAttempt.length > 0
      ? Math.round((firstPassed / firstAttempt.length) * 100)
      : 0;
  const avgScore =
    completed.length > 0
      ? Math.round(completed.reduce((sum, e) => sum + e.score, 0) / completed.length)
      : 0;
  const upcoming = examAttempts.filter((e) => e.score === 0).length;
  return { passed, failed, firstPassRate, avgScore, upcoming };
}

const stats = computeStats();

// ── Program pass rates ──────────────────────────────────────────────────────

interface ProgramRate {
  programId: string;
  abbrev: string;
  total: number;
  passed: number;
  rate: number;
}

function computeProgramRates(): ProgramRate[] {
  const grouped: Record<string, { total: number; passed: number }> = {};
  examAttempts
    .filter((e) => e.score > 0)
    .forEach((e) => {
      if (!grouped[e.programId]) grouped[e.programId] = { total: 0, passed: 0 };
      grouped[e.programId].total++;
      if (e.passed) grouped[e.programId].passed++;
    });
  return Object.entries(grouped).map(([programId, d]) => ({
    programId,
    abbrev: programLookup[programId]?.abbreviation ?? programId,
    total: d.total,
    passed: d.passed,
    rate: Math.round((d.passed / d.total) * 100),
  }));
}

const programRates = computeProgramRates();

const PROGRAM_OPTIONS = Object.values(programLookup).map((p) => ({
  id: p.id,
  label: p.abbreviation,
}));

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ExamManagementPage() {
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    return examAttempts.filter((e) => {
      if (resultFilter === "passed" && !e.passed) return false;
      if (resultFilter === "failed" && (e.passed || e.score === 0)) return false;
      if (resultFilter === "scheduled" && e.score !== 0) return false;
      if (programFilter !== "all" && e.programId !== programFilter) return false;
      if (
        q &&
        !e.candidateName.toLowerCase().includes(q) &&
        !e.id.toLowerCase().includes(q) &&
        !e.examSite.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [search, resultFilter, programFilter]);

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight aesthetic-heading">
            Exam Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Exam results, pass rates, and candidate performance
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "First-Attempt Pass Rate",
            value: `${stats.firstPassRate}%`,
            icon: <TrendingUp className="w-4 h-4 text-[color:var(--success)]" />,
          },
          {
            label: "Avg Score",
            value: stats.avgScore,
            icon: null,
          },
          {
            label: "Passed",
            value: stats.passed,
            icon: null,
          },
          {
            label: "Upcoming Exams",
            value: stats.upcoming,
            icon: null,
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {s.icon}
                <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pass rate by program */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Pass Rate by Program</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {programRates.sort((a, b) => b.rate - a.rate).map((pr) => (
              <div key={pr.programId} className="flex items-center gap-3">
                <span className="text-xs font-mono w-16 shrink-0">{pr.abbrev}</span>
                <div className="flex-1 h-2 bg-muted rounded-none overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      pr.rate >= 75
                        ? "bg-[color:var(--success)]"
                        : pr.rate >= 50
                        ? "bg-[color:var(--warning)]"
                        : "bg-destructive"
                    )}
                    style={{ width: `${pr.rate}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums font-medium w-12 text-right shrink-0">
                  {pr.rate}%
                </span>
                <span className="text-xs text-muted-foreground w-16 shrink-0">
                  ({pr.passed}/{pr.total})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates or exam ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="All results" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
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
          {displayed.length} exam{displayed.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Exam attempts table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {[
                  "Exam ID",
                  "Candidate",
                  "Program",
                  "Exam Date",
                  "Site",
                  "Attempt",
                  "Score",
                  "Result",
                  "Proctor",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No exam records match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((e) => {
                  const prog = programLookup[e.programId];
                  const isScheduled = e.score === 0;
                  const scorePct = isScheduled ? null : e.score;
                  return (
                    <TableRow
                      key={e.id}
                      className="hover:bg-[color:var(--surface-hover)] transition-colors"
                    >
                      <TableCell>
                        <span className="cert-id">{e.id}</span>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {e.candidateName}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded-sm">
                          {prog?.abbreviation}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm tabular-nums text-muted-foreground">
                        {e.examDate}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {e.examSite}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="font-mono">{e.attempt}</span>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {isScheduled ? (
                          <span className="text-xs text-muted-foreground italic">
                            Scheduled
                          </span>
                        ) : (
                          <span
                            className={cn(
                              "text-sm font-medium",
                              scorePct !== null && scorePct >= e.passingScore
                                ? "text-[color:var(--success)]"
                                : "text-destructive"
                            )}
                          >
                            {e.score}/{e.passingScore}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isScheduled ? (
                          <span className="cert-status-badge cert-status-badge--pending">
                            Scheduled
                          </span>
                        ) : e.passed ? (
                          <span className="cert-status-badge cert-status-badge--active">
                            Passed
                          </span>
                        ) : (
                          <span className="cert-status-badge cert-status-badge--expired">
                            Failed
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {e.proctor}
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
