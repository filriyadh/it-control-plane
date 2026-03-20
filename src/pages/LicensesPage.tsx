import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { licenseSubscriptions, licenseRecommendations } from "@/data/mock-data";
import { KeyRound, TrendingDown, AlertTriangle, Lightbulb, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function LicensesPage() {
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<"subscriptions" | "recommendations">("subscriptions");

  const totalAssigned = licenseSubscriptions.reduce((s, l) => s + l.assigned, 0);
  const totalAvailable = licenseSubscriptions.reduce((s, l) => s + l.available, 0);
  const totalCost = licenseSubscriptions.reduce((s, l) => s + l.total * l.monthlyCost, 0);
  const filtered = licenseSubscriptions.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageLayout title="License Manager" description="Subscription inventory, utilization, and optimization recommendations">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Licenses" value={licenseSubscriptions.reduce((s, l) => s + l.total, 0).toLocaleString()} icon={KeyRound} variant="info" />
        <MetricCard label="Assigned" value={totalAssigned.toLocaleString()} icon={KeyRound} variant="success" />
        <MetricCard label="Available" value={totalAvailable} icon={TrendingDown} variant="warning" />
        <MetricCard label="Monthly Cost" value={`$${totalCost.toLocaleString()}`} icon={KeyRound} variant="default" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-muted p-1 rounded-lg w-fit">
        <button onClick={() => setSelectedTab("subscriptions")} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${selectedTab === "subscriptions" ? "bg-card text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}>
          Subscriptions
        </button>
        <button onClick={() => setSelectedTab("recommendations")} className={`px-4 py-1.5 text-sm rounded-md transition-colors relative ${selectedTab === "recommendations" ? "bg-card text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}>
          Recommendations
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-warning text-warning-foreground text-[10px] flex items-center justify-center font-bold">{licenseRecommendations.length}</span>
        </button>
      </div>

      {selectedTab === "subscriptions" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search subscriptions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subscription</th>
                  <th>Utilization</th>
                  <th>Assigned / Total</th>
                  <th>Available</th>
                  <th>Cost/user/mo</th>
                  <th>Renewal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lic => {
                  const utilization = Math.round((lic.assigned / lic.total) * 100);
                  return (
                    <tr key={lic.id}>
                      <td className="font-medium">{lic.name}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Progress value={utilization} className="h-2 w-20" />
                          <span className="text-xs text-muted-foreground">{utilization}%</span>
                        </div>
                      </td>
                      <td>{lic.assigned} / {lic.total}</td>
                      <td className={lic.available <= 5 ? "text-destructive font-medium" : ""}>{lic.available}</td>
                      <td>${lic.monthlyCost}</td>
                      <td className="text-muted-foreground">{new Date(lic.renewalDate).toLocaleDateString()}</td>
                      <td><StatusBadge status={lic.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {selectedTab === "recommendations" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {licenseRecommendations.map(rec => (
            <div key={rec.id} className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                  rec.type === "reclaim" ? "bg-success/10 text-success" :
                  rec.type === "downgrade" ? "bg-info/10 text-info" :
                  "bg-warning/10 text-warning"
                }`}>
                  {rec.type === "reclaim" ? <TrendingDown className="h-4 w-4" /> :
                   rec.type === "downgrade" ? <Lightbulb className="h-4 w-4" /> :
                   <AlertTriangle className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{rec.license} — {rec.type}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{rec.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">{rec.count} affected users • Savings: {rec.savings}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Review</Button>
            </div>
          ))}
        </motion.div>
      )}
    </PageLayout>
  );
}
