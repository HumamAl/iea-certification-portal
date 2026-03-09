"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { dashboardStats, monthlyActivity, programBreakdown } from "@/data/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

// SSR-safe chart imports
const ActivityAreaChart = dynamic(
  () => import("@/components/dashboard/reports-charts").then((m) => m.ActivityAreaChart),
  { ssr: false }
);
const ProgramBarChart = dynamic(
  () => import("@/components/dashboard/reports-charts").then((m) => m.ProgramBarChart),
  { ssr: false }
);
const CEComplianceAreaChart = dynamic(
  () => import("@/components/dashboard/reports-charts").then((m) => m.CEComplianceAreaChart),
  { ssr: false }
);
const ProgramPieChart = dynamic(
  () => import("@/components/dashboard/reports-charts").then((m) => m.ProgramPieChart),
  { ssr: false }
);

type ActivityMetric = "certifications" | "renewals" | "exams";

const ACTIVITY_OPTIONS: { value: ActivityMetric; label: string }[] = [
  { value: "certifications", label: "Certifications Issued" },
  { value: "renewals", label: "Renewals Processed" },
  { value: "exams", label: "Exams Administered" },
];

function StatChange({ change }: { change: number }) {
  const positive = change >= 0;
  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        positive ? "text-[color:var(--success)]" : "text-destructive"
      )}
    >
      {positive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {positive ? "+" : ""}
      {change.toFixed(1)}%
    </span>
  );
}

export default function ReportsPage() {
  const [activityMetric, setActivityMetric] = useState<ActivityMetric>("certifications");

  // Compute totals from monthly data
  const totalCerts = monthlyActivity.reduce((s, m) => s + m.certificationsIssued, 0);
  const totalRenewals = monthlyActivity.reduce((s, m) => s + m.renewalsProcessed, 0);
  const totalExams = monthlyActivity.reduce((s, m) => s + m.examsAdministered, 0);
  const totalCE = monthlyActivity.reduce((s, m) => s + m.ceCreditsLogged, 0);

  const totalActive = programBreakdown.reduce((s, p) => s + p.activeCertificants, 0);

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight aesthetic-heading">
            Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Program performance metrics — trailing 12 months
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-3.5 h-3.5" />
          Export Report
        </Button>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Active Certificants",
            value: dashboardStats.activeCertificants.toLocaleString(),
            change: dashboardStats.activeCertificantsChange,
          },
          {
            label: "Renewal Rate",
            value: `${dashboardStats.renewalRate}%`,
            change: dashboardStats.renewalRateChange,
          },
          {
            label: "Exam Pass Rate",
            value: `${dashboardStats.examPassRate}%`,
            change: dashboardStats.examPassRateChange,
          },
          {
            label: "CE Completion",
            value: `${dashboardStats.ceCompletionRate}%`,
            change: dashboardStats.ceCompletionRateChange,
          },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-semibold tabular-nums">{kpi.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <StatChange change={kpi.change} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity trend with metric toggle */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Activity Trend (12 months)</CardTitle>
            <div className="flex items-center gap-1">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActivityMetric(opt.value)}
                  className={cn(
                    "px-2 py-1 text-xs rounded-sm border transition-colors",
                    activityMetric === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:bg-[color:var(--surface-hover)]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ActivityAreaChart metric={activityMetric} />
          <div className="grid grid-cols-4 gap-4 mt-3 pt-3 border-t border-border/50">
            {[
              { label: "Certifications (12mo)", value: totalCerts },
              { label: "Renewals (12mo)", value: totalRenewals },
              { label: "Exams (12mo)", value: totalExams },
              { label: "CE Credits Logged", value: totalCE },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-semibold tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two charts side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Program Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ProgramBarChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Certificants by Program
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ProgramPieChart />
          </CardContent>
        </Card>
      </div>

      {/* CE Compliance trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            CE Compliance Trend (Sep 2025 – Mar 2026)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <CEComplianceAreaChart />
        </CardContent>
      </Card>
    </div>
  );
}
