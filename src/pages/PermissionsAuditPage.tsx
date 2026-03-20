import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { ScanSearch, Shield, Users, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const privilegedRoles = [
  { role: "Global Administrator", members: 4, lastReview: "2026-02-15", risk: "critical" },
  { role: "Exchange Administrator", members: 6, lastReview: "2026-02-15", risk: "high" },
  { role: "SharePoint Administrator", members: 8, lastReview: "2026-01-20", risk: "high" },
  { role: "User Administrator", members: 12, lastReview: "2026-03-01", risk: "medium" },
  { role: "Security Administrator", members: 3, lastReview: "2026-02-28", risk: "critical" },
  { role: "Helpdesk Administrator", members: 15, lastReview: "2026-03-10", risk: "low" },
  { role: "Application Administrator", members: 5, lastReview: "2026-01-10", risk: "high" },
];

const appRegistrations = [
  { name: "IT Portal", permissions: 12, type: "First-party", lastUsed: "2026-03-20", risk: "low" },
  { name: "HR Integration", permissions: 8, type: "First-party", lastUsed: "2026-03-19", risk: "low" },
  { name: "Legacy CRM Connector", permissions: 24, type: "Third-party", lastUsed: "2025-12-05", risk: "high" },
  { name: "Expense Tracker", permissions: 6, type: "Third-party", lastUsed: "2026-03-18", risk: "medium" },
];

export default function PermissionsAuditPage() {
  const criticalRoles = privilegedRoles.filter(r => r.risk === "critical").length;
  const totalPrivilegedUsers = privilegedRoles.reduce((s, r) => s + r.members, 0);

  return (
    <PageLayout title="Permissions Audit" description="Review privileged directory roles and application registrations">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Privileged Roles" value={privilegedRoles.length} icon={Shield} variant="info" />
        <MetricCard label="Critical Roles" value={criticalRoles} icon={AlertTriangle} variant="danger" />
        <MetricCard label="Privileged Users" value={totalPrivilegedUsers} icon={Users} variant="warning" />
        <MetricCard label="App Registrations" value={appRegistrations.length} icon={ScanSearch} variant="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-5">
          <h2 className="section-title">Directory Roles</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Members</th>
                <th>Risk</th>
                <th>Last Review</th>
              </tr>
            </thead>
            <tbody>
              {privilegedRoles.map((role, i) => (
                <tr key={i}>
                  <td className="font-medium">{role.role}</td>
                  <td>{role.members}</td>
                  <td><StatusBadge status={role.risk} /></td>
                  <td className="text-muted-foreground">{new Date(role.lastReview).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-5">
          <h2 className="section-title">App Registrations</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>App</th>
                <th>Permissions</th>
                <th>Type</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {appRegistrations.map((app, i) => (
                <tr key={i}>
                  <td className="font-medium">{app.name}</td>
                  <td>{app.permissions}</td>
                  <td><StatusBadge status={app.type} variant="neutral" /></td>
                  <td><StatusBadge status={app.risk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </PageLayout>
  );
}
