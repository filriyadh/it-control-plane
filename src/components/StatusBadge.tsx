interface StatusBadgeProps {
  status: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}

const autoVariant = (status: string): StatusBadgeProps["variant"] => {
  const s = status.toLowerCase();
  if (["completed", "active", "success", "healthy", "enabled", "resolved"].some(k => s.includes(k))) return "success";
  if (["warning", "review", "pending", "queued", "medium"].some(k => s.includes(k))) return "warning";
  if (["failed", "error", "critical", "high", "disabled", "danger"].some(k => s.includes(k))) return "danger";
  if (["running", "in_progress", "info", "syncing"].some(k => s.includes(k))) return "info";
  return "neutral";
};

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const v = variant || autoVariant(status);
  const label = status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span className={`status-badge status-${v}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        v === "success" ? "bg-success" :
        v === "warning" ? "bg-warning" :
        v === "danger" ? "bg-destructive" :
        v === "info" ? "bg-info" :
        "bg-muted-foreground"
      }`} />
      {label}
    </span>
  );
}
