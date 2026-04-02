

# Mail Flow Analytics Dashboard

## Overview

A new "Mail Flow" page under the Operations nav group that gives you a single-pane-of-glass view of your Exchange mail health, security posture, and anomalies — so you never have to click through dozens of Exchange admin reports.

## What We'll Build

### 1. Top-line Health Cards (8 cards, always visible)

A row of `MetricCard` components showing at-a-glance health with built-in alert thresholds:

| Card | Alert Condition |
|------|----------------|
| Inbound Volume (24h / 7d) | >2 std dev from baseline |
| Outbound Volume (24h / 7d) | >2 std dev from baseline |
| TLS Encryption % | Drops below 95% or any NoTLS |
| SMTP AUTH Clients (24h) | New client appears |
| Queue Depth | Any messages queued >1 hour |
| NDR Count | Spike above baseline |
| High-Risk Pool Usage % | Exceeds 10% |
| Auto-Forwards to External | Any new forwarding rules |

Cards with triggered alerts show the `danger` or `warning` variant with trend text explaining the issue.

### 2. Core Mailflow Trend Panel (center, full-width)

Two stacked charts using `recharts`:

- **Dual-line chart**: Inbound vs Outbound message volume over 14 days, with a toggle for 7-day rolling average overlay. Clearly shows drops (outages), spikes (abuse/campaigns), and asymmetric behavior.
- **Stacked bar chart** beneath it: Breakdown by mail category — Normal, Bulk, High Risk, Relay Pool — so you can see composition changes at a glance.

Time range selector: 24h / 7d / 30d tabs.

### 3. Anomaly Feed (right column)

A "Things That Changed" panel modeled after the existing Recent Activity feed, but focused on mail anomalies. Each entry has a severity dot and timestamp:

- New SMTP AUTH senders not previously seen
- Basic Auth usage detected
- TLS downgrade events (1.2 → 1.0 or NoTLS)
- Volume spikes from specific SMTP AUTH senders (e.g. "+400% vs baseline")
- New auto-forwarding rules to external domains
- NDR code spikes (5.7.x, 5.1.x)
- Domain suddenly routing through high-risk pool

### 4. Security / Detail Widgets (bottom grid, 2×2 or 3-col)

Four collapsible detail panels:

- **Top Domains**: Top 10 sending/receiving domains with volume bars, high-risk pool flag, and baseline comparison
- **NDR Breakdown**: Top NDR error codes, failed domains, trend sparkline
- **Queue Status**: Messages by age bracket (0–15m, 15–60m, >1h), grouped by connector/domain
- **Outbound Recipients**: Count vs tenant limit with trend line and early-warning indicator

### 5. Mock Data

New entries in `src/data/mock-data.ts`:

- `mailFlowMetrics` — the 8 top-line values plus alert states
- `mailFlowTimeSeries` — 14 days of inbound/outbound/category data
- `smtpAuthClients` — list of SMTP AUTH senders with volume/TLS info
- `mailAnomalies` — feed items with severity, text, timestamp
- `topDomains`, `ndrBreakdown`, `queueStatus`, `outboundRecipients` — detail widget data

All mock data will include a few triggered alert scenarios so the dashboard looks realistic out of the box (e.g., one new SMTP AUTH client, one TLS downgrade, a queue with aged messages).

## Files to Create / Edit

| File | Action |
|------|--------|
| `src/data/mock-data.ts` | Add mail flow mock data |
| `src/pages/MailFlowPage.tsx` | New page — health cards, charts, anomaly feed, detail widgets |
| `src/components/AppSidebar.tsx` | Add "Mail Flow" nav item under Operations (with `BarChart3` icon) |
| `src/App.tsx` | Add `/mail-flow` route |

## Technical Notes

- Uses existing `MetricCard`, `StatusBadge`, `PageLayout` components
- Charts built with `recharts` (already installed): `LineChart`, `BarChart`, `ResponsiveContainer`
- Anomaly feed reuses the dot+text pattern from the dashboard's Recent Activity
- Detail widgets use the existing card/border styling with collapsible sections via the `Collapsible` component
- No new dependencies required

