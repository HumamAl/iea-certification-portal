"use client";

import { useEffect, useRef, useState } from "react";

interface MetricBar {
  label: string;
  before: number;
  after: number;
  unit: string;
  status: "success" | "warning" | "destructive";
  lowerIsBetter?: boolean;
}

const metrics: MetricBar[] = [
  {
    label: "Time to recover from a bad deployment",
    before: 100,
    after: 8,
    unit: "% of original",
    status: "success",
    lowerIsBetter: true,
  },
  {
    label: "Changes traceable to author and date",
    before: 0,
    after: 100,
    unit: "%",
    status: "success",
    lowerIsBetter: false,
  },
  {
    label: "Risk of silent data corruption on deploy",
    before: 100,
    after: 5,
    unit: "% relative risk",
    status: "success",
    lowerIsBetter: true,
  },
  {
    label: "Staff confidence deploying new features",
    before: 30,
    after: 88,
    unit: "% (self-reported)",
    status: "success",
    lowerIsBetter: false,
  },
];

export function ModernizationMetricsViz() {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="space-y-4">
      <div className="flex items-center gap-4 mb-1">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-4 rounded-sm" style={{ background: "color-mix(in oklch, var(--border) 80%, transparent)" }} />
          <span className="text-[10px] text-muted-foreground">Before</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-4 rounded-sm" style={{ background: "var(--success)" }} />
          <span className="text-[10px] text-muted-foreground">After</span>
        </div>
      </div>

      {metrics.map((metric, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-foreground/80 flex-1">{metric.label}</p>
            <span className="text-[10px] font-mono text-muted-foreground shrink-0 tabular-nums">
              {metric.before}% → {metric.after}%
            </span>
          </div>
          {/* Before bar (muted) */}
          <div className="h-1.5 rounded-sm overflow-hidden" style={{ background: "var(--muted)" }}>
            <div
              className="h-full rounded-sm transition-all duration-700"
              style={{
                width: triggered ? `${metric.before}%` : "0%",
                background: "color-mix(in oklch, var(--border) 90%, var(--muted-foreground))",
                transitionDelay: `${i * 80}ms`,
                transitionTimingFunction: "cubic-bezier(0.25, 0, 0.25, 1)",
              }}
            />
          </div>
          {/* After bar (success) */}
          <div className="h-2 rounded-sm overflow-hidden" style={{ background: "var(--muted)" }}>
            <div
              className="h-full rounded-sm transition-all duration-700"
              style={{
                width: triggered ? `${metric.after}%` : "0%",
                background: "var(--success)",
                transitionDelay: `${i * 80 + 200}ms`,
                transitionTimingFunction: "cubic-bezier(0.25, 0, 0.25, 1)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
