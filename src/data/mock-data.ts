// Mock data for IT Control Plane

export const dashboardMetrics = {
  activeUsers: 1247,
  staleAccounts: 23,
  totalLicenses: 1580,
  unusedLicenses: 142,
  pendingApprovals: 8,
  failedJobs: 3,
  mfaGaps: 17,
  recentActions: 156,
};

export const licenseSubscriptions = [
  { id: "1", name: "Microsoft 365 E3", total: 800, assigned: 742, available: 58, monthlyCost: 36, renewalDate: "2026-09-15", status: "active" },
  { id: "2", name: "Microsoft 365 E5", total: 150, assigned: 148, available: 2, monthlyCost: 57, renewalDate: "2026-09-15", status: "warning" },
  { id: "3", name: "Power BI Pro", total: 200, assigned: 134, available: 66, monthlyCost: 10, renewalDate: "2026-11-01", status: "active" },
  { id: "4", name: "Visio Plan 2", total: 50, assigned: 28, available: 22, monthlyCost: 15, renewalDate: "2026-07-01", status: "active" },
  { id: "5", name: "Project Plan 3", total: 75, assigned: 71, available: 4, monthlyCost: 30, renewalDate: "2026-08-20", status: "warning" },
  { id: "6", name: "Azure AD P2", total: 300, assigned: 245, available: 55, monthlyCost: 9, renewalDate: "2027-01-15", status: "active" },
  { id: "7", name: "Defender for Endpoint P2", total: 500, assigned: 487, available: 13, monthlyCost: 5.2, renewalDate: "2026-12-01", status: "active" },
  { id: "8", name: "Exchange Online Kiosk", total: 100, assigned: 34, available: 66, monthlyCost: 2, renewalDate: "2026-06-15", status: "review" },
];

export const licenseRecommendations = [
  { id: "r1", type: "reclaim", license: "Exchange Online Kiosk", count: 42, savings: "$84/mo", reason: "42 users haven't accessed Exchange in 90+ days" },
  { id: "r2", type: "downgrade", license: "Microsoft 365 E5", count: 15, savings: "$315/mo", reason: "15 users don't use any E5-exclusive features" },
  { id: "r3", type: "reclaim", license: "Power BI Pro", count: 28, savings: "$280/mo", reason: "28 users haven't opened Power BI in 60+ days" },
  { id: "r4", type: "alert", license: "Microsoft 365 E5", count: 2, savings: "N/A", reason: "Only 2 licenses remaining — consider purchasing more" },
];

export const staleAccounts = [
  { id: "s1", displayName: "John Martinez", email: "jmartinez@contoso.com", lastSignIn: "2025-11-02", daysSinceSignIn: 139, department: "Marketing", riskLevel: "high", licenses: 3, status: "pending_review" },
  { id: "s2", displayName: "Sarah Chen", email: "schen@contoso.com", lastSignIn: "2025-12-15", daysSinceSignIn: 95, department: "Finance", riskLevel: "medium", licenses: 2, status: "pending_review" },
  { id: "s3", displayName: "Mike Thompson", email: "mthompson@contoso.com", lastSignIn: "2025-10-20", daysSinceSignIn: 151, department: "Engineering", riskLevel: "high", licenses: 5, status: "pending_review" },
  { id: "s4", displayName: "Lisa Park", email: "lpark@contoso.com", lastSignIn: "2026-01-03", daysSinceSignIn: 76, department: "Sales", riskLevel: "low", licenses: 2, status: "excluded" },
  { id: "s5", displayName: "David Kim", email: "dkim@contoso.com", lastSignIn: "2025-09-18", daysSinceSignIn: 183, department: "HR", riskLevel: "high", licenses: 4, status: "pending_review" },
  { id: "s6", displayName: "Emma Wilson", email: "ewilson@contoso.com", lastSignIn: "2025-12-28", daysSinceSignIn: 82, department: "Legal", riskLevel: "medium", licenses: 1, status: "pending_review" },
  { id: "s7", displayName: "Alex Rivera", email: "arivera@contoso.com", lastSignIn: "2026-01-20", daysSinceSignIn: 59, department: "IT", riskLevel: "low", licenses: 3, status: "pending_review" },
];

export const groups = [
  { id: "g1", name: "All Employees", type: "Security", members: 1247, isPrivileged: false, source: "Azure AD" },
  { id: "g2", name: "Global Admins", type: "Security", members: 4, isPrivileged: true, source: "Azure AD" },
  { id: "g3", name: "Exchange Admins", type: "Security", members: 6, isPrivileged: true, source: "Azure AD" },
  { id: "g4", name: "Engineering Team", type: "Microsoft 365", members: 185, isPrivileged: false, source: "Azure AD" },
  { id: "g5", name: "Finance Department", type: "Security", members: 67, isPrivileged: false, source: "Azure AD" },
  { id: "g6", name: "VPN Access", type: "Security", members: 892, isPrivileged: false, source: "Azure AD" },
  { id: "g7", name: "Privileged Access Workstation", type: "Security", members: 12, isPrivileged: true, source: "Azure AD" },
  { id: "g8", name: "SharePoint Admins", type: "Security", members: 8, isPrivileged: true, source: "Azure AD" },
  { id: "g9", name: "Marketing Team", type: "Microsoft 365", members: 43, isPrivileged: false, source: "Azure AD" },
  { id: "g10", name: "Help Desk Operators", type: "Security", members: 15, isPrivileged: false, source: "Azure AD" },
];

