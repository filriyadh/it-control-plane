import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { onboardingQueue } from "@/data/mock-data";
import { UserPlus, Clock, CheckCircle, ChevronDown, ChevronRight, AlertTriangle, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

const onboardingSteps: Record<string, { label: string; completed: boolean; blocker?: string }[]> = {
  ob1: [
    { label: "Create AD account", completed: true },
    { label: "Assign licenses (M365 E3, Power BI)", completed: true },
    { label: "Add to Engineering security groups", completed: true },
    { label: "Provision mailbox", completed: true },
    { label: "Set up MFA registration", completed: false },
    { label: "Deploy hardware (laptop + peripherals)", completed: false, blocker: "Waiting for asset delivery — ETA March 22" },
    { label: "Send welcome email with credentials", completed: false },
  ],
  ob2: [
    { label: "Create AD account", completed: false },
    { label: "Assign licenses (M365 E3)", completed: false },
    { label: "Add to Sales security groups", completed: false },
    { label: "Provision mailbox", completed: false },
    { label: "Configure CRM access", completed: false },
    { label: "Send welcome email with credentials", completed: false },
  ],
  ob3: [
    { label: "Create AD account", completed: false },
    { label: "Assign licenses (M365 E3)", completed: false },
    { label: "Add to Marketing security groups", completed: false },
    { label: "Provision mailbox", completed: false },
    { label: "Grant SharePoint Marketing site access", completed: false },
    { label: "Send welcome email with credentials", completed: false },
  ],
};

export default function OnboardingPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reassignDialog, setReassignDialog] = useState<typeof onboardingQueue[0] | null>(null);

  const pending = onboardingQueue.filter(o => o.status === "pending").length;
  const inProgress = onboardingQueue.filter(o => o.status === "in_progress").length;
  const blockerCount = Object.values(onboardingSteps).flat().filter(s => s.blocker).length;

  return (
    <PageLayout title="Onboarding" description="New hire provisioning queue and fulfillment tracking">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Queue" value={onboardingQueue.length} icon={UserPlus} variant="info" />
        <MetricCard label="In Progress" value={inProgress} icon={Clock} variant="warning" />
        <MetricCard label="Pending" value={pending} icon={Clock} variant="neutral" />
        <MetricCard label="Blockers" value={blockerCount} icon={AlertTriangle} variant="danger" />
      </div>

      <div className="space-y-4">
        {onboardingQueue.map(item => {
          const steps = onboardingSteps[item.id] || [];
          const isExpanded = expandedId === item.id;
          const hasBlocker = steps.some(s => s.blocker);

          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setExpandedId(isExpanded ? null : item.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        {item.name}
                        {hasBlocker && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.department} • Starts {new Date(item.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    <Button variant="outline" size="sm" onClick={() => setReassignDialog(item)}>
                      <User className="h-3 w-3 mr-1" /> Reassign
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-7">
                  <Progress value={(item.completedSteps / item.totalSteps) * 100} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.completedSteps}/{item.totalSteps} steps</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-7">Assigned to: {item.assignee}</p>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border"
                  >
                    <div className="px-5 py-4 space-y-2">
                      {steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 py-1.5">
                          <Checkbox checked={step.completed} disabled className="mt-0.5" />
                          <div className="flex-1">
                            <p className={`text-sm ${step.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                              {step.label}
                            </p>
                            {step.blocker && (
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-warning bg-warning/10 px-2 py-1 rounded">
                                <AlertTriangle className="h-3 w-3" />
                                {step.blocker}
                              </div>
                            )}
                          </div>
                          {!step.completed && !step.blocker && (
                            <Button variant="ghost" size="sm" className="text-xs h-7">Mark Done</Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Reassign Dialog */}
      <Dialog open={!!reassignDialog} onOpenChange={() => setReassignDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Onboarding</DialogTitle>
            <DialogDescription>
              Change the assignee for {reassignDialog?.name}'s onboarding tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Assign to</label>
            <Select defaultValue={reassignDialog?.assignee}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="helpdesk@contoso.com">helpdesk@contoso.com</SelectItem>
                <SelectItem value="admin@contoso.com">admin@contoso.com</SelectItem>
                <SelectItem value="itmanager@contoso.com">itmanager@contoso.com</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignDialog(null)}>Cancel</Button>
            <Button onClick={() => setReassignDialog(null)}>Reassign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
