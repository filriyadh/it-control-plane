import { PageLayout } from "@/components/PageLayout";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { securityPosture } from "@/data/mock-data";
import { Shield, ShieldAlert, ShieldCheck, ShieldX, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function SecurityPosturePage() {
  const totalUsers = securityPosture.mfaRegistered + securityPosture.mfaNotRegistered;

  return (
    <PageLayout title="Security Posture" description="MFA coverage, risky users, and security policy compliance">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="MFA Registered" value={securityPosture.mfaRegistered} icon={ShieldCheck} variant="success" trend={`${securityPosture.complianceRate}% coverage`} trendDirection="up" />
        <MetricCard label="MFA Gaps" value={securityPosture.mfaNotRegistered} icon={ShieldX} variant="danger" />
        <MetricCard label="Risky Users" value={securityPosture.riskyUsers} icon={ShieldAlert} variant="warning" />
        <MetricCard label="Risky Sign-Ins" value={securityPosture.riskySignIns} icon={AlertTriangle} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MFA Coverage */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-5">
          <h2 className="section-title">MFA Coverage</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Registered</span>
                <span className="font-medium">{securityPosture.mfaRegistered} / {totalUsers}</span>
              </div>
              <Progress value={securityPosture.complianceRate} className="h-3" />
            </div>
            <div className="bg-muted rounded-lg p-3 text-sm space-y-2">
              <p className="font-medium">Users without MFA:</p>
              <p className="text-muted-foreground">{securityPosture.mfaNotRegistered} users have not registered any MFA methods. These users are vulnerable to credential-based attacks.</p>
            </div>
          </div>
        </motion.div>

        {/* Conditional Access */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-5">
          <h2 className="section-title">Conditional Access</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Policies</span>
              <span className="text-2xl font-bold">{securityPosture.conditionalAccessPolicies}</span>
            </div>
            <div className="space-y-2">
              {["Require MFA for Admins", "Block Legacy Auth", "Require Compliant Device", "Require MFA for Azure Management"].map((policy, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm">{policy}</span>
                  <StatusBadge status="active" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Risky Users */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg p-5 lg:col-span-2">
          <h2 className="section-title">Risky Users Queue</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Risk Level</th>
                <th>Risk Detail</th>
                <th>Last Detection</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium">jmartinez@contoso.com</td>
                <td><StatusBadge status="high" /></td>
                <td className="text-muted-foreground">Impossible travel activity</td>
                <td className="text-muted-foreground">2026-03-19</td>
                <td><StatusBadge status="pending_review" /></td>
              </tr>
              <tr>
                <td className="font-medium">tempuser3@contoso.com</td>
                <td><StatusBadge status="medium" /></td>
                <td className="text-muted-foreground">Suspicious inbox rule</td>
                <td className="text-muted-foreground">2026-03-18</td>
                <td><StatusBadge status="pending_review" /></td>
              </tr>
              <tr>
                <td className="font-medium">contractor7@contoso.com</td>
                <td><StatusBadge status="low" /></td>
                <td className="text-muted-foreground">Unfamiliar sign-in properties</td>
                <td className="text-muted-foreground">2026-03-17</td>
                <td><StatusBadge status="resolved" /></td>
              </tr>
            </tbody>
          </table>
        </motion.div>
      </div>
    </PageLayout>
  );
}
