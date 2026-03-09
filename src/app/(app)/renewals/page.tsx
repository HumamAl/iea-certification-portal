"use client";

import { useState, useMemo } from "react";
import { renewalQueue } from "@/data/mock-data";
import type { RenewalPaymentStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Bell, AlertTriangle, CheckCircle } from "lucide-react";

type UrgencyFilter = "all" | "overdue" | "this-week" | "this-month" | "this-quarter";

function getUrgencyTier(days: number): "overdue" | "this-week" | "this-month" | "this-quarter" | "upcoming" {
  if (days < 0) return "overdue";
  if (days <= 7) return "this-week";
  if (days <= 30) return "this-month";
  if (days <= 90) return "this-quarter";
  return "upcoming";
}

function UrgencyBadge({ days }: { days: number }) {
  const tier = getUrgencyTier(days);
  if (tier === "overdue") {
    return <span className="cert-status-badge cert-status-badge--expired">Overdue ({Math.abs(days)}d)</span>;
  }
  if (tier === "this-week") {
    return <span className="cert-status-badge cert-status-badge--expiring">This Week</span>;
  }
  if (tier === "this-month") {
    return <span className="cert-status-badge cert-status-badge--expiring">{days}d</span>;
  }
  return <span className="cert-status-badge cert-status-badge--pending">{days}d</span>;
}

function PaymentBadge({ status }: { status: RenewalPaymentStatus }) {
  const map: Record<RenewalPaymentStatus, string> = {
    Paid: "cert-status-badge cert-status-badge--active",
    Pending: "cert-status-badge cert-status-badge--pending",
    Overdue: "cert-status-badge cert-status-badge--expired",
    Waived: "cert-status-badge cert-status-badge--active",
    Failed: "cert-status-badge cert-status-badge--expired",
  };
  return <span className={map[status]}>{status}</span>;
}

const URGENCY_FILTERS: { value: UrgencyFilter; label: string }[] = [
  { value: "all", label: "All Renewals" },
  { value: "overdue", label: "Overdue" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
  { value: "this-quarter", label: "This Quarter" },
];

export default function RenewalsPage() {
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const displayed = useMemo(() => {
    return renewalQueue
      .filter((r) => {
        const tier = getUrgencyTier(r.daysUntilExpiry);
        if (urgencyFilter !== "all" && tier !== urgencyFilter) return false;
        if (paymentFilter !== "all" && r.paymentStatus !== paymentFilter) return false;
        return true;
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [urgencyFilter, paymentFilter]);

  const overdueCount = renewalQueue.filter((r) => r.daysUntilExpiry < 0).length;
  const thisWeekCount = renewalQueue.filter(
    (r) => r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= 7
  ).length;
  const pendingPaymentCount = renewalQueue.filter(
    (r) => r.paymentStatus === "Pending" || r.paymentStatus === "Overdue" || r.paymentStatus === "Failed"
  ).length;

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight aesthetic-heading">
            Renewal Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upcoming and overdue credential renewals, sorted by urgency
          </p>
        </div>
      </div>

      {/* Summary banners */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: <AlertTriangle className="w-4 h-4" />,
            label: "Overdue",
            value: overdueCount,
            color: "text-destructive",
            bg: "bg-destructive/8 border-destructive/20",
            filter: "overdue" as UrgencyFilter,
          },
          {
            icon: <Bell className="w-4 h-4" />,
            label: "Expiring This Week",
            value: thisWeekCount,
            color: "text-[color:var(--warning)]",
            bg: "bg-[color:var(--warning)]/8 border-[color:var(--warning)]/20",
            filter: "this-week" as UrgencyFilter,
          },
          {
            icon: <CheckCircle className="w-4 h-4" />,
            label: "Payment Outstanding",
            value: pendingPaymentCount,
            color: "text-foreground",
            bg: "bg-muted/30",
            filter: "all" as UrgencyFilter,
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className={cn(
              "cursor-pointer border transition-colors hover:border-primary/30",
              urgencyFilter === stat.filter ? stat.bg : ""
            )}
            onClick={() =>
              setUrgencyFilter(urgencyFilter === stat.filter ? "all" : stat.filter)
            }
          >
            <div className="p-4 flex items-center gap-3">
              <span className={cn(stat.color)}>{stat.icon}</span>
              <div>
                <p className={cn("text-2xl font-semibold tabular-nums", stat.color)}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Urgency filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {URGENCY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setUrgencyFilter(f.value)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors",
              urgencyFilter === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-[color:var(--surface-hover)]"
            )}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-xs border border-border rounded-sm px-2 py-1.5 bg-background text-foreground"
          >
            <option value="all">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
        <span className="text-sm text-muted-foreground">
          {displayed.length} renewal{displayed.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {["Certificant", "Credential #", "Program", "Expiry Date", "Urgency", "CE Progress", "Renewal Fee", "Payment", "Reminders"].map(
                  (h) => (
                    <TableHead
                      key={h}
                      className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    >
                      {h}
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No renewals match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((r) => {
                  const cePercent = r.ceHoursRequired > 0
                    ? Math.min(100, Math.round((r.ceHoursCompleted / r.ceHoursRequired) * 100))
                    : 100;
                  const tier = getUrgencyTier(r.daysUntilExpiry);
                  return (
                    <TableRow
                      key={r.id}
                      className={cn(
                        "hover:bg-[color:var(--surface-hover)] transition-colors",
                        tier === "overdue" && "bg-destructive/3"
                      )}
                    >
                      <TableCell className="font-medium text-sm">
                        {r.certificantName}
                      </TableCell>
                      <TableCell>
                        <span className="cert-id">{r.credentialNumber}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded-sm">
                          {r.programAbbreviation}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        <span
                          className={cn(
                            r.daysUntilExpiry > 0 &&
                              r.daysUntilExpiry <= 30 &&
                              "cert-expiry-warn"
                          )}
                        >
                          {r.expiryDate}
                        </span>
                      </TableCell>
                      <TableCell>
                        <UrgencyBadge days={r.daysUntilExpiry} />
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <Progress value={cePercent} className="h-1.5 flex-1" />
                          <span className="text-xs tabular-nums text-muted-foreground w-14 text-right shrink-0">
                            {r.ceHoursCompleted}/{r.ceHoursRequired}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm tabular-nums font-mono">
                        ${r.renewalFee.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <PaymentBadge status={r.paymentStatus} />
                      </TableCell>
                      <TableCell className="text-sm tabular-nums text-muted-foreground">
                        {r.remindersSent}
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
