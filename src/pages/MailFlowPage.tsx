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
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ExternalLink,
  Search,
  UserX,
  RefreshCw,
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
import { Button } from "@/components/ui/button";
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
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
} from "recharts";

/* ── Severity scoring ────────────────────────── */
function computeHealthScore() {
  const m = mailFlowMetrics;
  let score = 0;
  if (m.queuedOver1h > 0) score += 1;
  if (m.newSmtpAuthClients > 0) score += 2;
  if (m.tlsNoTls > 0) score += 2;
  if (m.highRiskPoolPercent > 10) score += 3;
  if (m.newAutoForwards > 0) score += 2;
  if (m.ndrCount > m.ndrBaseline * 1.3) score += 2;
  return score;
}

function healthLabel(score: number) {
  if (score <= 2) return { label: "Healthy", color: "bg-success text-success-foreground", dot: "bg-success" };
  if (score <= 5) return { label: "Warning", color: "bg-warning text-warning-foreground", dot: "bg-warning" };
  return { label: "Critical", color: "bg-destructive text-destructive-foreground", dot: "bg-destructive" };
}

/* ── Anomaly grouping ────────────────────────── */
type AnomalyGroup = "critical" | "warning" | "new" | "resolved";

const resolvedAnomalies = [
  { id: "mr1", text: "partner.org queue cleared — no messages pending", time: "12h ago" },
  { id: "mr2", text: "TLS 1.0 connection from legacy-app remediated", time: "1d ago" },
];

function groupAnomaly(a: { severity: string }): AnomalyGroup {
  if (a.severity === "danger") return "critical";
  if (a.severity === "warning") return "warning";
  return "new";
}

const groupConfig: Record<AnomalyGroup, { label: string; dot: string; icon: string }> = {
  critical: { label: "Critical", dot: "bg-destructive", icon: "🔴" },
  warning: { label: "Warning", dot: "bg-warning", icon: "🟠" },
  new: { label: "New / Informational", dot: "bg-info", icon: "🔵" },
  resolved: { label: "Resolved", dot: "bg-success", icon: "🟢" },
};

const actionForAnomaly = (text: string): { label: string; icon: typeof Search } | null => {
  if (text.toLowerCase().includes("smtp auth") || text.toLowerCase().includes("autobot"))
    return { label: "Investigate", icon: Search };
  if (text.toLowerCase().includes("queue"))
    return { label: "Open queue", icon: Layers };
  if (text.toLowerCase().includes("forward"))
    return { label: "Review rules", icon: ExternalLink };
  if (text.toLowerCase().includes("high-risk") || text.toLowerCase().includes("pool"))
    return { label: "View details", icon: ShieldAlert };
  return null;
};

/* ── Suspicious accounts logic ───────────────── */
function getSuspiciousAccounts() {
  return smtpAuthClients
    .filter((c) => {
      let flags = 0;
      if (c.isNew) flags++;
      if (c.authType === "Basic") flags++;
      if (c.tls === "TLS 1.0") flags++;
      if (c.volume24h > 200) flags++;
      return flags >= 2;
    })
    .map((c) => {
      const flags: string[] = [];
      if (c.isNew) flags.push("New sender");
      if (c.tls === "TLS 1.0") flags.push("TLS 1.0");
      if (c.authType === "Basic") flags.push("Basic Auth");
      if (c.volume24h > 200) flags.push(`High volume (${c.volume24h})`);
      return { ...c, flags };
    });
}

/* ── Baseline band computation ───────────────── */
function computeChartDataWithBaseline(showAverage: boolean) {
  return mailFlowTimeSeries.map((d, i, arr) => {
    const inboundBaseline = arr.reduce((s, x) => s + x.inbound, 0) / arr.length;
    const outboundBaseline = arr.reduce((s, x) => s + x.outbound, 0) / arr.length;
    const inboundStd = Math.sqrt(arr.reduce((s, x) => s + Math.pow(x.inbound - inboundBaseline, 2), 0) / arr.length);
    const outboundStd = Math.sqrt(arr.reduce((s, x) => s + Math.pow(x.outbound - outboundBaseline, 2), 0) / arr.length);

    const entry: Record<string, unknown> = {
      ...d,
      inboundBaselineUpper: Math.round(inboundBaseline + 2 * inboundStd),
      inboundBaselineLower: Math.round(inboundBaseline - 2 * inboundStd),
      outboundBaselineUpper: Math.round(outboundBaseline + 2 * outboundStd),
      outboundBaselineLower: Math.round(outboundBaseline - 2 * outboundStd),
      isAnomaly: d.outbound > outboundBaseline + 2 * outboundStd || d.inbound > inboundBaseline + 2 * inboundStd,
    };

    if (showAverage && i >= 6) {
      const slice = arr.slice(i - 6, i + 1);
      entry.inboundAvg = Math.round(slice.reduce((s, x) => s + x.inbound, 0) / 7);
      entry.outboundAvg = Math.round(slice.reduce((s, x) => s + x.outbound, 0) / 7);
    }

    return entry;
  });
}

