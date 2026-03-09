"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import type { MonthlyActivityPoint } from "@/lib/types";

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="aesthetic-card p-3 text-sm min-w-[180px]" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}>
      <p className="font-semibold mb-2 text-foreground">{label}</p>
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

interface MonthlyActivityChartProps {
  data: MonthlyActivityPoint[];
  view: "certifications" | "renewals";
}

export function MonthlyActivityChart({ data, view }: MonthlyActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id="fillCert" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.22} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillRenew" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.22} />
            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillExam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.22} />
            <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: string) => v.replace(" 20", " '")}
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
        {view === "certifications" ? (
          <>
            <Area
              type="monotone"
              dataKey="certificationsIssued"
              name="Credentials Issued"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#fillCert)"
              dot={false}
              activeDot={{ r: 3, fill: "var(--chart-1)" }}
            />
            <Area
              type="monotone"
              dataKey="examsAdministered"
              name="Exams Administered"
              stroke="var(--chart-3)"
              strokeWidth={1.5}
              fill="url(#fillExam)"
              dot={false}
              activeDot={{ r: 3, fill: "var(--chart-3)" }}
            />
          </>
        ) : (
          <>
            <Area
              type="monotone"
              dataKey="renewalsProcessed"
              name="Renewals Processed"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fill="url(#fillRenew)"
              dot={false}
              activeDot={{ r: 3, fill: "var(--chart-2)" }}
            />
            <Area
              type="monotone"
              dataKey="ceCreditsLogged"
              name="CE Credits Logged"
              stroke="var(--chart-4)"
              strokeWidth={1.5}
              fill="url(#fillCert)"
              dot={false}
              activeDot={{ r: 3, fill: "var(--chart-4)" }}
            />
          </>
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
