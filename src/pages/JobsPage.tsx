import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { jobRuns } from "@/data/mock-data";
import { Activity, RefreshCw, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/MetricCard";
import { motion } from "framer-motion";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
              {filtered.map(job => (
                <motion.tr key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td className="font-medium">{job.name}</td>
                  <td><StatusBadge status={job.type} variant="neutral" /></td>
                  <td><StatusBadge status={job.status} /></td>
                  <td className="text-muted-foreground">{job.startedAt === "—" ? "—" : new Date(job.startedAt).toLocaleTimeString()}</td>
                  <td>{job.duration}</td>
                  <td>{job.recordsProcessed.toLocaleString()}</td>
                  <td className={job.errors > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>{job.errors}</td>
                  <td>
                    {job.status === "failed" && (
                      <Button variant="outline" size="sm">Retry</Button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
