import { Badge, cn } from "@ciq-dev/ciq-design-system";
import { ChevronRight } from "lucide-react";

import {
  formatSchedule,
  formatScopeLine,
  relativeTime,
  unreadRunCount,
} from "@/lib/automation-utils";
import type { Automation } from "@/types";

interface AutomationListProps {
  automations: Automation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AutomationList({
  automations,
  selectedId,
  onSelect,
}: AutomationListProps) {
  return (
    <ul className="divide-y divide-border-default" role="list">
      {automations.map((a) => {
        const unread = unreadRunCount(a);
        const lastRun = a.runHistory[0];
        const selected = selectedId === a.id;
        return (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => onSelect(a.id)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
                selected
                  ? "bg-brand-50"
                  : "hover:bg-surface-muted"
              )}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="line-clamp-1 text-sm font-medium text-fg-primary">
                    {a.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {unread > 0 ? (
                      <span
                        className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white"
                        aria-label={`${unread} unread`}
                      >
                        {unread}
                      </span>
                    ) : null}
                    {a.status === "active" ? (
                      <span className="inline-flex items-center rounded-lg border border-transparent bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                        Active
                      </span>
                    ) : (
                      <Badge variant="secondary">Paused</Badge>
                    )}
                  </div>
                </div>
                <div className="text-xs text-fg-secondary">
                  {formatSchedule(a.schedule)}
                  <span className="text-fg-tertiary"> · </span>
                  {formatScopeLine(a.scope)}
                </div>
                <div className="text-xs text-fg-tertiary">
                  {lastRun
                    ? `Last run ${relativeTime(lastRun.at)} · ${lastRun.summary}`
                    : "Never run"}
                </div>
              </div>
              <ChevronRight
                className="size-4 shrink-0 text-fg-tertiary"
                aria-hidden
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