/* ── SMTP AUTH baseline delta ────────────────── */
function getBaselineDelta(client: typeof smtpAuthClients[0]) {
  if (client.isNew) return { label: "+400%", variant: "danger" as const };
  if (client.volume24h > 100) return { label: "+12%", variant: "warning" as const };
  return { label: "Normal", variant: "normal" as const };
}

const severityDot: Record<string, string> = {
  danger: "bg-destructive",
  warning: "bg-warning",
  info: "bg-info",
};

export default function MailFlowPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [showAverage, setShowAverage] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    domains: false,
    ndr: false,
    queue: true,
    recipients: true,
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const m = mailFlowMetrics;
  const healthScore = computeHealthScore();
  const health = healthLabel(healthScore);
  const suspiciousAccounts = getSuspiciousAccounts();
  const chartData = computeChartDataWithBaseline(showAverage);

  const groupedAnomalies = {
    critical: mailAnomalies.filter((a) => groupAnomaly(a) === "critical"),
    warning: mailAnomalies.filter((a) => groupAnomaly(a) === "warning"),
    new: mailAnomalies.filter((a) => groupAnomaly(a) === "new"),
    resolved: resolvedAnomalies,
  };

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const lastUpdated = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  // Find longest queued message
  const longestQueued = queueStatus.find((q) => q.bracket.includes("1 hour"));

  return (
    <PageLayout
      title="Mail Flow Analytics"
      description="Exchange mail health, security posture, and anomaly detection at a glance."
      actions={
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Last updated: {lastUpdated}
          </span>
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList className="h-7">
              <TabsTrigger value="24h" className="text-xs px-2 py-0.5">24h</TabsTrigger>
              <TabsTrigger value="7d" className="text-xs px-2 py-0.5">7d</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs px-2 py-0.5">30d</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
        </div>
      }
    >
      {/* ── Overall Health Badge ──────────────────── */}
      <div className="flex items-center gap-3 mt-4 mb-2">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${health.color}`}>
          <span className={`h-2 w-2 rounded-full ${health.dot} animate-pulse`} />
          System {health.label}
        </div>
        <span className="text-xs text-muted-foreground">
          Score: {healthScore} — {healthScore <= 2 ? "No active incidents" : healthScore <= 5 ? "Some items need attention" : "Multiple issues require action"}
        </span>
      </div>

      {/* ── Health Cards ─────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <MetricCard
          label="Inbound (24h)"
          value={m.inbound24h.toLocaleString()}
          icon={MailOpen}
          trend="+18% vs yesterday · +6% vs 7d avg"
          trendDirection="up"
          variant="default"
        />
        <MetricCard
          label="Outbound (24h)"
          value={m.outbound24h.toLocaleString()}
          icon={Mail}
          trend="+22% vs yesterday · +9% vs 7d avg"
          trendDirection="up"
          variant="default"
        />
        <MetricCard
          label="TLS Encryption"
          value={`${m.tlsPercent}%`}
          icon={Lock}
          trend={m.tlsPercent < 95 ? `-${(98 - m.tlsPercent).toFixed(1)}% vs 7d avg · ${m.tlsNoTls} NoTLS` : "All clear"}
          trendDirection={m.tlsPercent < 95 ? "down" : "up"}
          variant={m.tlsPercent < 95 ? "warning" : "success"}
        />
        <MetricCard
          label="SMTP AUTH Clients"
          value={m.smtpAuthClients24h}
          icon={Terminal}
          trend={m.newSmtpAuthClients > 0 ? `🆕 ${m.newSmtpAuthClients} new client detected` : "No changes"}
          trendDirection={m.newSmtpAuthClients > 0 ? "up" : "neutral"}
          variant={m.newSmtpAuthClients > 0 ? "danger" : "default"}
        />
        <MetricCard
          label="Queue Depth"
          value={m.queueDepth}
          icon={Layers}
          trend={m.queuedOver1h > 0 ? `${m.queuedOver1h} queued > 1h · +2 from yesterday` : "Clear"}
          trendDirection={m.queuedOver1h > 0 ? "down" : "neutral"}
          variant={m.queuedOver1h > 0 ? "warning" : "success"}
        />
        <MetricCard
          label="NDR Count (24h)"
          value={m.ndrCount}
          icon={AlertTriangle}
          trend={m.ndrCount > m.ndrBaseline ? `+${Math.round(((m.ndrCount - m.ndrBaseline) / m.ndrBaseline) * 100)}% vs baseline (${m.ndrBaseline})` : "Normal"}
          trendDirection={m.ndrCount > m.ndrBaseline ? "up" : "neutral"}
          variant={m.ndrCount > m.ndrBaseline * 1.3 ? "danger" : "default"}
        />
        <MetricCard
          label="High-Risk Pool"
          value={`${m.highRiskPoolPercent}%`}
          icon={Flame}
          trend={m.highRiskPoolPercent > 10 ? "Exceeds 10% threshold · +8.4% vs 7d avg" : "Within limits"}
          trendDirection={m.highRiskPoolPercent > 10 ? "up" : "neutral"}
          variant={m.highRiskPoolPercent > 10 ? "danger" : "success"}
        />
        <MetricCard
          label="Auto-Forwards (ext)"
          value={m.autoForwardsExternal}
          icon={Forward}
          trend={m.newAutoForwards > 0 ? `${m.newAutoForwards} new rules · Review recommended` : "No new rules"}
          trendDirection={m.newAutoForwards > 0 ? "up" : "neutral"}
          variant={m.newAutoForwards > 0 ? "warning" : "default"}
        />
      </div>

      {/* ── Main Content: Charts + Anomaly Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Charts Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trend Chart with baseline band */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Inbound vs Outbound Volume</h3>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAverage}
                  onChange={(e) => setShowAverage(e.target.checked)}
                  className="rounded border-border"
                />
                7-day avg
              </label>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
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
                {/* Baseline band for outbound */}
                <Area
                  type="monotone"
                  dataKey="outboundBaselineUpper"
                  stroke="none"
                  fill="hsl(var(--primary) / 0.06)"
                  name="Expected range"
                  legendType="none"
                />
                <Area
                  type="monotone"
                  dataKey="outboundBaselineLower"
                  stroke="none"
                  fill="hsl(var(--card))"
                  legendType="none"
                />
                <Line type="monotone" dataKey="inbound" stroke="hsl(var(--info))" strokeWidth={2} dot={false} name="Inbound" />
                <Line
                  type="monotone"
                  dataKey="outbound"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={(props: Record<string, unknown>) => {
                    const { cx, cy, payload } = props as { cx: number; cy: number; payload: { isAnomaly?: boolean } };
                    if (payload?.isAnomaly) {
                      return (
                        <circle
                          key={`anomaly-${cx}`}
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill="hsl(var(--destructive))"
                          stroke="hsl(var(--card))"
                          strokeWidth={2}
                        />
                      );
                    }
                    return <circle key={`dot-${cx}`} cx={cx} cy={cy} r={0} />;
                  }}
                  name="Outbound"
                />
                {showAverage && (
                  <>
                    <Line type="monotone" dataKey="inboundAvg" stroke="hsl(var(--info))" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Inbound Avg" />
                    <Line type="monotone" dataKey="outboundAvg" stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Outbound Avg" />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-muted-foreground mt-2">
              <span className="inline-block h-2 w-2 rounded-full bg-destructive mr-1" />
              Red dots indicate anomalies (&gt;2 std dev from baseline). Shaded area = expected range.
            </p>
          </div>

          {/* Stacked Category Bar with filter */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Mail Category Breakdown</h3>
              <div className="flex items-center gap-1">
                {["normal", "bulk", "highRisk", "relay"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      activeCategory === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat === "highRisk" ? "High Risk" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
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
                <Bar
                  dataKey="normal"
                  stackId="cat"
                  fill="hsl(var(--success))"
                  name="Normal"
                  opacity={!activeCategory || activeCategory === "normal" ? 1 : 0.15}
                />
                <Bar
                  dataKey="bulk"
                  stackId="cat"
                  fill="hsl(var(--warning))"
                  name="Bulk"
                  opacity={!activeCategory || activeCategory === "bulk" ? 1 : 0.15}
                />
                <Bar
                  dataKey="highRisk"
                  stackId="cat"
                  fill="hsl(var(--destructive))"
                  name="High Risk"
                  opacity={!activeCategory || activeCategory === "highRisk" ? 1 : 0.15}
                />
                <Bar
                  dataKey="relay"
                  stackId="cat"
                  fill="hsl(var(--info))"
                  name="Relay"
                  radius={[2, 2, 0, 0]}
                  opacity={!activeCategory || activeCategory === "relay" ? 1 : 0.15}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Suspicious Accounts Widget */}
          {suspiciousAccounts.length > 0 && (
            <div className="bg-card border border-destructive/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <UserX className="h-4 w-4 text-destructive" />
                Suspicious Accounts
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Accounts matching multiple risk criteria (new sender + basic auth + TLS downgrade + high volume)
              </p>
              <div className="space-y-3">
                {suspiciousAccounts.map((acc) => (
                  <div key={acc.id} className="flex items-start justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/15">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{acc.sender}</p>
                      <p className="text-[10px] text-muted-foreground">{acc.displayName} · First seen: {acc.firstSeen}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {acc.flags.map((flag) => (
                          <span
                            key={flag}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-destructive/10 text-destructive"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] text-destructive border-destructive/30 hover:bg-destructive/10">
                      Investigate
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Anomaly Feed Column (1/3) */}
        <div className="space-y-6">
          {/* Grouped Anomaly Feed */}
          <div className="bg-card border border-border rounded-xl p-5 h-fit">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Things That Changed
            </h3>
            <div className="space-y-4">
              {(["critical", "warning", "new", "resolved"] as AnomalyGroup[]).map((group) => {
                const items = group === "resolved"
                  ? resolvedAnomalies.map((r) => ({ ...r, severity: "resolved" }))
                  : groupedAnomalies[group];
                if (items.length === 0) return null;
                const cfg = groupConfig[group];
                return (
                  <div key={group}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                      <span>{cfg.icon}</span> {cfg.label}
                    </p>
                    <div className="space-y-2">
                      {items.map((a) => {
                        const action = group !== "resolved" ? actionForAnomaly(a.text) : null;
                        return (
                          <div key={a.id} className="flex items-start gap-2.5 group/item">
                            <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${cfg.dot}`} />
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs leading-relaxed ${group === "resolved" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                {a.text}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] text-muted-foreground">{a.time}</p>
                                {action && (
                                  <button className="text-[10px] text-primary hover:underline opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-0.5">
                                    <action.icon className="h-2.5 w-2.5" />
                                    {action.label}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SMTP AUTH Clients panel */}
          <div className="bg-card border border-border rounded-xl p-5 h-fit">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">SMTP AUTH Clients</h4>
            <div className="space-y-2">
              {smtpAuthClients.map((c) => {
                const delta = getBaselineDelta(c);
                return (
                  <div key={c.id} className={`text-xs p-2.5 rounded-lg ${c.isNew ? "bg-destructive/5 border border-destructive/20" : "bg-muted/40"}`}>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className={`font-medium truncate ${c.isNew ? "text-destructive" : "text-foreground"}`}>
                          {c.isNew && "🆕 "}{c.displayName}
                        </p>
                        <p className="text-muted-foreground truncate">{c.sender}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="font-mono font-semibold">{c.volume24h}</p>
                        <span className={`text-[10px] font-medium ${
                          delta.variant === "danger" ? "text-destructive" :
                          delta.variant === "warning" ? "text-warning" :
                          "text-success"
                        }`}>
                          {delta.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span>First seen: {c.firstSeen}</span>
                      <span className={c.tls === "TLS 1.0" ? "text-destructive font-medium" : ""}>{c.tls}</span>
                      <span className={c.authType === "Basic" ? "text-warning font-medium" : ""}>{c.authType}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Widgets ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-8">
        {/* Top Domains — collapsed by default */}
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
                          {d.highRisk && (
                            <button className="inline-block px-1.5 py-0.5 bg-destructive/10 text-destructive rounded text-[10px] font-medium hover:bg-destructive/20 transition-colors cursor-pointer">
                              HIGH
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* NDR Breakdown — collapsed by default */}
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

        {/* Queue Status — with aging detail */}
        <Collapsible open={openSections.queue} onOpenChange={() => toggle("queue")}>
          <div className="bg-card border border-border rounded-xl">
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-t-xl">
              <h3 className="text-sm font-semibold text-foreground">Queue Status</h3>
              {openSections.queue ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                {longestQueued && (
                  <div className="mb-3 p-2.5 rounded-lg bg-destructive/5 border border-destructive/15 text-xs">
                    <p className="text-destructive font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Longest queued: 1h 42m via {longestQueued.connector} → {longestQueued.domain}
                    </p>
                    <p className="text-muted-foreground mt-0.5">Connector timeout — consider checking partner relay configuration</p>
                  </div>
                )}
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
