import { PageLayout } from "@/components/PageLayout";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { dashboardMetrics, recentActivity, jobRuns, licenseRecommendations, licenseSubscriptions, staleAccounts, onboardingQueue, offboardingQueue } from "@/data/mock-data";
import { Users, KeyRound, UserX, ShieldAlert, AlertTriangle, CheckCircle, Activity, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const chartData = licenseSubscriptions.map(l => ({
  name: l.name.replace("Microsoft 365 ", "M365 ").replace(" for Endpoint", ""),
  assigned: l.assigned,
  available: l.available,
  utilization: Math.round((l.assigned / l.total) * 100),
}));

export default function DashboardPage() {
  const pendingStale = staleAccounts.filter(a => a.status === "pending_review");
  const activeOnboarding = onboardingQueue.filter(o => o.status === "in_progress");
  const activeOffboarding = offboardingQueue.filter(o => o.status === "in_progress");
  const failedJobs = jobRuns.filter(j => j.status === "failed");

  return (
    <PageLayout title="Dashboard" description="IT operations overview and pending work">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Active Users" value={dashboardMetrics.activeUsers.toLocaleString()} icon={Users} variant="info" trend="+12 this week" trendDirection="up" href="/access-groups" />
        <MetricCard label="Unused Licenses" value={dashboardMetrics.unusedLicenses} icon={KeyRound} variant="warning" trend={`$${(dashboardMetrics.unusedLicenses * 15).toLocaleString()}/mo potential savings`} href="/licenses" />
        <MetricCard label="Stale Accounts" value={dashboardMetrics.staleAccounts} icon={UserX} variant="danger" trend={`${pendingStale.length} pending review`} href="/stale-accounts" />
        <MetricCard label="MFA Gaps" value={dashboardMetrics.mfaGaps} icon={ShieldAlert} variant="warning" trend="3.9% of users" href="/security-posture" />
      </div>

      {/* License Utilization Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-lg p-5 mb-6">
        <h2 className="section-title">License Utilization</h2>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 24, top: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: "hsl(215 14% 46%)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: "hsl(215 14% 46%)" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Utilization"]}
                contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(214 20% 90%)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="utilization" radius={[0, 4, 4, 0]} barSize={18}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.utilization > 95 ? "hsl(0 72% 51%)" : entry.utilization > 80 ? "hsl(199 89% 48%)" : "hsl(38 92% 50%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Work */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-card border border-border rounded-lg">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="section-title mb-0">Pending Work</h2>
          </div>
          <div className="divide-y divide-border">
            {dashboardMetrics.pendingApprovals > 0 && (
              <div className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-sm">{dashboardMetrics.pendingApprovals} pending approvals</span>
                </div>
                <StatusBadge status="pending" />
              </div>
            )}
            {failedJobs.map(j => (
              <div key={j.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm">{j.name} — failed</span>
                </div>
                <StatusBadge status="failed" />
              </div>
            ))}
            {activeOnboarding.map(o => (
              <div key={o.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-info" />
                  <span className="text-sm">Onboarding: {o.name} — {o.completedSteps}/{o.totalSteps} steps</span>
                </div>
                <StatusBadge status="in_progress" />
              </div>
            ))}
            {activeOffboarding.map(o => (
              <div key={o.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-warning" />
                  <span className="text-sm">Offboarding: {o.name} — {o.completedSteps}/{o.totalSteps} steps</span>
                </div>
                <StatusBadge status="in_progress" />
              </div>
            ))}
            {licenseRecommendations.slice(0, 2).map(r => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{r.reason}</span>
                </div>
                <span className="text-xs font-medium text-success">{r.savings}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="section-title mb-0">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.map(item => (
              <div key={item.id} className="px-5 py-3">
                <div className="flex items-start gap-2">
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                    item.type === "error" ? "bg-destructive" :
                    item.type === "success" ? "bg-success" :
                    item.type === "warning" ? "bg-warning" :
                    "bg-info"
                  }`} />
                  <div>
                    <p className="text-sm leading-snug">{item.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <MetricCard label="Pending Approvals" value={dashboardMetrics.pendingApprovals} icon={Clock} variant="warning" />
        <MetricCard label="Failed Jobs" value={dashboardMetrics.failedJobs} icon={AlertTriangle} variant="danger" href="/jobs" />
        <MetricCard label="Total Licenses" value={dashboardMetrics.totalLicenses.toLocaleString()} icon={KeyRound} variant="default" href="/licenses" />
        <MetricCard label="Actions (7d)" value={dashboardMetrics.recentActions} icon={CheckCircle} variant="success" href="/audit-log" />
      </div>
    </PageLayout>
  );
}
