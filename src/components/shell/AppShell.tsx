import { Avatar, AvatarFallback, Button, GlobalToaster } from "@ciq-dev/ciq-design-system";
import {
  BarChart2,
  HelpCircle,
  Mail,
  Bell,
  Rocket,
  Share2,
} from "lucide-react";
import { Outlet } from "react-router-dom";

import { agentConfig } from "@/config/agent";
import { useAllyStore } from "@/store/ally-store";

import { AppSidebar } from "./AppSidebar";

export function AppShell() {
  const activeThreadId = useAllyStore((s) => s.activeThreadId);
  const openDashboard = useAllyStore((s) => s.openDashboard);

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-default bg-surface px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-semibold text-white">
            {agentConfig.avatarFallback}
          </span>
          <span className="text-sm font-semibold text-fg-primary">
            Ask Ally
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Open dashboard"
            title="Open dashboard"
            disabled={!activeThreadId}
            onClick={() => activeThreadId && openDashboard(activeThreadId)}
          >
            <BarChart2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Quick actions"
            title="Coming soon"
            disabled
          >
            <Rocket className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Notifications"
            title="Coming soon"
            disabled
          >
            <Bell className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Help"
            title="Coming soon"
            disabled
          >
            <HelpCircle className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Share"
            title="Coming soon"
            disabled
          >
            <Share2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Mail"
            title="Coming soon"
            disabled
          >
            <Mail className="size-4" />
          </Button>
          <Avatar className="ml-1 size-7">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <AppSidebar />
        <main className="min-h-0 flex-1">
          <Outlet />
        </main>
      </div>
      <GlobalToaster />
    </div>
  );
}
