import { PageLayout } from "@/components/PageLayout";
import { Mail, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { motion } from "framer-motion";

const mailboxRequests = [
  { id: "m1", mailbox: "shared-inbox@contoso.com", requester: "jdoe@contoso.com", accessType: "Full Access", status: "active", expiresAt: "2026-04-19", approvedBy: "admin@contoso.com" },
  { id: "m2", mailbox: "finance-shared@contoso.com", requester: "schen@contoso.com", accessType: "Send As", status: "pending_approval", expiresAt: "—", approvedBy: "—" },
  { id: "m3", mailbox: "hr-inbox@contoso.com", requester: "mthompson@contoso.com", accessType: "Full Access", status: "expired", expiresAt: "2026-03-01", approvedBy: "admin@contoso.com" },
  { id: "m4", mailbox: "exec-assistant@contoso.com", requester: "lpark@contoso.com", accessType: "Send on Behalf", status: "active", expiresAt: "2026-06-30", approvedBy: "itmanager@contoso.com" },
];

export default function MailboxAccessPage() {
  return (
    <PageLayout
      title="Mailbox Access"
      description="Manage mailbox delegation requests and active permissions"
      actions={<Button>New Access Request</Button>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Active Delegations" value={mailboxRequests.filter(m => m.status === "active").length} icon={Mail} variant="success" />
        <MetricCard label="Pending Approval" value={mailboxRequests.filter(m => m.status === "pending_approval").length} icon={Mail} variant="warning" />
        <MetricCard label="Expired" value={mailboxRequests.filter(m => m.status === "expired").length} icon={Mail} variant="neutral" />
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search mailbox access..." className="pl-9" />
          </div>
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
              </tr>
            </thead>
            <tbody>
              {mailboxRequests.map(req => (
                <motion.tr key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td className="font-medium">{req.mailbox}</td>
                  <td>{req.requester}</td>
                  <td><StatusBadge status={req.accessType} variant="neutral" /></td>
                  <td><StatusBadge status={req.status} /></td>
                  <td className="text-muted-foreground">{req.expiresAt}</td>
                  <td className="text-muted-foreground">{req.approvedBy}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
