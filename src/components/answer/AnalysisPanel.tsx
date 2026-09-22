import { Accordion } from "@ciq-dev/ciq-design-system";

import type { AnalysisPanelData, ScorecardTile } from "@/types";

import { AnswerTable } from "./AnswerTable";

interface AnalysisPanelProps {
  panel: AnalysisPanelData;
}

function MetricStrip({ tiles }: { tiles: ScorecardTile[] }) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${Math.min(tiles.length, 4)}, minmax(0, 1fr))`,
      }}
    >
      {tiles.map((tile) => (
        <div key={tile.label} className="min-w-0">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-fg-tertiary">
            {tile.label}
          </div>
          <div
            className={`text-[20px] font-semibold tabular-nums tracking-tight ${
              tile.variant === "danger"
                ? "text-feedback-danger"
                : tile.variant === "success"
                  ? "text-feedback-success"
                  : "text-fg-primary"
            }`}
          >
            {tile.value}
          </div>
          {tile.delta ? (
            <div className="mt-0.5 text-[12px] text-fg-tertiary">{tile.delta}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Inner body of an analysis panel — metrics + table + footer (no accordion chrome). */
export function AnalysisPanelBody({ panel }: AnalysisPanelProps) {
  return (
    <div className="space-y-4">
      {panel.tiles.length > 0 ? <MetricStrip tiles={panel.tiles} /> : null}
      <AnswerTable table={panel.table} framed={false} />
      {panel.footer ? (
        <p className="text-[13px] leading-relaxed text-fg-secondary">
          {panel.footer}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Standalone collapsible analysis block (metrics + table + footer).
 * Prefer GapToPlanReport’s nested accordion when used inside the report template.
 */
export function AnalysisPanel({ panel }: AnalysisPanelProps) {
  return (
    <Accordion
      title={panel.title}
      defaultExpanded={panel.defaultExpanded ?? true}
      chevronPosition="right"
      className="overflow-hidden rounded-xl border border-border-default border-l-[3px] border-l-brand-600 bg-surface"
      triggerClassName="px-4 py-3 text-sm font-semibold text-fg-primary"
      contentClassName="border-t border-border-default px-4 pb-4 pt-3"
    >
      <AnalysisPanelBody panel={panel} />
    </Accordion>
  );
}
