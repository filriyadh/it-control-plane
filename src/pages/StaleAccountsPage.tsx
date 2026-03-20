import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { staleAccounts } from "@/data/mock-data";
import { UserX, Clock, ShieldAlert, Filter, Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function StaleAccountsPage() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState<typeof staleAccounts[0] | null>(null);
  const [actionDialog, setActionDialog] = useState<{ account: typeof staleAccounts[0]; action: string } | null>(null);

  const filtered = staleAccounts.filter(a => {
    const matchSearch = a.displayName.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === "all" || a.riskLevel === riskFilter;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchRisk && matchStatus;
  });

  const pendingCount = staleAccounts.filter(a => a.status === "pending_review").length;
  const highRiskCount = staleAccounts.filter(a => a.riskLevel === "high").length;

  return (
    <PageLayout title="Stale Accounts" description="Review and act on inactive user accounts">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Stale" value={staleAccounts.length} icon={UserX} variant="danger" />
        <MetricCard label="Pending Review" value={pendingCount} icon={Clock} variant="warning" />
        <MetricCard label="High Risk" value={highRiskCount} icon={ShieldAlert} variant="danger" />
        <MetricCard label="Avg Days Inactive" value={Math.round(staleAccounts.reduce((s, a) => s + a.daysSinceSignIn, 0) / staleAccounts.length)} icon={Clock} variant="info" />
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[140px]"><Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Risk" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="excluded">Excluded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Department</th>
                <th>Last Sign-In</th>
                <th>Days Inactive</th>
                <th>Risk</th>
                <th>Licenses</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(account => (
                <motion.tr key={account.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cursor-pointer" onClick={() => setSelectedAccount(account)}>
                  <td>
                    <div>
                      <p className="font-medium text-sm">{account.displayName}</p>
                      <p className="text-xs text-muted-foreground">{account.email}</p>
                    </div>
                  </td>
                  <td>{account.department}</td>
                  <td className="text-muted-foreground">{new Date(account.lastSignIn).toLocaleDateString()}</td>
                  <td className={account.daysSinceSignIn > 120 ? "text-destructive font-medium" : ""}>{account.daysSinceSignIn}</td>
                  <td><StatusBadge status={account.riskLevel} /></td>
                  <td>{account.licenses}</td>
                  <td><StatusBadge status={account.status} /></td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); setActionDialog({ account, action: "exclude" }); }}>Exclude from review</DropdownMenuItem>
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); setActionDialog({ account, action: "disable" }); }} className="text-destructive">Disable account</DropdownMenuItem>
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); setActionDialog({ account, action: "revoke" }); }} className="text-destructive">Revoke licenses</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{actionDialog?.action} Account</DialogTitle>
            <DialogDescription>
              {actionDialog?.action === "exclude"
                ? `Exclude ${actionDialog?.account.displayName} from stale account reviews. They will not appear in future scans.`
                : actionDialog?.action === "disable"
                ? `This will disable sign-in for ${actionDialog?.account.displayName}. This action requires approval.`
                : `Revoke all ${actionDialog?.account.licenses} licenses from ${actionDialog?.account.displayName}.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Reason</label>
            <Textarea placeholder="Provide a reason for this action..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
            <Button variant={actionDialog?.action === "exclude" ? "default" : "destructive"}>
              {actionDialog?.action === "exclude" ? "Exclude" : actionDialog?.action === "disable" ? "Submit for Approval" : "Revoke Licenses"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Panel */}
      <Dialog open={!!selectedAccount && !actionDialog} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedAccount?.displayName}</DialogTitle>
            <DialogDescription>{selectedAccount?.email}</DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Department</span><p className="font-medium">{selectedAccount.department}</p></div>
                <div><span className="text-muted-foreground">Last Sign-In</span><p className="font-medium">{new Date(selectedAccount.lastSignIn).toLocaleDateString()}</p></div>
                <div><span className="text-muted-foreground">Days Inactive</span><p className="font-medium">{selectedAccount.daysSinceSignIn}</p></div>
                <div><span className="text-muted-foreground">Risk Level</span><p><StatusBadge status={selectedAccount.riskLevel} /></p></div>
                <div><span className="text-muted-foreground">Licenses</span><p className="font-medium">{selectedAccount.licenses}</p></div>
                <div><span className="text-muted-foreground">Status</span><p><StatusBadge status={selectedAccount.status} /></p></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAccount(null)}>Close</Button>
            <Button variant="outline" onClick={() => { setActionDialog({ account: selectedAccount!, action: "exclude" }); }}>Exclude</Button>
            <Button variant="destructive" onClick={() => { setActionDialog({ account: selectedAccount!, action: "disable" }); }}>Disable Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
