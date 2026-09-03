import { Button } from "@ciq-dev/ciq-design-system";
import { LayoutDashboard } from "lucide-react";

interface DashboardPreviewCardProps {
  title?: string;
  widgets: { name: string; description: string }[];
  openLabel?: string;
  onOpen?: () => void;
}

/**
 * Inline preview of a dashboard Ally just created from an answer.
 */
export function DashboardPreviewCard({
  title = "Dashboard ready",
  widgets,
  openLabel = "Open dashboard",
  onOpen,
}: DashboardPreviewCardProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border-default bg-surface p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <LayoutDashboard className="mt-0.5 size-4 shrink-0 text-brand-600" />
          <div>
            <div className="text-sm font-semibold text-fg-primary">{title}</div>
            <p className="mt-0.5 text-xs text-fg-tertiary">
              Refreshes with your data every morning · inherits this chat scope
            </p>
          </div>
        </div>
        {onOpen ? (
          <Button size="sm" onClick={onOpen}>
            {openLabel}
          </Button>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-lg border border-border-default">
        <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-border-default bg-surface-muted px-3 py-2 text-xs font-medium text-fg-tertiary">
          <span>Widget</span>
          <span>What it shows</span>
        </div>
        {widgets.map((w) => (
          <div
            key={w.name}
            className="grid grid-cols-[140px_1fr] gap-2 border-b border-border-default px-3 py-2 text-sm last:border-b-0"
          >
            <span className="font-medium text-fg-primary">{w.name}</span>
            <span className="text-fg-secondary">{w.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
