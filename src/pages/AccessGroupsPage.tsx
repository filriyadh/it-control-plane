import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { groups } from "@/data/mock-data";
import { Users, Shield, Search, ChevronRight, Plus, UserPlus, UserMinus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/MetricCard";
import { motion } from "framer-motion";

export default function AccessGroupsPage() {
  const [search, setSearch] = useState("");
  const [showPrivilegedOnly, setShowPrivilegedOnly] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<typeof groups[0] | null>(null);
  const [membershipDialog, setMembershipDialog] = useState<{ group: typeof groups[0]; action: "add" | "remove" } | null>(null);

  const filtered = groups.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchPriv = !showPrivilegedOnly || g.isPrivileged;
    return matchSearch && matchPriv;
  });

  const privilegedCount = groups.filter(g => g.isPrivileged).length;
  const totalMembers = groups.reduce((s, g) => s + g.members, 0);

  return (
    <PageLayout
      title="Access & Groups"
      description="Inspect group memberships and request access changes"
      actions={
        <Button onClick={() => setMembershipDialog({ group: groups[0], action: "add" })}>
          <Plus className="h-4 w-4 mr-1" /> Request Change
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Total Groups" value={groups.length} icon={Users} variant="info" />
        <MetricCard label="Privileged Groups" value={privilegedCount} icon={Shield} variant="warning" />
        <MetricCard label="Total Memberships" value={totalMembers.toLocaleString()} icon={Users} variant="default" />
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant={showPrivilegedOnly ? "default" : "outline"} size="sm" onClick={() => setShowPrivilegedOnly(!showPrivilegedOnly)}>
            <Shield className="h-3 w-3 mr-1" /> Privileged Only
          </Button>
        </div>

        <div className="divide-y divide-border">
          {filtered.map(group => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedGroup(group)}
            >
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${group.isPrivileged ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>
                  {group.isPrivileged ? <Shield className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    {group.name}
                    {group.isPrivileged && <span className="status-badge status-warning text-[10px]">Privileged</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{group.type} • {group.members} members</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Group Detail Dialog */}
      <Dialog open={!!selectedGroup && !membershipDialog} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedGroup?.name}</DialogTitle>
            <DialogDescription>{selectedGroup?.type} group • {selectedGroup?.source}</DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Members</span><p className="font-medium">{selectedGroup.members}</p></div>
                <div><span className="text-muted-foreground">Privileged</span><p>{selectedGroup.isPrivileged ? <StatusBadge status="high" /> : <StatusBadge status="low" variant="neutral" />}</p></div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-2">Recent Members (sample)</p>
                <div className="space-y-1 text-sm">
                  <p>admin@contoso.com</p>
                  <p>helpdesk@contoso.com</p>
                  <p>itmanager@contoso.com</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedGroup(null)}>Close</Button>
            <Button variant="outline" onClick={() => { if (selectedGroup) setMembershipDialog({ group: selectedGroup, action: "remove" }); }}>
              <UserMinus className="h-3 w-3 mr-1" /> Remove Member
            </Button>
            <Button onClick={() => { if (selectedGroup) setMembershipDialog({ group: selectedGroup, action: "add" }); }}>
              <UserPlus className="h-3 w-3 mr-1" /> Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Membership Change Dialog */}
      <Dialog open={!!membershipDialog} onOpenChange={() => setMembershipDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{membershipDialog?.action === "add" ? "Add Member to Group" : "Remove Member from Group"}</DialogTitle>
            <DialogDescription>
              {membershipDialog?.action === "add"
                ? "Request to add a user to a group. Privileged group changes require approval."
                : "Request to remove a user from a group. This action will be audited."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Group</Label>
              <Select defaultValue={membershipDialog?.group.id}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {groups.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name} {g.isPrivileged ? "⚠️" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>User Email</Label>
              <Input placeholder="user@contoso.com" className="mt-1" />
            </div>
            <div>
              <Label>Business Justification</Label>
              <Textarea placeholder="Explain why this change is needed..." className="mt-1" />
            </div>
            {membershipDialog?.group.isPrivileged && (
              <div className="bg-warning/10 text-warning text-sm px-3 py-2 rounded flex items-center gap-2">
                <Shield className="h-4 w-4" />
                This is a privileged group — changes require approval workflow.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMembershipDialog(null)}>Cancel</Button>
            <Button onClick={() => setMembershipDialog(null)}>
              {membershipDialog?.group.isPrivileged ? "Submit for Approval" : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
