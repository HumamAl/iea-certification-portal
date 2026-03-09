import { ExternalLink, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG } from "@/lib/config";
import { profile, portfolioProjects } from "@/data/proposal";

export const metadata = { title: "Work With Me | IEA Portal" };

export default function ProposalPage() {
  const { name, tagline, approach, skillCategories } = profile;
  const clientLabel = APP_CONFIG.clientName ?? APP_CONFIG.projectName;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-5 py-10 md:px-6 space-y-12">

        {/* ── HERO: Asymmetric Corporate Split ── */}
        <section className="border border-border/60 rounded-[var(--radius)] overflow-hidden">
          {/* Header bar */}
          <div
            className="border-b border-border/50 px-6 py-2.5 flex items-center justify-between"
            style={{ backgroundColor: "oklch(0.42 0.12 var(--primary-h) / 0.08)" }}
          >
            <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
              Full-Stack Developer · Proposal
            </span>
            {/* Effort badge */}
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              Built this demo for your project
            </div>
          </div>

          {/* Two-column split */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto]">
            {/* Left: name + value prop */}
            <div className="px-6 py-8 space-y-3 border-b md:border-b-0 md:border-r border-border/40">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {name}
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                {tagline}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg pt-1">
                I can join {clientLabel} as a second developer, take on feature work
                independently, and not require hand-holding on an unfamiliar stack.
                Legacy PHP/MySQL is where I&apos;m comfortable &mdash; not where I&apos;m reluctant.
              </p>
            </div>

            {/* Right: stats */}
            <div className="px-6 py-8 flex flex-row md:flex-col justify-around md:justify-center gap-6 md:gap-8 md:min-w-[160px]">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground tabular-nums">24+</div>
                <div className="text-xs text-muted-foreground mt-0.5">Projects Shipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground tabular-nums">15+</div>
                <div className="text-xs text-muted-foreground mt-0.5">Industries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground tabular-nums">&lt; 48hr</div>
                <div className="text-xs text-muted-foreground mt-0.5">Demo Turnaround</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROOF OF WORK ── */}
        <section className="space-y-5">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-1">
              Proof of Work
            </p>
            <h2 className="text-xl font-bold tracking-tight">Relevant Projects</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Built for real clients, shipped to production.
            </p>
          </div>

          {/* Compact list — dense, institutional, scannable */}
          <div className="border border-border/60 rounded-[var(--radius)] overflow-hidden divide-y divide-border/40">
            {portfolioProjects.map((project) => (
              <div key={project.id} className="px-5 py-4 space-y-2 hover:bg-surface-hover transition-colors duration-[var(--dur-fast)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{project.title}</span>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors duration-[var(--dur-fast)] shrink-0"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Outcome */}
                {project.outcome && (
                  <div
                    className="flex items-start gap-2 rounded-[var(--radius)] px-3 py-1.5"
                    style={{
                      backgroundColor: "color-mix(in oklch, var(--success) 6%, transparent)",
                      border: "1px solid color-mix(in oklch, var(--success) 15%, transparent)",
                    }}
                  >
                    <TrendingUp className="h-3 w-3 mt-0.5 shrink-0 text-[color:var(--success)]" />
                    <p className="text-xs font-medium text-[color:var(--success)]">
                      {project.outcome}
                    </p>
                  </div>
                )}

                {/* Relevance note */}
                {project.relevance && (
                  <p className="text-xs text-muted-foreground/70 italic leading-relaxed">
                    {project.relevance}
                  </p>
                )}

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {project.tech.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="font-mono text-xs px-2 py-0.5 rounded-[var(--radius)] border-border/60 text-muted-foreground"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW I WORK: Vertical Timeline ── */}
        <section className="space-y-5">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-1">
              Process
            </p>
            <h2 className="text-xl font-bold tracking-tight">How I Work on Legacy Systems</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Joining an existing codebase is different from building fresh. This is how I approach it.
            </p>
          </div>

          <div className="space-y-0 relative">
            {approach.map((step, i) => {
              const timelines = ["Week 1", "Week 1–2", "Week 2", "Ongoing", "End of engagement"];
              return (
                <div key={step.title} className="flex gap-4 relative">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center shrink-0 pt-1">
                    <div
                      className="h-6 w-6 rounded-[var(--radius)] border-2 border-primary/40 flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "color-mix(in oklch, var(--primary) 8%, var(--background))" }}
                    >
                      <span className="font-mono text-[10px] font-bold text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    {i < approach.length - 1 && (
                      <div className="w-px flex-1 my-1 bg-border/40" style={{ minHeight: "1.5rem" }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-6 min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3 mb-0.5">
                      <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                      <span className="font-mono text-xs text-muted-foreground/70 shrink-0">
                        {timelines[i]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SKILLS: Grouped Sections ── */}
        <section className="space-y-5">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-1">
              Technical Fit
            </p>
            <h2 className="text-xl font-bold tracking-tight">Skills for This Role</h2>
          </div>

          <div className="border border-border/60 rounded-[var(--radius)] overflow-hidden divide-y divide-border/40">
            {skillCategories.map((cat) => (
              <div key={cat.name} className="flex gap-4 px-5 py-3.5 items-start">
                <span className="font-mono text-xs uppercase text-muted-foreground w-28 shrink-0 pt-0.5">
                  {cat.name}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="font-mono text-xs px-2 py-0.5 rounded-[var(--radius)]"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA: Dark Panel ── */}
        <section
          className="rounded-[var(--radius)] px-8 py-10 md:px-10 space-y-4"
          style={{ background: "oklch(0.10 0.02 var(--primary-h))" }}
        >
          {/* Availability */}
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--success)]/60 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--success)]" />
            </span>
            <span className="text-xs text-white/50">Currently available for new projects</span>
          </div>

          <h2 className="text-xl font-light text-white/70 leading-snug max-w-md">
            Ready to keep{" "}
            <span className="font-bold text-white">{clientLabel}</span> running
            while making it better.
          </h2>

          <p className="text-sm text-white/50 leading-relaxed max-w-lg">
            The members who depend on this portal can&apos;t wait for a rewrite. I work
            in the system as it is &mdash; stable first, improved second, no surprises.
          </p>

          <p className="text-sm font-medium text-primary pt-1">
            Reply on Upwork to start
          </p>

          <a
            href="/"
            className="block text-xs text-white/30 hover:text-white/50 transition-colors duration-[var(--dur-fast)] pt-2"
          >
            ← Back to the demo
          </a>

          <p className="text-sm text-white/30 pt-2">— Humam</p>
        </section>

      </div>
    </div>
  );
}