export const jobRuns = [
  { id: "j1", name: "User Directory Sync", type: "sync", status: "completed", startedAt: "2026-03-20T08:00:00Z", duration: "2m 34s", recordsProcessed: 1247, errors: 0 },
  { id: "j2", name: "License Assignment Audit", type: "sync", status: "completed", startedAt: "2026-03-20T06:00:00Z", duration: "4m 12s", recordsProcessed: 1580, errors: 0 },
  { id: "j3", name: "Stale Account Detection", type: "scheduled", status: "completed", startedAt: "2026-03-20T03:00:00Z", duration: "8m 45s", recordsProcessed: 1247, errors: 2 },
  { id: "j4", name: "MFA Status Refresh", type: "sync", status: "failed", startedAt: "2026-03-20T02:00:00Z", duration: "0m 48s", recordsProcessed: 0, errors: 1 },
  { id: "j5", name: "Group Membership Sync", type: "sync", status: "completed", startedAt: "2026-03-19T22:00:00Z", duration: "3m 22s", recordsProcessed: 892, errors: 0 },
  { id: "j6", name: "Security Posture Scan", type: "scheduled", status: "running", startedAt: "2026-03-20T09:15:00Z", duration: "—", recordsProcessed: 634, errors: 0 },
  { id: "j7", name: "License Reclaim Check", type: "scheduled", status: "queued", startedAt: "—", duration: "—", recordsProcessed: 0, errors: 0 },
  { id: "j8", name: "Offboarding Cleanup", type: "action", status: "completed", startedAt: "2026-03-19T16:30:00Z", duration: "1m 15s", recordsProcessed: 3, errors: 0 },
];

export const auditEntries = [
  { id: "a1", timestamp: "2026-03-20T09:12:34Z", actor: "admin@contoso.com", action: "license.reclaim", target: "jmartinez@contoso.com", details: "Reclaimed Power BI Pro license", result: "success" },
  { id: "a2", timestamp: "2026-03-20T08:45:12Z", actor: "helpdesk@contoso.com", action: "group.add_member", target: "Engineering Team", details: "Added nsmith@contoso.com", result: "success" },
  { id: "a3", timestamp: "2026-03-20T08:30:00Z", actor: "system", action: "sync.directory", target: "User Directory", details: "Scheduled sync completed — 1247 users processed", result: "success" },
  { id: "a4", timestamp: "2026-03-20T07:15:22Z", actor: "admin@contoso.com", action: "account.disable", target: "dkim@contoso.com", details: "Account disabled after stale review", result: "success" },
  { id: "a5", timestamp: "2026-03-20T06:00:00Z", actor: "system", action: "sync.licenses", target: "License Inventory", details: "Scheduled sync completed — 1580 licenses audited", result: "success" },
  { id: "a6", timestamp: "2026-03-19T17:22:45Z", actor: "admin@contoso.com", action: "mailbox.delegate", target: "shared-inbox@contoso.com", details: "Added full access for jdoe@contoso.com (expires 2026-04-19)", result: "success" },
  { id: "a7", timestamp: "2026-03-19T16:30:00Z", actor: "system", action: "offboarding.cleanup", target: "3 accounts", details: "Removed licenses, disabled sign-in, revoked sessions", result: "success" },
  { id: "a8", timestamp: "2026-03-19T14:10:33Z", actor: "helpdesk@contoso.com", action: "mfa.reset", target: "lpark@contoso.com", details: "MFA methods reset per ticket #4521", result: "success" },
  { id: "a9", timestamp: "2026-03-19T11:05:18Z", actor: "admin@contoso.com", action: "settings.update", target: "Stale Account Threshold", details: "Changed from 60 to 90 days", result: "success" },
  { id: "a10", timestamp: "2026-03-20T02:00:48Z", actor: "system", action: "sync.mfa", target: "MFA Status", details: "Graph API rate limit exceeded", result: "failed" },
];

export const recentActivity = [
  { id: "ra1", text: "MFA Status Refresh failed — Graph API rate limit", time: "2h ago", type: "error" as const },
  { id: "ra2", text: "Security Posture Scan running", time: "5m ago", type: "info" as const },
  { id: "ra3", text: "3 offboarding accounts cleaned up", time: "17h ago", type: "success" as const },
  { id: "ra4", text: "License reclaim: Power BI Pro from jmartinez", time: "48m ago", type: "success" as const },
  { id: "ra5", text: "Stale account threshold updated to 90 days", time: "yesterday", type: "info" as const },
  { id: "ra6", text: "8 pending approvals need attention", time: "now", type: "warning" as const },
];

export const securityPosture = {
  mfaRegistered: 1198,
  mfaNotRegistered: 49,
  riskyUsers: 3,
  riskySignIns: 7,
  conditionalAccessPolicies: 12,
  complianceRate: 96.1,
};

export const onboardingQueue = [
  { id: "ob1", name: "Nina Smith", department: "Engineering", startDate: "2026-03-25", status: "in_progress", completedSteps: 4, totalSteps: 7, assignee: "helpdesk@contoso.com" },
  { id: "ob2", name: "Tom Baker", department: "Sales", startDate: "2026-03-27", status: "pending", completedSteps: 0, totalSteps: 6, assignee: "unassigned" },
  { id: "ob3", name: "Amy Lee", department: "Marketing", startDate: "2026-04-01", status: "pending", completedSteps: 0, totalSteps: 6, assignee: "unassigned" },
];

export const offboardingQueue = [
  { id: "of1", name: "Robert James", department: "Finance", lastDay: "2026-03-21", status: "in_progress", completedSteps: 3, totalSteps: 8, assignee: "admin@contoso.com" },
  { id: "of2", name: "Carol White", department: "HR", lastDay: "2026-03-28", status: "pending", completedSteps: 0, totalSteps: 8, assignee: "unassigned" },
];
