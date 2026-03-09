import type { Challenge } from "@/lib/types";

export const executiveSummary = {
  commonApproach:
    "Most developers hired on a legacy PHP codebase will start adding new features directly — often breaking something quiet and critical that nobody notices until a member can't renew.",
  differentApproach:
    "I start with a forensic read of the existing system — mapping the data relationships, documenting undocumented logic, and building a change-safe understanding of what the codebase actually does — before touching a single line.",
  accentWord: "forensic read",
};

export const challenges: Challenge[] = [
  {
    id: "legacy-codebase",
    title: "Navigating a Legacy, Undocumented Codebase",
    description:
      "The portal has grown through years of direct server edits and tribal knowledge. Understanding what a change will break requires reading the system like an archaeologist — not a developer. Jumping straight to feature work without this step is how certification data gets corrupted.",
    visualizationType: "before-after",
    outcome:
      "Could eliminate the 'archaeological coding' cycle — where every new feature requires hours of manual tracing through undocumented logic before a single line can be written.",
  },
  {
    id: "schema-evolution",
    title: "Adding New Certifications Without Breaking Existing Data",
    description:
      "When the client says 'we need a Radon certification,' the real work is identifying every place the schema change ripples — credential records, CE tracking, exam eligibility, renewal rules. A new program type isn't a row insert; it's a system-wide dependency audit.",
    visualizationType: "flow",
    outcome:
      "Could reduce the time to launch a new certification type from weeks of manual discovery to a documented, repeatable schema extension process — with zero impact to existing member records.",
  },
  {
    id: "modernization-safety",
    title: "Introducing Git and Version Control Without Disrupting Operations",
    description:
      "The current workflow — direct SFTP edits to a live server — means every change is permanent and unrecoverable. Introducing version control isn't a technical lift; it's a workflow and trust change. Done wrong, it creates rollback anxiety that slows everything down.",
    visualizationType: "metrics",
    outcome:
      "Could establish a zero-downtime deployment baseline — where every change is staged, reviewable, and reversible — without disrupting the organization's existing staff capabilities or daily operations.",
  },
];
