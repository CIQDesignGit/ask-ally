import { Button } from "@ciq-dev/ciq-design-system";
import { Download, LayoutDashboard, Presentation, Zap } from "lucide-react";

import { downloadCsv } from "@/lib/csv-export";
import { useAllyStore } from "@/store/ally-store";

interface ReportActionsBarProps {
  threadId: string;
  table?: { columns: string[]; rows: (string | number)[][] };
  hasVisual?: boolean;
  onBuildDeck?: () => void;
  onAutomate?: () => void;
}

export function ReportActionsBar({
  threadId,
  table,
  hasVisual,
  onBuildDeck,
  onAutomate,
}: ReportActionsBarProps) {
  const openDashboard = useAllyStore((s) => s.openDashboard);

  if (!table && !hasVisual) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border-default pt-3">
      <span className="mr-1 text-xs font-medium text-fg-tertiary">
        Escalate
      </span>
      <Button
        size="sm"
        variant="outline"
        className="gap-1"
        onClick={() => openDashboard(threadId)}
      >
        <LayoutDashboard className="size-3.5" aria-hidden />
        Dashboard
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1"
        onClick={onBuildDeck}
      >
        <Presentation className="size-3.5" aria-hidden />
        Slide
      </Button>
      {table && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() =>
            downloadCsv("ally-export.csv", table.columns, table.rows)
          }
        >
          <Download className="size-3.5" aria-hidden />
          Export CSV
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="gap-1 text-brand-700"
        onClick={onAutomate}
      >
        <Zap className="size-3.5" aria-hidden />
        Automate
      </Button>
    </div>
  );
}
