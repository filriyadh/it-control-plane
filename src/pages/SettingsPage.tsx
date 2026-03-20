import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Plug, Clock, Shield } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { motion } from "framer-motion";

export default function SettingsPage() {
  return (
    <PageLayout title="Settings & Integrations" description="Module configuration, integration connections, and policy settings">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integrations */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-5">
          <h2 className="section-title flex items-center gap-2"><Plug className="h-4 w-4" /> Integrations</h2>
          <div className="space-y-4">
            {[
              { name: "Microsoft Graph", status: "connected", lastSync: "5 min ago" },
              { name: "Exchange Online", status: "connected", lastSync: "12 min ago" },
              { name: "Sherweb Partner API", status: "not_configured", lastSync: "—" },
            ].map((integration, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{integration.name}</p>
                  <p className="text-xs text-muted-foreground">Last sync: {integration.lastSync}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={integration.status} />
                  <Button variant="outline" size="sm">
                    {integration.status === "connected" ? "Test" : "Configure"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stale Account Settings */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-5">
          <h2 className="section-title flex items-center gap-2"><Clock className="h-4 w-4" /> Stale Account Policy</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Inactivity Threshold (days)</Label>
              <Input type="number" defaultValue={90} className="mt-1 max-w-[200px]" />
            </div>
            <div>
              <Label className="text-sm">High Risk Threshold (days)</Label>
              <Input type="number" defaultValue={120} className="mt-1 max-w-[200px]" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-detect on schedule</p>
                <p className="text-xs text-muted-foreground">Run stale account detection daily at 3:00 AM</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notify IT managers</p>
                <p className="text-xs text-muted-foreground">Send digest of new stale accounts</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </motion.div>

        {/* Sync Settings */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg p-5">
          <h2 className="section-title flex items-center gap-2"><Settings className="h-4 w-4" /> Sync Schedule</h2>
          <div className="space-y-4">
            {[
              { name: "User Directory Sync", interval: "Every 2 hours", enabled: true },
              { name: "License Audit", interval: "Every 6 hours", enabled: true },
              { name: "Group Membership Sync", interval: "Every 4 hours", enabled: true },
              { name: "MFA Status Refresh", interval: "Every 8 hours", enabled: false },
              { name: "Security Posture Scan", interval: "Daily at 9:00 AM", enabled: true },
            ].map((sync, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{sync.name}</p>
                  <p className="text-xs text-muted-foreground">{sync.interval}</p>
                </div>
                <Switch defaultChecked={sync.enabled} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-lg p-5">
          <h2 className="section-title flex items-center gap-2"><Shield className="h-4 w-4" /> Security & Access</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Require approval for bulk actions</p>
                <p className="text-xs text-muted-foreground">Actions affecting 5+ users need approval</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Audit all configuration changes</p>
                <p className="text-xs text-muted-foreground">Log all settings modifications</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <Button variant="outline" className="w-full">Save Settings</Button>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
