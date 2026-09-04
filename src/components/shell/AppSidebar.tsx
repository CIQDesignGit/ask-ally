import { Button } from "@ciq-dev/ciq-design-system";
import { MessageSquare, Plus, Settings, Zap } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { HistoryRail } from "@/components/chat/HistoryRail";
import { useAllyStore } from "@/store/ally-store";

const links = [
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/automations", label: "Automations", icon: Zap },
  { to: "/settings", label: "Settings", icon: Settings },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-w-0 flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
    isActive
      ? "bg-brand-50 font-medium text-brand-800"
      : "text-fg-secondary hover:bg-surface-muted"
  }`;

export function AppSidebar() {
  const newThread = useAllyStore((s) => s.newThread);
  const navigate = useNavigate();

  const handleNewThread = () => {
    newThread();
    navigate("/chat");
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border-default bg-surface-sunken">
      <nav
        className="flex flex-col gap-0.5 border-b border-border-default p-2"
        aria-label="Primary"
      >
        {links.map((l) =>
          l.to === "/chat" ? (
            <div key={l.to} className="flex items-center gap-1">
              <NavLink to={l.to} className={navLinkClass}>
                <l.icon className="size-4" />
                {l.label}
              </NavLink>
              <Button
                size="sm"
                variant="ghost"
                aria-label="New chat"
                title="New chat"
                onClick={handleNewThread}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          ) : (
            <NavLink key={l.to} to={l.to} className={navLinkClass}>
              <l.icon className="size-4" />
              {l.label}
            </NavLink>
          )
        )}
      </nav>
      <HistoryRail />
    </aside>
  );
}
