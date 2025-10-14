import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "@/pages/dashboard";
import ChatbotSetup from "@/pages/chatbot-setup";
import Documents from "@/pages/documents";
import Conversations from "@/pages/conversations";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Widget from "@/pages/widget";
import ChatTest from "@/pages/chat-test";
import Models from "@/pages/models";
import ChatStandalone from "@/pages/chat-standalone";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";

function AdminRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/chatbot" component={ChatbotSetup} />
      <Route path="/documents" component={Documents} />
      <Route path="/models" component={Models} />
      <Route path="/widget" component={Widget} />
      <Route path="/chat-test" component={ChatTest} />
      <Route path="/conversations" component={Conversations} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  
  // Standalone routes without sidebar/header
  if (location === "/auth") {
    return <AuthPage />;
  }

  // Match /chat or /chat/:slug but not /chatbot or /chat-test
  if (location === "/chat" || location.startsWith("/chat/")) {
    return <ChatStandalone />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ProtectedRoute>
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
                <AdminRouter />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
