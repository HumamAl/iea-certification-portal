"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/config";
import {
  dashboardStats,
  credentialRecords,
  certificationPrograms,
  monthlyActivity,
  programBreakdown,
  activityLog,
  certificants,
} from "@/data/mock-data";
import type { CredentialRecord, CredentialStatus } from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  ShieldCheck,
  BookOpen,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";

// ── SSR-safe chart imports ──────────────────────────────────────────
const MonthlyActivityChart = dynamic(
  () =>
    import("@/components/dashboard/monthly-activity-chart").then(
      (m) => m.MonthlyActivityChart
    ),
  { ssr: false, loading: () => <div className="h-[280px] bg-muted/30 animate-pulse" /> }
);

const ProgramBreakdownChart = dynamic(
  () =>
    import("@/components/dashboard/program-breakdown-chart").then(
      (m) => m.ProgramBreakdownChart
    ),
  { ssr: false, loading: () => <div className="h-[240px] bg-muted/30 animate-pulse" /> }
);

const CredentialNetworkCanvas = dynamic(
  () =>
    import("@/components/dashboard/credential-network-canvas").then(
      (m) => m.CredentialNetworkCanvas
    ),
  { ssr: false }
);

// ── Count-up hook ───────────────────────────────────────────────────
function useCountUp(target: number, duration = 1000, decimals = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;
            setCount(parseFloat(current.toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  return { count, ref };
}

// ── Stat card ───────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number;
  change: number;
  suffix?: string;
  decimals?: number;
  description: string;
  icon: React.ReactNode;
  index: number;
  variant?: "default" | "warning";
}

function StatCard({
  title,
  value,
  change,
  suffix = "",
  decimals = 0,
  description,
  icon,
  index,
  variant = "default",
}: StatCardProps) {
  const { count, ref } = useCountUp(value, 1000 + index * 100, decimals);
  const isPositive = change >= 0;
  const display = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();

  return (
    <div
      ref={ref}
      className="aesthetic-card animate-fade-up-in"
      style={{
        padding: "var(--card-padding)",
        animationDelay: `${index * 60}ms`,
        animationDuration: "200ms",
        animationFillMode: "both",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">
          {title}
        </p>
        <span
          className={cn(
            "p-1.5 rounded",
            variant === "warning"
              ? "bg-warning/10 text-warning-foreground"
              : "bg-primary/8 text-primary"
          )}
          style={{ color: variant === "warning" ? "var(--warning)" : "var(--primary)" }}
        >
          {icon}
        </span>
      </div>

      <div className="mb-1">
        <span
          className="text-2xl font-bold font-mono tabular-nums"
          style={{ color: "var(--foreground)" }}
        >
          {display}
          {suffix}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {isPositive ? (
          <TrendingUp size={11} style={{ color: "var(--success)" }} />
        ) : (
          <TrendingDown size={11} style={{ color: "var(--destructive)" }} />
        )}
        <span
          className="text-xs font-medium"
          style={{ color: isPositive ? "var(--success)" : "var(--destructive)" }}
        >
          {isPositive ? "+" : ""}
          {change.toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </div>
  );
}

// ── Status badge helper ─────────────────────────────────────────────
function credentialStatusVariant(
  status: CredentialStatus
): "active" | "expired" | "pending" | "expiring" {
  if (status === "Active" || status === "Reinstated") return "active";
  if (status === "Lapsed" || status === "Suspended" || status === "Revoked") return "expired";
  if (status === "Expiring Soon" || status === "Active – Renewal Due" || status === "CE Deficient")
    return "expiring";
  return "pending";
}

function credentialStatusLabel(status: CredentialStatus): string {
  return status;
}

// ── Action icon for activity log ────────────────────────────────────
function activityIcon(action: string) {
  if (action.includes("issued") || action.includes("renewed") || action.includes("approved") || action.includes("passed"))
    return <CheckCircle2 size={13} style={{ color: "var(--success)" }} />;
  if (action.includes("lapsed") || action.includes("suspended") || action.includes("failed") || action.includes("rejected"))
    return <XCircle size={13} style={{ color: "var(--destructive)" }} />;
  if (action.includes("overdue"))
    return <AlertTriangle size={13} style={{ color: "var(--warning)" }} />;
  return <ChevronRight size={13} style={{ color: "var(--muted-foreground)" }} />;
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Pipeline step ───────────────────────────────────────────────────
interface PipelineStep {
  label: string;
  count: number;
  color: string;
}

// ── Main page ───────────────────────────────────────────────────────
export default function OverviewPage() {
  const [chartView, setChartView] = useState<"certifications" | "renewals">("certifications");
  const [programFilter, setProgramFilter] = useState<string>("all");

  // Derive good-standing % from dashboardStats
  const goodStandingPct = Math.round(
    (dashboardStats.activeCertificants /
      (dashboardStats.activeCertificants + dashboardStats.lapsedCount)) *
      100
  );

  // Derive pipeline counts
  const pipeline: PipelineStep[] = useMemo(() => {
    const pending = dashboardStats.pendingApplications;
    const pendingExam = credentialRecords.filter(
      (r) => r.status === "Pending Exam"
    ).length;
    const active = dashboardStats.activeCertificants;
    const renewalDue =
      credentialRecords.filter(
        (r) =>
          r.status === "Active – Renewal Due" ||
          r.status === "Expiring Soon"
      ).length +
      dashboardStats.expiringWithin90Days;
    return [
      { label: "Application", count: pending, color: "var(--chart-5)" },
      { label: "Exam", count: pendingExam + 8, color: "var(--chart-2)" },
      { label: "Active", count: active, color: "var(--success)" },
      { label: "Renewal", count: Math.max(renewalDue, dashboardStats.expiringWithin90Days), color: "var(--warning)" },
    ];
  }, []);

  const pipelineMax = Math.max(...pipeline.map((s) => s.count));

  // Filtered credential records
  const filteredCredentials = useMemo(() => {
    const programMap: Record<string, string> = {};
    certificationPrograms.forEach((p) => {
      programMap[p.id] = p.abbreviation;
    });

    return credentialRecords
      .filter((r) => {
        if (programFilter === "all") return true;
        return r.programId === programFilter;
      })
      .slice(0, 10)
      .map((r) => {
        const certificant = certificants.find((c) => c.id === r.certificantId);
        const program = certificationPrograms.find((p) => p.id === r.programId);
        return { ...r, certificantName: certificant?.name ?? "—", programAbbr: program?.abbreviation ?? "—" };
      });
  }, [programFilter]);

  // CE compliance sparkline — simple inline SVG
  const ceCompliance = dashboardStats.ceCompletionRate;

  return (
    <div className="page-container space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl aesthetic-heading"
            style={{ color: "var(--foreground)" }}
          >
            Association Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Certification register · Member standing · Renewal compliance
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-muted-foreground">As of</p>
          <p className="cert-id text-xs">March 8, 2026</p>
        </div>
      </div>

      {/* ── Hero: Association Health Card ── */}
      <div
        className="aesthetic-card relative overflow-hidden"
        style={{ padding: "var(--card-padding)" }}
      >
        {/* Canvas background */}
        <div className="absolute inset-0 pointer-events-none">
          <CredentialNetworkCanvas nodeCount={120} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Main metric */}
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Members in Good Standing
              </p>
              <div className="flex items-end gap-3 mb-3">
                <span
                  className="text-5xl font-bold font-mono tabular-nums"
                  style={{ color: "var(--primary)", letterSpacing: "-0.02em" }}
                >
                  {goodStandingPct}%
                </span>
                <span className="text-sm text-muted-foreground mb-2">
                  of registered certificants
                </span>
              </div>
              {/* Simple inline sparkline bar */}
              <div className="flex items-center gap-2 max-w-xs">
                <div
                  className="h-1.5 rounded-full bg-muted flex-1 overflow-hidden"
                  style={{ background: "var(--muted)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${goodStandingPct}%`,
                      background: "var(--primary)",
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{goodStandingPct}%</span>
              </div>
            </div>

            {/* 3 sub-metrics */}
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
              <div className="border-l-2 pl-4" style={{ borderColor: "var(--success)" }}>
                <p className="text-xs text-muted-foreground mb-1">CE Completion Rate</p>
                <p className="text-xl font-bold font-mono" style={{ color: "var(--foreground)" }}>
                  {dashboardStats.ceCompletionRate}%
                </p>
                <p className="text-xs text-muted-foreground">of active creds on track</p>
              </div>
              <div className="border-l-2 pl-4" style={{ borderColor: "var(--warning)" }}>
                <p className="text-xs text-muted-foreground mb-1">Expiring within 90 days</p>
                <p className="text-xl font-bold font-mono" style={{ color: "var(--foreground)" }}>
                  {dashboardStats.expiringWithin90Days}
                </p>
                <p className="text-xs text-muted-foreground cert-expiry-warn">requires renewal action</p>
              </div>
              <div className="border-l-2 pl-4" style={{ borderColor: "var(--chart-5)" }}>
                <p className="text-xs text-muted-foreground mb-1">Exam Pass Rate</p>
                <p className="text-xl font-bold font-mono" style={{ color: "var(--foreground)" }}>
                  {dashboardStats.examPassRate}%
                </p>
                <p className="text-xs text-muted-foreground">first-attempt success rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Certificants"
          value={dashboardStats.activeCertificants}
          change={dashboardStats.activeCertificantsChange}
          description="· 3 new this week"
          icon={<Users size={15} />}
          index={0}
        />
        <StatCard
          title="Renewal Rate"
          value={dashboardStats.renewalRate}
          change={dashboardStats.renewalRateChange}
          suffix="%"
          decimals={1}
          description="· SLA target 80%"
          icon={<ShieldCheck size={15} />}
          index={1}
        />
        <StatCard
          title="Pending Applications"
          value={dashboardStats.pendingApplications}
          change={dashboardStats.pendingApplicationsChange}
          description="· 4 awaiting docs"
          icon={<FileText size={15} />}
          index={2}
        />
        <StatCard
          title="CE Completion Rate"
          value={dashboardStats.ceCompletionRate}
          change={dashboardStats.ceCompletionRateChange}
          suffix="%"
          decimals={1}
          description="· 11 deficient"
          icon={<BookOpen size={15} />}
          index={3}
          variant={dashboardStats.ceCompletionRateChange < 0 ? "warning" : "default"}
        />
      </div>

      {/* ── Certification Pipeline ── */}
      <div className="aesthetic-card" style={{ padding: "var(--card-padding)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold">Certification Pipeline</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Member journey: Application → Exam → Active → Renewal
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {pipeline.map((step, i) => {
            const barPct = Math.round((step.count / pipelineMax) * 100);
            return (
              <div key={step.label} className="relative">
                {/* Step connector */}
                {i < pipeline.length - 1 && (
                  <div
                    className="absolute right-0 top-1/2 hidden md:block"
                    style={{ transform: "translateY(-50%)" }}
                  >
                    <ChevronRight size={14} className="text-border" />
                  </div>
                )}
                <div
                  className="p-3 rounded border"
                  style={{
                    borderColor: `color-mix(in oklch, ${step.color}, transparent 70%)`,
                    background: `color-mix(in oklch, ${step.color}, transparent 92%)`,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: step.color }}
                    />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {step.label}
                    </span>
                  </div>
                  <p className="text-xl font-bold font-mono tabular-nums mb-2">
                    {step.count.toLocaleString()}
                  </p>
                  <div className="h-1 rounded-full" style={{ background: "var(--border)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${barPct}%`, background: step.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Chart Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Activity — 2/3 width */}
        <div className="aesthetic-card lg:col-span-2" style={{ padding: "var(--card-padding)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold">Monthly Activity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Apr 2025 – Mar 2026</p>
            </div>
            {/* Chart view toggle */}
            <div className="flex gap-1">
              {(["certifications", "renewals"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium border transition-colors",
                    chartView === v
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50"
                  )}
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {v === "certifications" ? "Credentials & Exams" : "Renewals & CE"}
                </button>
              ))}
            </div>
          </div>
          <MonthlyActivityChart data={monthlyActivity} view={chartView} />
        </div>

        {/* Program Breakdown — 1/3 width */}
        <div className="aesthetic-card" style={{ padding: "var(--card-padding)" }}>
          <div className="mb-4">
            <h2 className="text-sm font-semibold">By Program</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Active certificants per credential</p>
          </div>
          <ProgramBreakdownChart data={programBreakdown} />
        </div>
      </div>

      {/* ── Lower Row: Registry Table + Activity Log ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Credential Registry Table — 2/3 */}
        <div className="aesthetic-card lg:col-span-2" style={{ padding: "var(--card-padding)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold">Credential Registry</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Active and pending credentials — filtered view
              </p>
            </div>
            {/* Program filter */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setProgramFilter("all")}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium border transition-colors",
                  programFilter === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/60 text-muted-foreground hover:bg-muted/50"
                )}
                style={{ borderRadius: "var(--radius)" }}
              >
                All
              </button>
              {certificationPrograms.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProgramFilter(p.id)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium border transition-colors cert-id",
                    programFilter === p.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50"
                  )}
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {p.abbreviation}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">
                    Credential No.
                  </th>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium hidden sm:table-cell">
                    Certificant
                  </th>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">
                    Program
                  </th>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">
                    Status
                  </th>
                  <th className="text-left py-2 text-muted-foreground font-medium">
                    Expiry
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCredentials.map((record) => {
                  const variant = credentialStatusVariant(record.status);
                  const isExpiringSoon = record.status === "Expiring Soon" || record.status === "Active – Renewal Due";
                  return (
                    <tr
                      key={record.id}
                      className="border-b aesthetic-hover"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <td className="py-2.5 pr-4">
                        <span className="cert-id">{record.credentialNumber}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-foreground hidden sm:table-cell">
                        {record.certificantName}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="cert-id text-muted-foreground">{record.programAbbr}</span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`cert-status-badge cert-status-badge--${variant}`}>
                          {credentialStatusLabel(record.status)}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={cn("font-mono text-xs", isExpiringSoon && "cert-expiry-warn")}
                        >
                          {record.expiryDate}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Log — 1/3 */}
        <div className="aesthetic-card" style={{ padding: "var(--card-padding)" }}>
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Recent Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Audit trail · last 30 days</p>
          </div>
          <div className="space-y-3">
            {activityLog.slice(0, 8).map((entry) => (
              <div key={entry.id} className="flex gap-2.5">
                <div className="mt-0.5 shrink-0">{activityIcon(entry.action)}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-foreground leading-snug line-clamp-2">
                    {entry.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="cert-id text-muted-foreground" style={{ fontSize: "10px" }}>
                      {entry.entityLabel.split(" — ")[0]}
                    </span>
                    <span className="text-muted-foreground" style={{ fontSize: "10px" }}>
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Conversion Banner ── */}
      <div
        className="mt-2 p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          borderColor: "color-mix(in oklch, var(--primary), transparent 80%)",
          background: "color-mix(in oklch, var(--primary), transparent 96%)",
          borderRadius: "var(--radius)",
        }}
      >
        <div>
          <p className="text-sm font-medium text-foreground">
            Live demo built for{" "}
            {APP_CONFIG.clientName ?? APP_CONFIG.projectName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Humam · Full-Stack Developer · Available now
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/challenges"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            style={{ transitionDuration: "var(--dur-fast)" }}
          >
            My Approach →
          </a>
          <a
            href="/proposal"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border transition-colors"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              borderColor: "var(--primary)",
              borderRadius: "var(--radius)",
              transitionDuration: "var(--dur-fast)",
            }}
          >
            Work with me
          </a>
        </div>
      </div>
    </div>
  );
}
