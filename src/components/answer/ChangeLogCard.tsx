import { Badge } from "@ciq-dev/ciq-design-system";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";

interface ChangeLogCardProps {
  campaign: string;
  metricLabel: string;
  fromValue: string;
  toValue: string;
  meta: string[];
}

type Direction = "up" | "down" | "flat";

function parseNumeric(value: string): number | null {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
}

const valueToneClass: Record<Direction, string> = {
  down: "text-feedback-danger",
  up: "text-feedback-success",
  flat: "text-fg-primary",
};

/** Campaign change block from RCA mock (budget cut log). */
export function ChangeLogCard({
  campaign,
  metricLabel,
  fromValue,
  toValue,
  meta,
}: ChangeLogCardProps) {
  const from = parseNumeric(fromValue);
  const to = parseNumeric(toValue);
  const pctChange =
    from !== null && to !== null && from !== 0
      ? Math.round(((to - from) / from) * 100)
      : null;
  const direction: Direction =
    pctChange === null || pctChange === 0
      ? "flat"
      : pctChange < 0
        ? "down"
        : "up";

  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-border-default bg-surface px-4 py-4 sm:px-5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-brand-50 text-brand-600">
          <Clock className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 truncate font-mono text-[13px] font-semibold text-fg-primary">
          {campaign}
        </span>
        <Badge variant="outline" className="ml-auto shrink-0">
          {metricLabel}
        </Badge>
      </div>
      <div className="flex items-center gap-3 pl-9">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-fg-tertiary">
            Previous
          </div>
          <div className="text-lg font-semibold text-fg-tertiary line-through">
            {fromValue}
          </div>
        </div>
        <span className="text-lg text-fg-tertiary" aria-hidden="true">
          →
        </span>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-fg-tertiary">
            Current
          </div>
          <div className={`text-lg font-bold ${valueToneClass[direction]}`}>
            {toValue}
          </div>
        </div>
        {pctChange !== null && direction !== "flat" ? (
          <div
            className={`ml-1 flex items-center gap-1 text-sm font-medium ${valueToneClass[direction]}`}
          >
            {direction === "down" ? (
              <TrendingDown className="size-3.5" aria-hidden />
            ) : (
              <TrendingUp className="size-3.5" aria-hidden />
            )}
            {pctChange > 0 ? "+" : ""}
            {pctChange}%
          </div>
        ) : null}
      </div>
      <div className="ml-9 flex flex-col gap-1.5 border-t border-border-default pt-3">
        {meta.map((line) => (
          <div
            key={line}
            className="flex flex-wrap items-center gap-1 text-[12.5px] leading-snug text-fg-tertiary"
          >
            {line.split(" · ").map((segment, i) => (
              <span key={segment} className="flex items-center gap-1">
                {i > 0 ? (
                  <span aria-hidden className="text-fg-tertiary/50">
                    ·
                  </span>
                ) : null}
                {segment}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
