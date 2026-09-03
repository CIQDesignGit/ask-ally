import type { CellTone, CompareStripRow } from "@/types";

import { SectionCard } from "./SectionCard";

function toneClass(tone?: CellTone): string {
  switch (tone) {
    case "positive":
      return "text-feedback-success";
    case "negative":
      return "text-feedback-danger";
    case "warning":
      return "text-amber-700";
    default:
      return "text-fg-primary";
  }
}

interface CompareStripProps {
  title?: string;
  priorLabel?: string;
  currentLabel?: string;
  rows: CompareStripRow[];
}

export function CompareStrip({
  title,
  priorLabel = "Prior",
  currentLabel = "Current",
  rows,
}: CompareStripProps) {
  return (
    <SectionCard title={title}>
      <div className="overflow-hidden rounded-lg border border-border-default">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_0.9fr] gap-2 bg-surface-muted px-3 py-2 text-xs font-medium text-fg-tertiary">
          <span>Metric</span>
          <span className="text-right">{priorLabel}</span>
          <span className="text-right">{currentLabel}</span>
          <span className="text-right">Change</span>
        </div>
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[1.5fr_1fr_1fr_0.9fr] gap-2 border-t border-border-default px-3 py-2.5 text-sm"
          >
            <span className="text-fg-secondary">{row.label}</span>
            <span className="text-right tabular-nums text-fg-primary">
              {row.prior}
            </span>
            <span className="text-right tabular-nums text-fg-primary">
              {row.current}
            </span>
            <span
              className={`text-right tabular-nums font-semibold ${toneClass(row.tone)}`}
            >
              {row.delta}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
