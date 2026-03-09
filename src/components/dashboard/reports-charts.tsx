"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  monthlyActivity,
  programBreakdown,
  ceComplianceTrend,
} from "@/data/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BURGUNDY = "oklch(0.42 0.12 15)";
const AMBER = "oklch(0.75 0.18 75)";
const TEAL = "oklch(0.58 0.07 195)";
const ROSE = "oklch(0.55 0.08 345)";
const MUTED_BG = "oklch(0.97 0.003 15)";

const PROGRAM_COLORS = [
  "oklch(0.42 0.12 15)",
  "oklch(0.52 0.10 45)",
  "oklch(0.55 0.08 345)",
  "oklch(0.48 0.09 75)",
  "oklch(0.58 0.07 195)",
  "oklch(0.50 0.11 25)",
  "oklch(0.54 0.09 60)",
  "oklch(0.56 0.07 320)",
];

function CustomTooltipStyle({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "0.75rem",
        fontSize: "0.75rem",
        boxShadow: "var(--card-shadow)",
      }}
    >
      {label && (
        <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{label}</p>
      )}
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: p.color,
            }}
          />
          <span style={{ color: "var(--muted-foreground)" }}>{p.name}:</span>
          <span style={{ fontWeight: 500 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ActivityAreaChart({ metric }: { metric: "certifications" | "renewals" | "exams" }) {
  const keyMap = {
    certifications: { key: "certificationsIssued", label: "Certifications Issued", color: BURGUNDY },
    renewals: { key: "renewalsProcessed", label: "Renewals Processed", color: AMBER },
    exams: { key: "examsAdministered", label: "Exams Administered", color: TEAL },
  };
  const m = keyMap[metric];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={monthlyActivity} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltipStyle />} />
        <Area
          type="monotone"
          dataKey={m.key}
          name={m.label}
          stroke={m.color}
          fill={m.color}
          fillOpacity={0.12}
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ProgramBarChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={programBreakdown}
        margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="programAbbreviation"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltipStyle />} />
        <Legend wrapperStyle={{ fontSize: "11px" }} />
        <Bar dataKey="activeCertificants" name="Active" fill={BURGUNDY} radius={[2, 2, 0, 0]} />
        <Bar dataKey="renewalsDue" name="Renewals Due" fill={AMBER} radius={[2, 2, 0, 0]} />
        <Bar dataKey="ceCompliant" name="CE Compliant" fill={TEAL} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CEComplianceAreaChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={ceComplianceTrend}
        margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltipStyle />} />
        <Legend wrapperStyle={{ fontSize: "11px" }} />
        <Area
          type="monotone"
          dataKey="compliant"
          name="Compliant"
          stroke={TEAL}
          fill={TEAL}
          fillOpacity={0.15}
          strokeWidth={2}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="deficient"
          name="CE Deficient"
          stroke={BURGUNDY}
          fill={BURGUNDY}
          fillOpacity={0.12}
          strokeWidth={2}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="pending"
          name="Pending"
          stroke={AMBER}
          fill={AMBER}
          fillOpacity={0.10}
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ProgramPieChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={programBreakdown}
          dataKey="activeCertificants"
          nameKey="programAbbreviation"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
        >
          {programBreakdown.map((entry, index) => (
            <Cell
              key={entry.programAbbreviation}
              fill={PROGRAM_COLORS[index % PROGRAM_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0];
            return (
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.75rem",
                }}
              >
                <p style={{ fontWeight: 600 }}>{d.name}</p>
                <p style={{ color: "var(--muted-foreground)" }}>
                  {d.value} active
                </p>
              </div>
            );
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: "11px" }}
          formatter={(value) => value}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
