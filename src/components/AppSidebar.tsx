import {
  LayoutDashboard,
  KeyRound,
  UserX,
  Users,
  Mail,
  UserPlus,
  UserMinus,
  Shield,
  ScanSearch,
  Activity,
  ScrollText,
  Settings,
  Server,
  BarChart3,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Licenses", url: "/licenses", icon: KeyRound },
  { title: "Stale Accounts", url: "/stale-accounts", icon: UserX },
  { title: "Access & Groups", url: "/access-groups", icon: Users },
  { title: "Mailbox Access", url: "/mailbox-access", icon: Mail },
  { title: "Mail Flow", url: "/mail-flow", icon: BarChart3 },
];

const workflowNav = [
  { title: "Onboarding", url: "/onboarding", icon: UserPlus },
  { title: "Offboarding", url: "/offboarding", icon: UserMinus },
];

const governanceNav = [
  { title: "Security Posture", url: "/security-posture", icon: Shield },
  { title: "Permissions Audit", url: "/permissions-audit", icon: ScanSearch },
];

const systemNav = [
  { title: "Jobs & Sync", url: "/jobs", icon: Activity },
  { title: "Audit Log", url: "/audit-log", icon: ScrollText },
  { title: "Settings", url: "/settings", icon: Settings },
];

function NavGroup({ label, items }: { label: string; items: typeof mainNav }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-widest">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <Server className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-semibold text-sidebar-accent-foreground">IT Control Plane</h2>
              <p className="text-[10px] text-sidebar-foreground/50">Contoso Ltd</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <NavGroup label="Operations" items={mainNav} />
        <NavGroup label="Workflows" items={workflowNav} />
        <NavGroup label="Governance" items={governanceNav} />
        <NavGroup label="System" items={systemNav} />
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-medium text-sidebar-primary">
              AD
            </div>
            <div>
              <p className="text-xs font-medium text-sidebar-accent-foreground">Admin User</p>
              <p className="text-[10px] text-sidebar-foreground/50">admin@contoso.com</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
