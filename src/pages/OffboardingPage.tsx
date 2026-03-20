import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { offboardingQueue } from "@/data/mock-data";
import { UserMinus, Clock, ChevronDown, ChevronRight, AlertTriangle, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

const offboardingSteps: Record<string, { label: string; completed: boolean; blocker?: string }[]> = {
  of1: [
    { label: "Revoke active sessions", completed: true },
    { label: "Disable sign-in", completed: true },
    { label: "Remove from all security groups", completed: true },
    { label: "Revoke licenses", completed: false },
    { label: "Forward mailbox to manager", completed: false, blocker: "Awaiting manager confirmation" },
    { label: "Archive OneDrive content", completed: false },
    { label: "Collect hardware assets", completed: false },
    { label: "Remove from conditional access policies", completed: false },
  ],
  of2: [
    { label: "Revoke active sessions", completed: false },
    { label: "Disable sign-in", completed: false },
    { label: "Remove from all security groups", completed: false },
    { label: "Revoke licenses", completed: false },
    { label: "Forward mailbox to manager", completed: false },
    { label: "Archive OneDrive content", completed: false },
    { label: "Collect hardware assets", completed: false },
    { label: "Remove from conditional access policies", completed: false },
  ],
};

export default function OffboardingPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reassignDialog, setReassignDialog] = useState<typeof offboardingQueue[0] | null>(null);

  const blockerCount = Object.values(offboardingSteps).flat().filter(s => s.blocker).length;

  return (
    <PageLayout title="Offboarding" description="Leaver deprovisioning queue and cleanup tracking">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Queue" value={offboardingQueue.length} icon={UserMinus} variant="danger" />
        <MetricCard label="In Progress" value={offboardingQueue.filter(o => o.status === "in_progress").length} icon={Clock} variant="warning" />
        <MetricCard label="Pending" value={offboardingQueue.filter(o => o.status === "pending").length} icon={Clock} variant="neutral" />
        <MetricCard label="Blockers" value={blockerCount} icon={AlertTriangle} variant="danger" />
      </div>

      <div className="space-y-4">
        {offboardingQueue.map(item => {
          const steps = offboardingSteps[item.id] || [];
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
                      <p className="text-sm text-muted-foreground">{item.department} • Last day {new Date(item.lastDay).toLocaleDateString()}</p>
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

      <Dialog open={!!reassignDialog} onOpenChange={() => setReassignDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Offboarding</DialogTitle>
            <DialogDescription>Change the assignee for {reassignDialog?.name}'s offboarding tasks.</DialogDescription>
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
