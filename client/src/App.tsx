import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Dashboard from "@/pages/dashboard";
import ChatbotSetup from "@/pages/chatbot-setup";
import Documents from "@/pages/documents";
import Conversations from "@/pages/conversations";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Widget from "@/pages/widget";
import ChatTest from "@/pages/chat-test";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/chatbot" component={ChatbotSetup} />
      <Route path="/documents" component={Documents} />
      <Route path="/widget" component={Widget} />
      <Route path="/chat-test" component={ChatTest} />
      <Route path="/conversations" component={Conversations} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties} defaultOpen={true}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-medium text-primary">Live</span>
                  </div>
                </div>
              </header>
              <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                  <Router />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
