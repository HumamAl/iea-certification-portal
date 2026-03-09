import type { ReactNode } from "react";
import { Database, FileSearch, GitBranch, CheckSquare, RefreshCcw } from "lucide-react";

interface FlowStep {
  label: string;
  detail: string;
  icon: ReactNode;
  highlight?: boolean;
}

const steps: FlowStep[] = [
  {
    label: "Request",
    detail: '"We need Radon certification"',
    icon: <FileSearch className="h-4 w-4" />,
  },
  {
    label: "Dependency Audit",
    detail: "Map every table and field the new program touches",
    icon: <Database className="h-4 w-4" />,
    highlight: true,
  },
  {
    label: "Schema Extension",
    detail: "Add program record with constraints — no existing data touched",
    icon: <GitBranch className="h-4 w-4" />,
    highlight: true,
  },
  {
    label: "Verification",
    detail: "Existing member records validated against new schema",
    icon: <CheckSquare className="h-4 w-4" />,
  },
  {
    label: "Live",
    detail: "New certification type active — member dashboard updated",
    icon: <RefreshCcw className="h-4 w-4" />,
  },
];

export function SchemaFlowViz() {
  return (
    <div className="space-y-1">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-3">
          {/* Connector column */}
          <div className="flex flex-col items-center shrink-0 pt-2.5">
            <div
              className="h-7 w-7 rounded-sm flex items-center justify-center shrink-0"
              style={
                step.highlight
                  ? {
                      background: "color-mix(in oklch, var(--primary) 12%, transparent)",
                      border: "1px solid color-mix(in oklch, var(--primary) 30%, transparent)",
                      color: "var(--primary)",
                    }
                  : {
                      background: "var(--muted)",
                      border: "1px solid var(--border)",
                      color: "var(--muted-foreground)",
                    }
              }
            >
              {step.icon}
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-px mt-1 flex-1"
                style={{
                  minHeight: "1.25rem",
                  background: step.highlight
                    ? "color-mix(in oklch, var(--primary) 25%, transparent)"
                    : "var(--border)",
                }}
              />
            )}
          </div>

          {/* Content */}
          <div className="pb-3 flex-1">
            <div className="flex items-baseline gap-2">
              <p
                className="text-xs font-semibold"
                style={{ color: step.highlight ? "var(--primary)" : "var(--foreground)" }}
              >
                {step.label}
              </p>
              {step.highlight && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm"
                  style={{
                    background: "color-mix(in oklch, var(--primary) 10%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  key step
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
