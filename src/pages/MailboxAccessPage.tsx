import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Mail, Search, Plus, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

const mailboxRequests = [
  { id: "m1", mailbox: "shared-inbox@contoso.com", requester: "jdoe@contoso.com", accessType: "Full Access", status: "active", expiresAt: "2026-04-19", approvedBy: "admin@contoso.com" },
  { id: "m2", mailbox: "finance-shared@contoso.com", requester: "schen@contoso.com", accessType: "Send As", status: "pending_approval", expiresAt: "—", approvedBy: "—" },
  { id: "m3", mailbox: "hr-inbox@contoso.com", requester: "mthompson@contoso.com", accessType: "Full Access", status: "expired", expiresAt: "2026-03-01", approvedBy: "admin@contoso.com" },
  { id: "m4", mailbox: "exec-assistant@contoso.com", requester: "lpark@contoso.com", accessType: "Send on Behalf", status: "active", expiresAt: "2026-06-30", approvedBy: "itmanager@contoso.com" },
];

export default function MailboxAccessPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [revokeDialog, setRevokeDialog] = useState<typeof mailboxRequests[0] | null>(null);

  const filtered = mailboxRequests.filter(m => {
    const matchSearch = m.mailbox.toLowerCase().includes(search.toLowerCase()) || m.requester.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <PageLayout
      title="Mailbox Access"
      description="Manage mailbox delegation requests and active permissions"
      actions={<Button onClick={() => setShowNewRequest(true)}><Plus className="h-4 w-4 mr-1" /> New Access Request</Button>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Active Delegations" value={mailboxRequests.filter(m => m.status === "active").length} icon={Mail} variant="success" />
        <MetricCard label="Pending Approval" value={mailboxRequests.filter(m => m.status === "pending_approval").length} icon={Clock} variant="warning" />
        <MetricCard label="Expired" value={mailboxRequests.filter(m => m.status === "expired").length} icon={Mail} variant="neutral" />
        <MetricCard label="Total Requests" value={mailboxRequests.length} icon={Mail} variant="info" />
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search mailbox access..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending_approval">Pending</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mailbox</th>
                <th>Requester</th>
                <th>Access Type</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Approved By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => (
                <motion.tr key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td className="font-medium">{req.mailbox}</td>
                  <td>{req.requester}</td>
                  <td><StatusBadge status={req.accessType} variant="neutral" /></td>
                  <td><StatusBadge status={req.status} /></td>
                  <td className="text-muted-foreground">{req.expiresAt}</td>
                  <td className="text-muted-foreground">{req.approvedBy}</td>
                  <td>
                    {req.status === "active" && (
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setRevokeDialog(req)}>
                        <X className="h-3 w-3 mr-1" /> Revoke
                      </Button>
                    )}
                    {req.status === "pending_approval" && (
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="text-success">Approve</Button>
                        <Button variant="ghost" size="sm" className="text-destructive">Deny</Button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Dialog */}
      <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Mailbox Access Request</DialogTitle>
            <DialogDescription>Request delegation access to a shared mailbox. This will be routed for approval.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Target Mailbox</Label>
              <Input placeholder="shared-inbox@contoso.com" className="mt-1" />
            </div>
            <div>
              <Label>Requesting User</Label>
              <Input placeholder="user@contoso.com" className="mt-1" />
            </div>
            <div>
              <Label>Access Type</Label>
              <Select>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select access type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_access">Full Access</SelectItem>
                  <SelectItem value="send_as">Send As</SelectItem>
                  <SelectItem value="send_on_behalf">Send on Behalf</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input type="date" className="mt-1" />
            </div>
            <div>
              <Label>Business Justification</Label>
              <Textarea placeholder="Explain why this access is needed..." className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRequest(false)}>Cancel</Button>
            <Button onClick={() => setShowNewRequest(false)}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog open={!!revokeDialog} onOpenChange={() => setRevokeDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Mailbox Access</DialogTitle>
            <DialogDescription>
              Remove {revokeDialog?.accessType} access for {revokeDialog?.requester} on {revokeDialog?.mailbox}. This action will be logged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Reason</Label>
            <Textarea placeholder="Reason for revoking access..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setRevokeDialog(null)}>Revoke Access</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
