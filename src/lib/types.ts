import type { LucideIcon } from "lucide-react";

// Sidebar navigation
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Challenge visualization types
export type VisualizationType =
  | "flow"
  | "before-after"
  | "metrics"
  | "architecture"
  | "risk-matrix"
  | "timeline"
  | "dual-kpi"
  | "tech-stack"
  | "decision-flow";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  visualizationType: VisualizationType;
  outcome?: string;
}

// Proposal types
export interface Profile {
  name: string;
  tagline: string;
  bio: string;
  approach: { title: string; description: string }[];
  skillCategories: { name: string; skills: string[] }[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  tech: string[];
  relevance?: string;
  outcome?: string;
  liveUrl?: string;
}

// Screen definition for frame-based demo formats
export interface DemoScreen {
  id: string;
  label: string;
  icon?: LucideIcon;
  href: string;
}

// Conversion element variant types
export type ConversionVariant = "sidebar" | "inline" | "floating" | "banner";

// ============================================================
// IEA Certification Portal — Domain Type Definitions
// ============================================================

// ------ Credential Status ------

export type CredentialStatus =
  | "Active"
  | "Active – Renewal Due"
  | "Expiring Soon"
  | "CE Deficient"
  | "Lapsed"
  | "Suspended"
  | "Pending Exam"
  | "Under Review"
  | "Pending Payment"
  | "Reinstated"
  | "Revoked";

// ------ Application Status ------

export type ApplicationStatus =
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Awaiting Documentation"
  | "Pending Payment";

// ------ CE Credit Category ------

export type CECategory = "I" | "II";

// ------ Exam Attempt Number ------

export type ExamAttemptNumber = "1st" | "2nd" | "3rd" | "4th";

// ------ Renewal Payment Status ------

export type RenewalPaymentStatus =
  | "Paid"
  | "Pending"
  | "Overdue"
  | "Waived"
  | "Failed";

// ------ Activity Action Types ------

export type ActivityAction =
  | "credential_issued"
  | "credential_renewed"
  | "credential_lapsed"
  | "credential_suspended"
  | "exam_passed"
  | "exam_failed"
  | "ce_credit_approved"
  | "ce_credit_rejected"
  | "application_submitted"
  | "application_approved"
  | "application_rejected"
  | "renewal_payment_received"
  | "renewal_payment_overdue"
  | "reinstatement_processed";

// ============================================================
// Core Domain Entities
// ============================================================

export interface Certificant {
  id: string;                       // "CRT-0094"
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  state: string;
  joinDate: string;                 // ISO date
  credentialIds: string[];          // references CredentialRecord.id[]
  primaryCredentialStatus: CredentialStatus;
}

export interface CertificationProgram {
  id: string;                       // "PRG-001"
  name: string;                     // e.g. "Radon Measurement Professional"
  abbreviation: string;             // e.g. "RMP"
  ceRequiredHours: number;          // total CE hours per renewal cycle
  ceMaxCategoryII: number;          // max hours of Category II CE allowed
  validityYears: number;            // credential validity in years
  examFee: number;                  // USD
  renewalFee: number;               // USD
  description: string;
}

export interface CredentialRecord {
  id: string;                       // "CRED-8821"
  certificantId: string;            // references Certificant.id
  programId: string;                // references CertificationProgram.id
  credentialNumber: string;         // "RMP-4412" — publicly verifiable number
  issueDate: string;                // ISO date
  expiryDate: string;               // ISO date — exactly validityYears from issueDate
  ceHoursCompleted: number;         // total CE hours earned this cycle
  ceCategoryIHours: number;         // Category I CE hours
  ceCategoryIIHours: number;        // Category II CE hours (capped at ceMaxCategoryII)
  ceRequiredHours: number;          // copied from program at issuance
  status: CredentialStatus;
  lastRenewalDate: string | null;   // null if never renewed
  suspensionReason?: string;        // present when status = "Suspended" | "Revoked"
  auditSelected: boolean;           // ~5% of renewals trigger audit
}

export interface CECredit {
  id: string;                       // "CE-7741"
  credentialRecordId: string;       // references CredentialRecord.id
  certificantId: string;            // references Certificant.id
  courseName: string;
  provider: string;                 // course provider / sponsor
  hours: number;                    // CE hours earned
  category: CECategory;
  completionDate: string;           // ISO date
  certificateUploaded: boolean;
  approved: boolean;
  rejectionReason?: string;         // present when approved = false
}

export interface ExamAttempt {
  id: string;                       // "EXAM-4409"
  certificantId: string | null;     // null if candidate not yet registered as certificant
  candidateName: string;
  programId: string;                // references CertificationProgram.id
  examDate: string;                 // ISO date
  score: number;                    // 0–100
  passingScore: number;             // typically 70
  passed: boolean;
  attempt: ExamAttemptNumber;
  examSite: string;
  proctor: string;
}

export interface Application {
  id: string;                       // "APP-2209"
  candidateName: string;
  email: string;
  programId: string;                // references CertificationProgram.id
  submitDate: string;               // ISO date
  status: ApplicationStatus;
  reviewerNotes?: string;
  documentsSubmitted: string[];     // list of doc types submitted
  documentsRequired: string[];      // list of doc types required
  examEligibilityGranted: boolean;
}

export interface RenewalQueueItem {
  id: string;                       // "RNW-0441"
  credentialRecordId: string;       // references CredentialRecord.id
  certificantId: string;            // references Certificant.id
  certificantName: string;
  credentialNumber: string;
  programAbbreviation: string;
  expiryDate: string;               // ISO date
  daysUntilExpiry: number;          // negative = already expired/lapsed
  ceHoursCompleted: number;
  ceHoursRequired: number;
  renewalFee: number;
  paymentStatus: RenewalPaymentStatus;
  remindersSent: number;
}

export interface ActivityLogEntry {
  id: string;                       // "ACT-8841"
  timestamp: string;                // ISO datetime
  action: ActivityAction;
  entityType: "credential" | "certificant" | "application" | "ce_credit" | "exam";
  entityId: string;
  entityLabel: string;              // e.g. "RMP-4412 — Mark Hendricks"
  description: string;
  performedBy: string;              // staff name or "System"
}

// ============================================================
// Dashboard & Chart Types
// ============================================================

export interface DashboardStats {
  activeCertificants: number;
  activeCertificantsChange: number;         // % change vs previous period
  renewalRate: number;                      // percentage 0–100
  renewalRateChange: number;
  pendingApplications: number;
  pendingApplicationsChange: number;
  expiringWithin90Days: number;
  expiringWithin90DaysChange: number;
  ceCompletionRate: number;                 // % of active creds with CE on track
  ceCompletionRateChange: number;
  newCertificationsThisMonth: number;
  newCertificationsChange: number;
  lapsedCount: number;
  lapsedCountChange: number;
  examPassRate: number;                     // first-attempt pass rate %
  examPassRateChange: number;
}

export interface MonthlyActivityPoint {
  month: string;                            // "Apr 2025"
  certificationsIssued: number;
  renewalsProcessed: number;
  examsAdministered: number;
  ceCreditsLogged: number;
}

export interface ProgramBreakdownPoint {
  programAbbreviation: string;
  activeCertificants: number;
  renewalsDue: number;
  ceCompliant: number;
}

export interface CECompliancePoint {
  month: string;
  compliant: number;
  deficient: number;
  pending: number;
}

// ============================================================
// Lookup Helper Return Types
// ============================================================

export type ProgramLookup = Record<string, CertificationProgram>;
export type CertificantLookup = Record<string, Certificant>;
