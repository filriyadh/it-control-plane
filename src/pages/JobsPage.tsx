import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { jobRuns } from "@/data/mock-data";
import { Activity, RefreshCw, Search, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/MetricCard";
import { motion, AnimatePresence } from "framer-motion";

const jobDetails: Record<string, { logs: string[]; errorMessage?: string }> = {
  j1: { logs: ["Connected to Microsoft Graph", "Fetched 1247 user records", "Processed delta changes: 12 new, 3 updated", "Sync completed successfully"] },
  j3: { logs: ["Started stale detection scan", "Processed 1247 accounts", "Found 7 stale accounts (threshold: 90 days)", "2 accounts skipped due to API errors"], errorMessage: "Graph API returned 429 for 2 batch requests" },
  j4: { logs: ["Started MFA status refresh", "Graph API rate limit exceeded after 0 records"], errorMessage: "HTTP 429 Too Many Requests — retry after 60s. Correlation ID: abc-123-def" },
  j6: { logs: ["Started security posture scan", "Processing user risk detections...", "634 of 1247 users scanned so far"] },
};

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [retryDialog, setRetryDialog] = useState<typeof jobRuns[0] | null>(null);

  const filtered = jobRuns.filter(j => {
    const matchSearch = j.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const completed = jobRuns.filter(j => j.status === "completed").length;
  const failed = jobRuns.filter(j => j.status === "failed").length;
  const running = jobRuns.filter(j => j.status === "running").length;

  return (
    <PageLayout
      title="Jobs & Sync Status"
      description="Monitor sync operations, scheduled tasks, and job health"
      actions={<Button variant="outline" size="sm"><RefreshCw className="h-3 w-3 mr-1" /> Refresh</Button>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Jobs" value={jobRuns.length} icon={Activity} variant="info" />
        <MetricCard label="Completed" value={completed} icon={Activity} variant="success" />
        <MetricCard label="Running" value={running} icon={Activity} variant="info" />
        <MetricCard label="Failed" value={failed} icon={Activity} variant="danger" />
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th>Job Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Started</th>
                <th>Duration</th>
                <th>Records</th>
                <th>Errors</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => {
                const details = jobDetails[job.id];
                const isExpanded = expandedId === job.id;

                return (
                  <>
                    <motion.tr key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={details ? "cursor-pointer" : ""} onClick={() => details && setExpandedId(isExpanded ? null : job.id)}>
                      <td>
                        {details && (
                          <span className="text-muted-foreground">
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </span>
                        )}
                      </td>
                      <td className="font-medium">{job.name}</td>
                      <td><StatusBadge status={job.type} variant="neutral" /></td>
                      <td><StatusBadge status={job.status} /></td>
                      <td className="text-muted-foreground">{job.startedAt === "—" ? "—" : new Date(job.startedAt).toLocaleTimeString()}</td>
                      <td>{job.duration}</td>
                      <td>{job.recordsProcessed.toLocaleString()}</td>
                      <td className={job.errors > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>{job.errors}</td>
                      <td>
                        {job.status === "failed" && (
                          <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); setRetryDialog(job); }}>Retry</Button>
                        )}
                      </td>
                    </motion.tr>
                    <AnimatePresence>
                      {isExpanded && details && (
                        <motion.tr key={`${job.id}-detail`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <td colSpan={9} className="!p-0">
                            <div className="bg-muted/50 px-6 py-4 space-y-2">
                              {details.errorMessage && (
                                <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded mb-2">
                                  <span className="font-medium">Error: </span>{details.errorMessage}
                                </div>
                              )}
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Execution Log</p>
                              <div className="font-mono text-xs space-y-0.5">
                                {details.logs.map((log, i) => (
                                  <p key={i} className="text-muted-foreground">
                                    <span className="text-foreground/50 mr-2">[{String(i + 1).padStart(2, "0")}]</span>
                                    {log}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retry Dialog */}
      <Dialog open={!!retryDialog} onOpenChange={() => setRetryDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retry Failed Job</DialogTitle>
            <DialogDescription>
              Re-run "{retryDialog?.name}". The previous run failed with {retryDialog?.errors} error{(retryDialog?.errors || 0) > 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {retryDialog && jobDetails[retryDialog.id]?.errorMessage && (
              <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded">
                {jobDetails[retryDialog.id].errorMessage}
              </div>
            )}
            <div>
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Add context for this retry..." className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRetryDialog(null)}>Cancel</Button>
            <Button onClick={() => setRetryDialog(null)}>
              <RefreshCw className="h-3 w-3 mr-1" /> Retry Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
