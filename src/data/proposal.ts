import type { Profile, PortfolioProject } from "@/lib/types";

export const profile: Profile = {
  name: "Humam",
  tagline:
    "Full-stack developer who steps into existing systems, learns their logic, and extends them without breaking what works.",
  bio: "Legacy systems aren't problems to escape — they're environments to understand. I've worked in codebases where the original developer is long gone and the documentation is the code itself. I read the queries, trace the workflows, and move carefully.",
  approach: [
    {
      title: "Audit & Map",
      description:
        "Trace the live system's logic before writing a line. Read the schema, find the business rules buried in stored procedures, and document what I find.",
    },
    {
      title: "Stabilize & Document",
      description:
        "Version control, backup procedures, and a written record of the parts I've touched — so tribal knowledge starts becoming transferable knowledge.",
    },
    {
      title: "Translate Requirements",
      description:
        "Sit with stakeholders to bridge what the business needs and what the database allows. Specs that ignore the data model cause rewrites.",
    },
    {
      title: "Build & Validate",
      description:
        "Implement features within the existing framework, tested against live data patterns. Working code that fits the system, not against it.",
    },
    {
      title: "Handoff & Transfer",
      description:
        "Documentation and inline notes so the next developer doesn't need archaeology — just reading.",
    },
  ],
  skillCategories: [
    {
      name: "Legacy Stack",
      skills: ["PHP", "MySQL", "Linux / SSH", "Apache", "Server Administration"],
    },
    {
      name: "Frontend",
      skills: ["JavaScript", "HTML / CSS", "jQuery", "Responsive Design"],
    },
    {
      name: "Workflow & Tooling",
      skills: ["Git", "Database Design", "SQL Query Optimization", "cPanel / WHM"],
    },
    {
      name: "Modern Layer",
      skills: ["Next.js", "TypeScript", "REST API Design", "Node.js"],
    },
  ],
};

export const portfolioProjects: PortfolioProject[] = [
  {
    id: "auction-violations",
    title: "Auction Violations Monitor",
    description:
      "Compliance monitoring tool tracking violations, seller behavior, and enforcement actions across auction activity.",
    tech: ["Next.js", "TypeScript", "Tailwind", "shadcn/ui"],
    outcome:
      "Compliance dashboard with violation detection, seller flagging, and enforcement action tracking",
    liveUrl: "https://auction-violations.vercel.app",
    relevance: "Enforcement workflows, compliance record-keeping, and status-driven data — directly mirrors certification credential management.",
  },
  {
    id: "tinnitus-therapy",
    title: "Tinnitus Therapy SaaS",
    description:
      "Multi-clinic patient management platform with treatment protocol tracking, progress dashboards, and session records.",
    tech: ["Next.js", "TypeScript", "Tailwind", "shadcn/ui", "Recharts"],
    outcome:
      "Multi-clinic SaaS covering the full patient journey — intake, protocol assignment, session tracking, and outcome dashboards",
    liveUrl: "https://tinnitus-therapy.vercel.app",
    relevance: "Multi-location membership management, status tracking, and renewal workflows — structural parallel to a certification portal.",
  },
  {
    id: "fleet-maintenance",
    title: "Fleet Maintenance SaaS",
    description:
      "6-module operations platform with asset tracking, work orders, compliance scheduling, parts inventory, and analytics.",
    tech: ["Next.js", "TypeScript", "Tailwind", "shadcn/ui", "Recharts"],
    outcome:
      "6-module SaaS covering the full maintenance lifecycle — from asset registry to work orders to parts inventory",
    relevance: "Complex relational data across multiple modules, compliance scheduling, and audit-trail-style history — the same data architecture challenges as a certification system.",
  },
  {
    id: "payguard",
    title: "PayGuard — Transaction Monitor",
    description:
      "Compliance monitoring dashboard with real-time flagging, alert management, and enforcement action tracking.",
    tech: ["Next.js", "TypeScript", "Tailwind", "shadcn/ui", "Recharts"],
    outcome:
      "Compliance monitoring dashboard with transaction flagging, multi-account linking, and alert delivery tracking",
    liveUrl: "https://payment-monitor.vercel.app",
    relevance: "Status-driven compliance records, alert workflows, and enforcement queues — the compliance logic maps directly to credential suspension and audit triggers.",
  },
];
