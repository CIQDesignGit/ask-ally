import { useState } from "react";
import {
  MessageCirclePlus,
  PanelLeft,
  Settings,
  Zap,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { HistoryRail } from "@/components/chat/HistoryRail";
import { totalUnreadRuns } from "@/lib/automation-utils";
import { useAllyStore } from "@/store/ally-store";

const pageLinks = [
  { to: "/automations", label: "Automations", icon: Zap },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const navItemBase =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 type-body-strong transition-colors focus-visible:outline-2 focus-visible:outline-brand-500";

const navItemIdle = "text-fg-primary hover:bg-surface-muted";

const navItemActive = "bg-brand-50 text-brand-600";

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const newThread = useAllyStore((s) => s.newThread);
  const automations = useAllyStore((s) => s.automations);
  const unread = totalUnreadRuns(automations);
  const navigate = useNavigate();

  const handleNewChat = () => {
    newThread();
    navigate("/chat");
  };

  if (collapsed) {
    return (
      <aside className="flex w-14 shrink-0 flex-col items-center border-r border-sidebar-border bg-surface py-3">
        <button
          type="button"
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="rounded-md p-2 text-fg-tertiary transition-colors hover:bg-surface-muted hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-brand-500"
          onClick={() => setCollapsed(false)}
        >
          <PanelLeft className="size-4" aria-hidden="true" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-surface">
      <div className="flex flex-col gap-0.5 px-3 pt-1.5 pb-2">
        <button
          type="button"
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="mb-0.5 w-fit rounded-md p-2 text-fg-tertiary transition-colors hover:bg-surface-muted hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-brand-500"
          onClick={() => setCollapsed(true)}
        >
          <PanelLeft className="size-4" aria-hidden="true" />
        </button>

        <nav className="flex flex-col gap-0.5" aria-label="Primary">
          <button
            type="button"
            onClick={handleNewChat}
            className={`${navItemBase} ${navItemIdle}`}
          >
            <MessageCirclePlus className="size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-left">New Chat</span>
          </button>

          {pageLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `${navItemBase} ${isActive ? navItemActive : navItemIdle}`
              }
            >
              <l.icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 text-left">{l.label}</span>
              {l.to === "/automations" && unread > 0 ? (
                <span
                  className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white"
                  aria-label={`${unread} unread automation reports`}
                >
                  {unread}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mx-3 h-px bg-border-default" aria-hidden="true" />

      <HistoryRail />
    </aside>
  );
}
