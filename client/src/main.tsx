import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, Link } from "wouter";
import "./index.css";
import { SWRConfig } from "swr";
import { fetcher } from "./lib/fetcher";
import { Toaster } from "@/components/ui/toaster";
import { ChatPage } from "./pages/ChatPage";
import { ToolsPage } from "./pages/ToolsPage";
import { ConfigPage } from "./pages/ConfigPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { wsClient } from "./lib/websocket";
import { ConnectionStatus } from "@/components/ui/connection-status";

// Initialize WebSocket connection with retry limit
wsClient.connect({
  maxRetries: 3,
  retryInterval: 2000
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SWRConfig value={{ fetcher }}>
      <div className="min-h-screen bg-background">
        <nav className="border-b px-4">
          <div className="flex h-14 items-center space-x-4">
            <Link href="/" className="text-sm font-medium">
              Chat
            </Link>
            <Link href="/tools" className="text-sm font-medium">
              Tools
            </Link>
            <Link href="/config" className="text-sm font-medium">
              Config
            </Link>
            <Link href="/analytics" className="text-sm font-medium">
              Analytics
            </Link>
          </div>
        </nav>
        
        <Switch>
          <Route path="/" component={ChatPage} />
          <Route path="/tools" component={ToolsPage} />
          <Route path="/config" component={ConfigPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route>404 Page Not Found</Route>
        </Switch>
      </div>
      <ConnectionStatus />
      <Toaster />
    </SWRConfig>
  </StrictMode>
);
