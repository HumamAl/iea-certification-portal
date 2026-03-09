"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import type { ProgramBreakdownPoint } from "@/lib/types";

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="aesthetic-card p-3 text-sm min-w-[160px]" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}>
      <p className="font-semibold mb-2 text-foreground cert-id">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-muted-foreground flex items-center gap-2 text-xs">
          <span
            className="inline-block w-2 h-2 shrink-0"
            style={{ backgroundColor: entry.color as string }}
          />
          <span className="flex-1">{entry.name}:</span>
          <span className="font-mono font-medium text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export function ProgramBreakdownChart({ data }: { data: ProgramBreakdownPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
        <XAxis
          dataKey="programAbbreviation"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-geist-mono)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
          iconType="square"
          iconSize={8}
        />
        <Bar
          dataKey="activeCertificants"
          name="Active Certificants"
          fill="var(--chart-1)"
          radius={[2, 2, 0, 0]}
          maxBarSize={32}
        />
        <Bar
          dataKey="ceCompliant"
          name="CE Compliant"
          fill="var(--chart-5)"
          radius={[2, 2, 0, 0]}
          maxBarSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
