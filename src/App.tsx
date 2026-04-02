import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardPage from "./pages/DashboardPage";
import MailFlowPage from "./pages/MailFlowPage";
import LicensesPage from "./pages/LicensesPage";
import StaleAccountsPage from "./pages/StaleAccountsPage";
import AccessGroupsPage from "./pages/AccessGroupsPage";
import MailboxAccessPage from "./pages/MailboxAccessPage";
import OnboardingPage from "./pages/OnboardingPage";
import OffboardingPage from "./pages/OffboardingPage";
import SecurityPosturePage from "./pages/SecurityPosturePage";
import PermissionsAuditPage from "./pages/PermissionsAuditPage";
import JobsPage from "./pages/JobsPage";
import AuditLogPage from "./pages/AuditLogPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-12 flex items-center border-b border-border bg-card px-2 shrink-0">
                <SidebarTrigger className="ml-1" />
                <span className="ml-3 text-sm font-medium text-muted-foreground">IT Control Plane</span>
              </header>
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/licenses" element={<LicensesPage />} />
                  <Route path="/stale-accounts" element={<StaleAccountsPage />} />
                  <Route path="/access-groups" element={<AccessGroupsPage />} />
                  <Route path="/mailbox-access" element={<MailboxAccessPage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/offboarding" element={<OffboardingPage />} />
                  <Route path="/security-posture" element={<SecurityPosturePage />} />
                  <Route path="/permissions-audit" element={<PermissionsAuditPage />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/audit-log" element={<AuditLogPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
