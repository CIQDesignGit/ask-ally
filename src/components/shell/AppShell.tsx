import { NavLink, Outlet } from "react-router-dom";
import { GlobalToaster } from "@ciq-dev/ciq-design-system";

import { agentConfig } from "@/config/agent";

const links = [
  { to: "/chat", label: "Chat" },
  { to: "/automations", label: "Automations" },
  { to: "/settings", label: "Settings" },
];

export function AppShell() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas">
      <header className="flex h-12 shrink-0 items-center gap-6 border-b border-border-default bg-surface px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-semibold text-white">
            {agentConfig.avatarFallback}
          </span>
          <span className="text-sm font-semibold text-fg-primary">
            {agentConfig.name}
          </span>
        </div>
        <nav className="flex items-center gap-1" aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
                  isActive
                    ? "bg-brand-50 font-medium text-brand-800"
                    : "text-fg-secondary hover:bg-surface-muted"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
      <GlobalToaster />
    </div>
  );
}
