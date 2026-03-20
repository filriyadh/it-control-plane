import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  href?: string;
}

const variantStyles = {
  default: "border-border",
  success: "border-l-4 border-l-success border-t-0 border-r-0 border-b-0",
  warning: "border-l-4 border-l-warning border-t-0 border-r-0 border-b-0",
  danger: "border-l-4 border-l-destructive border-t-0 border-r-0 border-b-0",
  info: "border-l-4 border-l-info border-t-0 border-r-0 border-b-0",
  neutral: "border-border",
};

const iconVariantStyles = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  neutral: "bg-muted text-muted-foreground",
};

export function MetricCard({ label, value, icon: Icon, trend, trendDirection, variant = "default", href }: MetricCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`metric-card ${variantStyles[variant]} ${href ? "cursor-pointer hover:ring-2 hover:ring-primary/20" : ""}`}
      onClick={href ? () => navigate(href) : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trendDirection === "up" ? "text-success" : trendDirection === "down" ? "text-destructive" : "text-muted-foreground"}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconVariantStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
