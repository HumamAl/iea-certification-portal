import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { executiveSummary, challenges } from "@/data/challenges";
import { BeforeAfterViz } from "@/components/challenges/before-after-viz";
import { SchemaFlowViz } from "@/components/challenges/schema-flow-viz";
import { ModernizationMetricsViz } from "@/components/challenges/modernization-metrics-viz";
import { OutcomeBadge } from "@/components/challenges/outcome-badge";

function ChallengeNumber({ n }: { n: number }) {
  return (
    <span
      className="text-[4rem] font-extralight leading-none select-none"
      style={{ color: "color-mix(in oklch, var(--primary) 12%, transparent)" }}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

export default function ChallengesPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>

      {/* ── Executive Summary Banner ─────────────────────────── */}
      <div style={{ background: "var(--section-dark)" }}>
        <div className="max-w-4xl mx-auto px-6 py-10">

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-80"
            style={{ color: "oklch(0.75 0.04 15)" }}
          >
            <ArrowLeft className="h-3 w-3" />
            Back to the live demo
          </Link>

          {/* Page heading */}
          <h1
            className="text-2xl font-semibold mb-6"
            style={{ color: "oklch(0.95 0.01 15)", letterSpacing: "-0.01em" }}
          >
            How I&apos;d Approach Your Certification Portal
          </h1>

          {/* Split contrast: common vs. different */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="rounded-sm p-4"
              style={{
                background: "oklch(0.14 0.02 15)",
                border: "1px solid oklch(0.22 0.03 15)",
              }}
            >
              <p
                className="text-[10px] font-medium uppercase tracking-wider mb-2"
                style={{ color: "oklch(0.55 0.06 15)" }}
              >
                Common approach
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "oklch(0.72 0.03 15)" }}>
                {executiveSummary.commonApproach}
              </p>
            </div>
            <div
              className="rounded-sm p-4"
              style={{
                background: "oklch(0.14 0.02 15)",
                border: "1px solid color-mix(in oklch, var(--primary) 35%, transparent)",
              }}
            >
              <p
                className="text-[10px] font-medium uppercase tracking-wider mb-2"
                style={{ color: "color-mix(in oklch, var(--primary) 70%, oklch(0.75 0 0))" }}
              >
                My approach
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "oklch(0.88 0.02 15)" }}>
                I start with a{" "}
                <span className="font-semibold text-primary">
                  {executiveSummary.accentWord}
                </span>{" "}
                of the existing system — mapping the data relationships, documenting undocumented logic, and building a change-safe understanding of what the codebase actually does — before touching a single line.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Challenges ─────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6">

        {/* Transitional rule */}
        <div className="border-t pt-12 mt-0" style={{ borderColor: "var(--border)" }} />

        {/* Challenge 1 — text left, viz right */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-start gap-3 mb-3">
                <ChallengeNumber n={1} />
                <div className="pt-3">
                  <h2
                    className="text-base font-semibold leading-snug"
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    {challenges[0].title}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {challenges[0].description}
              </p>
            </div>
            <OutcomeBadge text={challenges[0].outcome!} />
          </div>

          <div className="aesthetic-card" style={{ padding: "var(--card-padding-sm)" }}>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Current state vs. with my approach
            </p>
            <BeforeAfterViz />
          </div>
        </div>

        {/* Spacer */}
        <div className="py-12" />

        {/* Challenge 2 — viz left, text right (alternating) */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Viz first on desktop */}
          <div className="aesthetic-card order-2 lg:order-1" style={{ padding: "var(--card-padding-sm)" }}>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Schema extension process
            </p>
            <SchemaFlowViz />
          </div>

          <div className="flex flex-col justify-between gap-6 order-1 lg:order-2">
            <div>
              <div className="flex items-start gap-3 mb-3">
                <ChallengeNumber n={2} />
                <div className="pt-3">
                  <h2
                    className="text-base font-semibold leading-snug"
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    {challenges[1].title}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {challenges[1].description}
              </p>
            </div>
            <OutcomeBadge text={challenges[1].outcome!} />
          </div>
        </div>

        {/* Spacer */}
        <div className="py-12" />

      </div>

      {/* Challenge 3 — full-bleed tinted section for visual weight variation */}
      <div
        style={{
          background: "color-mix(in oklch, var(--primary) 4%, var(--background))",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <ChallengeNumber n={3} />
                  <div className="pt-3">
                    <h2
                      className="text-base font-semibold leading-snug"
                      style={{ letterSpacing: "-0.01em" }}
                    >
                      {challenges[2].title}
                    </h2>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {challenges[2].description}
                </p>
              </div>
              <OutcomeBadge text={challenges[2].outcome!} />
            </div>

            <div className="aesthetic-card" style={{ padding: "var(--card-padding-sm)" }}>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Before and after — key operational metrics
              </p>
              <ModernizationMetricsViz />
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA Closer ─────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-14 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          These aren&apos;t hypotheticals. They&apos;re the actual things I&apos;d tackle first.
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          Reply on Upwork to start — or read how I work first.
        </p>
        <Link
          href="/proposal"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
        >
          See the proposal
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

    </div>
  );
}
