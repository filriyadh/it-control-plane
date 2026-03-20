import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { groups } from "@/data/mock-data";
import { Users, Shield, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MetricCard } from "@/components/MetricCard";
import { motion } from "framer-motion";

export default function AccessGroupsPage() {
  const [search, setSearch] = useState("");
  const [showPrivilegedOnly, setShowPrivilegedOnly] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<typeof groups[0] | null>(null);

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
      actions={<Button>Request Membership Change</Button>}
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

      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
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
            <Button>Request Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
