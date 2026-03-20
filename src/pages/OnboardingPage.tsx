import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { onboardingQueue } from "@/data/mock-data";
import { UserPlus, Clock, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const pending = onboardingQueue.filter(o => o.status === "pending").length;
  const inProgress = onboardingQueue.filter(o => o.status === "in_progress").length;

  return (
    <PageLayout title="Onboarding" description="New hire provisioning queue and fulfillment tracking">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Total Queue" value={onboardingQueue.length} icon={UserPlus} variant="info" />
        <MetricCard label="In Progress" value={inProgress} icon={Clock} variant="warning" />
        <MetricCard label="Pending" value={pending} icon={Clock} variant="neutral" />
      </div>

      <div className="space-y-4">
        {onboardingQueue.map(item => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.department} • Starts {new Date(item.startDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} />
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={(item.completedSteps / item.totalSteps) * 100} className="h-2 flex-1" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">{item.completedSteps}/{item.totalSteps} steps</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Assigned to: {item.assignee}</p>
          </motion.div>
        ))}
      </div>
    </PageLayout>
  );
}
