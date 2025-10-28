// client/src/App.tsx

import { Switch, Route } from "wouter";
// NO QueryClientProvider or queryClient import here
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import Dashboard from "@/pages/dashboard";
import Jobs from "@/pages/jobs";
import JobDetail from "@/pages/job-detail";
import Candidates from "@/pages/candidates";
import CandidateProfile from "@/pages/candidate-profile";
import Assessments from "@/pages/assessments";
import AssessmentBuilder from "@/pages/assessment-builder";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/jobs/:id" component={JobDetail} />
      <Route path="/candidates" component={Candidates} />
      <Route path="/candidates/:id" component={CandidateProfile} />
      <Route path="/assessments" component={Assessments} />
      <Route path="/assessments/:jobId/edit" component={AssessmentBuilder} />
      <Route path="/assessments/:jobId/preview" component={AssessmentBuilder} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    // NO QueryClientProvider here
    <TooltipProvider>
      <ThemeProvider>
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between p-4 border-b bg-card">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
              </header>
              <main className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-6">
                  <Router />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </ThemeProvider>
    </TooltipProvider>
    // NO QueryClientProvider here
  );
}

export default App;