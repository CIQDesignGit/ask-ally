import { Badge } from "@ciq-dev/ciq-design-system";

import type { ActionLogRow } from "@/types";

const statusVariant: Record<
  ActionLogRow["status"],
  "default" | "defaultLight" | "secondary" | "destructive" | "outline"
> = {
  done: "defaultLight",
  mixed: "secondary",
  waiting: "outline",
  failed: "destructive",
};

const statusLabel: Record<ActionLogRow["status"], string> = {
  done: "Done",
  mixed: "Mixed",
  waiting: "Waiting",
  failed: "Failed",
};

interface ActionLogProps {
  title?: string;
  rows: ActionLogRow[];
}

export function ActionLog({ title, rows }: ActionLogProps) {
  return (
    <div className="space-y-2">
      {title ? (
        <h3 className="text-sm font-semibold text-fg-primary">{title}</h3>
      ) : null}
      <div className="overflow-hidden rounded-xl border border-border-default">
        <div className="grid grid-cols-[1.6fr_0.8fr_0.7fr_1.4fr_auto] gap-2 border-b border-border-default bg-surface-muted px-3 py-2 text-xs font-medium text-fg-tertiary">
          <span>Action</span>
          <span>Owner</span>
          <span>Date</span>
          <span>Result</span>
          <span>Status</span>
        </div>
        {rows.map((r) => (
          <div
            key={`${r.action}-${r.date}`}
            className="grid grid-cols-[1.6fr_0.8fr_0.7fr_1.4fr_auto] items-center gap-2 border-b border-border-default px-3 py-2.5 text-sm last:border-b-0"
          >
            <span className="font-medium text-fg-primary">{r.action}</span>
            <span className="text-fg-secondary">{r.owner}</span>
            <span className="text-fg-tertiary">{r.date}</span>
            <span className="text-fg-secondary">{r.result}</span>
            <Badge variant={statusVariant[r.status]}>
              {statusLabel[r.status]}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
