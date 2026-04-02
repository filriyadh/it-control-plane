import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { MetricCard } from "@/components/MetricCard";
import {
  Mail,
  MailOpen,
  Lock,
  Terminal,
  Layers,
  AlertTriangle,
  Flame,
  Forward,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  mailFlowMetrics,
  mailFlowTimeSeries,
  smtpAuthClients,
  mailAnomalies,
  topDomains,
  ndrBreakdown,
  queueStatus,
  outboundRecipients,
} from "@/data/mock-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const severityDot: Record<string, string> = {
  danger: "bg-destructive",
  warning: "bg-warning",
  info: "bg-info",
};

export default function MailFlowPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [showAverage, setShowAverage] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    domains: true,
    ndr: true,
    queue: true,
    recipients: true,
  });

  const m = mailFlowMetrics;

  // compute 7-day rolling average if toggled
  const chartData = mailFlowTimeSeries.map((d, i, arr) => {
    if (!showAverage || i < 6) return d;
    const slice = arr.slice(i - 6, i + 1);
    return {
      ...d,
      inboundAvg: Math.round(slice.reduce((s, x) => s + x.inbound, 0) / 7),
      outboundAvg: Math.round(slice.reduce((s, x) => s + x.outbound, 0) / 7),
    };
  });

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <PageLayout
      title="Mail Flow Analytics"
      description="Exchange mail health, security posture, and anomaly detection at a glance."
    >
      {/* ── Health Cards ─────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <MetricCard
          label="Inbound (24h / 7d)"
          value={m.inbound24h.toLocaleString()}
          icon={MailOpen}
          trend={`${m.inbound7d.toLocaleString()} past 7 days`}
          variant="default"
        />
        <MetricCard
          label="Outbound (24h / 7d)"
          value={m.outbound24h.toLocaleString()}
          icon={Mail}
          trend={`${m.outbound7d.toLocaleString()} past 7 days`}
          variant="default"
        />
        <MetricCard
          label="TLS Encryption"
          value={`${m.tlsPercent}%`}
          icon={Lock}
          trend={m.tlsPercent < 95 ? `⚠ ${m.tlsNoTls} NoTLS connections` : "All clear"}
          trendDirection={m.tlsPercent < 95 ? "down" : "up"}
          variant={m.tlsPercent < 95 ? "warning" : "success"}
        />
        <MetricCard
          label="SMTP AUTH Clients"
          value={m.smtpAuthClients24h}
          icon={Terminal}
          trend={m.newSmtpAuthClients > 0 ? `🆕 ${m.newSmtpAuthClients} new client` : "No changes"}
          trendDirection={m.newSmtpAuthClients > 0 ? "up" : "neutral"}
          variant={m.newSmtpAuthClients > 0 ? "danger" : "default"}
        />
        <MetricCard
          label="Queue Depth"
          value={m.queueDepth}
          icon={Layers}
          trend={m.queuedOver1h > 0 ? `${m.queuedOver1h} queued > 1 hour` : "Clear"}
          trendDirection={m.queuedOver1h > 0 ? "down" : "neutral"}
          variant={m.queuedOver1h > 0 ? "warning" : "success"}
        />
        <MetricCard
          label="NDR Count (24h)"
          value={m.ndrCount}
          icon={AlertTriangle}
          trend={m.ndrCount > m.ndrBaseline ? `↑ baseline ${m.ndrBaseline}` : "Normal"}
          trendDirection={m.ndrCount > m.ndrBaseline ? "up" : "neutral"}
          variant={m.ndrCount > m.ndrBaseline * 1.3 ? "danger" : "default"}
        />
        <MetricCard
          label="High-Risk Pool"
          value={`${m.highRiskPoolPercent}%`}
          icon={Flame}
          trend={m.highRiskPoolPercent > 10 ? "Exceeds 10% threshold" : "Within limits"}
          trendDirection={m.highRiskPoolPercent > 10 ? "up" : "neutral"}
          variant={m.highRiskPoolPercent > 10 ? "danger" : "success"}
        />
        <MetricCard
          label="Auto-Forwards (ext)"
          value={m.autoForwardsExternal}
          icon={Forward}
          trend={m.newAutoForwards > 0 ? `${m.newAutoForwards} new rules detected` : "No new rules"}
          trendDirection={m.newAutoForwards > 0 ? "up" : "neutral"}
          variant={m.newAutoForwards > 0 ? "warning" : "default"}
        />
      </div>

      {/* ── Main Content: Charts + Anomaly Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Charts Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trend Controls */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Inbound vs Outbound Volume</h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAverage}
                    onChange={(e) => setShowAverage(e.target.checked)}
                    className="rounded border-border"
                  />
                  7-day avg
                </label>
                <Tabs value={timeRange} onValueChange={setTimeRange}>
                  <TabsList className="h-7">
                    <TabsTrigger value="24h" className="text-xs px-2 py-0.5">24h</TabsTrigger>
                    <TabsTrigger value="7d" className="text-xs px-2 py-0.5">7d</TabsTrigger>
                    <TabsTrigger value="30d" className="text-xs px-2 py-0.5">30d</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="inbound" stroke="hsl(var(--info))" strokeWidth={2} dot={false} name="Inbound" />
                <Line type="monotone" dataKey="outbound" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Outbound" />
                {showAverage && (
                  <>
                    <Line type="monotone" dataKey="inboundAvg" stroke="hsl(var(--info))" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Inbound Avg" />
                    <Line type="monotone" dataKey="outboundAvg" stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Outbound Avg" />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stacked Category Bar */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Mail Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="normal" stackId="cat" fill="hsl(var(--success))" name="Normal" radius={[0, 0, 0, 0]} />
                <Bar dataKey="bulk" stackId="cat" fill="hsl(var(--warning))" name="Bulk" />
                <Bar dataKey="highRisk" stackId="cat" fill="hsl(var(--destructive))" name="High Risk" />
                <Bar dataKey="relay" stackId="cat" fill="hsl(var(--info))" name="Relay" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Feed Column (1/3) */}
        <div className="bg-card border border-border rounded-xl p-5 h-fit">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            Things That Changed
          </h3>
          <div className="space-y-3">
            {mailAnomalies.map((a) => (
              <div key={a.id} className="flex items-start gap-2.5">
                <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${severityDot[a.severity]}`} />
                <div className="min-w-0">
                  <p className="text-xs text-foreground leading-relaxed">{a.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* SMTP AUTH Clients mini-table */}
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">SMTP AUTH Clients</h4>
            <div className="space-y-2">
              {smtpAuthClients.map((c) => (
                <div key={c.id} className={`flex items-center justify-between text-xs p-2 rounded-lg ${c.isNew ? "bg-destructive/5 border border-destructive/20" : "bg-muted/40"}`}>
                  <div className="min-w-0">
                    <p className={`font-medium truncate ${c.isNew ? "text-destructive" : "text-foreground"}`}>
                      {c.isNew && "🆕 "}{c.displayName}
                    </p>
                    <p className="text-muted-foreground truncate">{c.sender}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="font-mono">{c.volume24h}</p>
                    <p className={`text-[10px] ${c.tls === "TLS 1.0" ? "text-destructive" : "text-muted-foreground"}`}>{c.tls} · {c.authType}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Widgets ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-8">
        {/* Top Domains */}
        <Collapsible open={openSections.domains} onOpenChange={() => toggle("domains")}>
          <div className="bg-card border border-border rounded-xl">
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-t-xl">
              <h3 className="text-sm font-semibold text-foreground">Top Domains</h3>
              {openSections.domains ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">Domain</th>
                      <th className="text-right py-2 font-medium">In</th>
                      <th className="text-right py-2 font-medium">Out</th>
                      <th className="text-right py-2 font-medium">Δ</th>
                      <th className="text-right py-2 font-medium">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDomains.map((d) => (
                      <tr key={d.domain} className="border-b border-border/50 last:border-0">
                        <td className="py-2 font-medium text-foreground">{d.domain}</td>
                        <td className="text-right py-2 text-muted-foreground">{d.inbound.toLocaleString()}</td>
                        <td className="text-right py-2 text-muted-foreground">{d.outbound.toLocaleString()}</td>
                        <td className={`text-right py-2 ${d.change.startsWith("+") && parseInt(d.change) > 50 ? "text-destructive font-medium" : "text-muted-foreground"}`}>{d.change}</td>
                        <td className="text-right py-2">
                          {d.highRisk && <span className="inline-block px-1.5 py-0.5 bg-destructive/10 text-destructive rounded text-[10px] font-medium">HIGH</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* NDR Breakdown */}
        <Collapsible open={openSections.ndr} onOpenChange={() => toggle("ndr")}>
          <div className="bg-card border border-border rounded-xl">
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-t-xl">
              <h3 className="text-sm font-semibold text-foreground">NDR Breakdown</h3>
              {openSections.ndr ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-3">
                {ndrBreakdown.map((n) => (
                  <div key={n.code} className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-medium text-foreground">{n.code}</span>
                      <span className="text-xs text-muted-foreground ml-2">{n.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{n.count}</span>
                      {n.trend === "up" && <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />}
                      {n.trend === "down" && <ArrowDownRight className="h-3.5 w-3.5 text-success" />}
                      {n.trend === "stable" && <span className="text-[10px] text-muted-foreground">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Queue Status */}
        <Collapsible open={openSections.queue} onOpenChange={() => toggle("queue")}>
          <div className="bg-card border border-border rounded-xl">
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-t-xl">
              <h3 className="text-sm font-semibold text-foreground">Queue Status</h3>
              {openSections.queue ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">Age Bracket</th>
                      <th className="text-right py-2 font-medium">Messages</th>
                      <th className="text-left py-2 font-medium pl-4">Connector</th>
                      <th className="text-left py-2 font-medium">Domain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueStatus.map((q, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${q.bracket.includes("1 hour") ? "bg-destructive/5" : ""}`}>
                        <td className={`py-2 font-medium ${q.bracket.includes("1 hour") ? "text-destructive" : "text-foreground"}`}>{q.bracket}</td>
                        <td className="text-right py-2 font-semibold text-foreground">{q.count}</td>
                        <td className="py-2 text-muted-foreground pl-4">{q.connector}</td>
                        <td className="py-2 text-muted-foreground">{q.domain}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Outbound Recipients */}
        <Collapsible open={openSections.recipients} onOpenChange={() => toggle("recipients")}>
          <div className="bg-card border border-border rounded-xl">
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-t-xl">
              <h3 className="text-sm font-semibold text-foreground">Outbound External Recipients</h3>
              {openSections.recipients ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{outboundRecipients.current.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">of {outboundRecipients.limit.toLocaleString()} tenant limit</p>
                  </div>
                  <p className={`text-sm font-semibold ${outboundRecipients.current / outboundRecipients.limit > 0.8 ? "text-warning" : "text-success"}`}>
                    {Math.round((outboundRecipients.current / outboundRecipients.limit) * 100)}%
                  </p>
                </div>
                <Progress value={(outboundRecipients.current / outboundRecipients.limit) * 100} className="h-2 mb-4" />
                <ResponsiveContainer width="100%" height={80}>
                  <AreaChart data={outboundRecipients.trend.map((v, i) => ({ day: outboundRecipients.trendLabels[i], value: v }))}>
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={1.5} />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                {outboundRecipients.current / outboundRecipients.limit > 0.8 && (
                  <p className="text-xs text-warning mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Approaching tenant limit — consider reviewing external recipients
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </PageLayout>
  );
}