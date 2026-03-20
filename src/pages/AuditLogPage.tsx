import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { auditEntries } from "@/data/mock-data";
import { ScrollText, Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("all");

  const filtered = auditEntries.filter(e => {
    const matchSearch =
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.target.toLowerCase().includes(search.toLowerCase()) ||
      e.details.toLowerCase().includes(search.toLowerCase());
    const matchResult = resultFilter === "all" || e.result === resultFilter;
    return matchSearch && matchResult;
  });

  return (
    <PageLayout
      title="Audit Log"
      description="All state-changing actions with actor, target, and result context"
      actions={<Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export</Button>}
    >
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search audit entries..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={resultFilter} onValueChange={setResultFilter}>
            <SelectTrigger className="w-[130px]"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <motion.tr key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td className="text-muted-foreground whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="font-medium">{entry.actor}</td>
                  <td><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{entry.action}</code></td>
                  <td>{entry.target}</td>
                  <td className="text-muted-foreground max-w-[300px] truncate">{entry.details}</td>
                  <td><StatusBadge status={entry.result} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
