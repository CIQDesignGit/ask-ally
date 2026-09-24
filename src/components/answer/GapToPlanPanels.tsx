import { cn } from "@ciq-dev/ciq-design-system";

import type {
  ActionRecommendation,
  GapDriverContribution,
  GapDriverMetric,
  GapIssueItem,
  GapPeriodRow,
  IssueStatusTone,
  TrendSeriesPoint,
} from "@/types";

import { DriverFlow } from "./DriverFlow";
import { AttainmentBar } from "./GapToPlanBars";
import { TrendChart } from "./TrendChart";

/** Footnote under a panel — narrative stays, but as a closing note, not the payload. */
function PanelNote({ children }: { children: string }) {
  return (
    <p className="border-t border-border-default pt-3 text-[13px] leading-relaxed text-fg-secondary">
      {children}
    </p>
  );
}

/* ---------------------------------------------------------------- Plan vs Actual */

export function PlanVsActualPanel({
  rows,
  footer,
}: {
  rows: GapPeriodRow[];
  footer?: string;
}) {
  const featuredIndex = rows.findLastIndex((row) => !row.pending);
  const featured = featuredIndex >= 0 ? rows[featuredIndex] : undefined;
  const rest = rows.filter((_, i) => i !== featuredIndex);

  return (
    <div className="space-y-5">
      {featured ? <AttainmentBar {...featured} featured /> : null}

      {rest.length > 0 ? (
        <div
          className={cn(
            "grid gap-x-6 gap-y-5",
            rest.length >= 2 ? "sm:grid-cols-2" : "grid-cols-1",
          )}
        >
          {rest.map((row) => (
            <AttainmentBar key={row.label} {...row} />
          ))}
        </div>
      ) : null}

      {footer ? <PanelNote>{footer}</PanelNote> : null}
    </div>
  );
}

/* -------------------------------------------------------------------- Drivers */

function metricForContribution(
  contribution: GapDriverContribution,
  metrics: GapDriverMetric[],
  used: Set<string>,
): GapDriverMetric | undefined {
  const hay = `${contribution.label} ${contribution.note ?? ""}`.toLowerCase();
  const rules: { keys: RegExp; metric: RegExp }[] = [
    { keys: /price|asp|selling/, metric: /selling price|asp|^price/ },
    { keys: /traffic|view|pdp/, metric: /pdp|view|traffic/ },
    { keys: /conversion|cvr/, metric: /conversion/ },
  ];
  for (const rule of rules) {
    if (!rule.keys.test(hay)) continue;
    const found = metrics.find(
      (m) => !used.has(m.label) && rule.metric.test(m.label.toLowerCase()),
    );
    if (found) return found;
  }
  return undefined;
}

export interface DriverPeriod {
  label: string;
  caption?: string;
  actual?: string;
  gap?: string;
}

function toDriverPeriod(row: GapPeriodRow): DriverPeriod {
  return {
    label: row.label,
    caption: row.caption,
    actual: row.actual,
    gap: row.gap,
  };
}

/** Last completed week vs the one before — same pair the plan bars use. */
export function driverComparePeriods(rows: GapPeriodRow[]): {
  from?: DriverPeriod;
  to?: DriverPeriod;
} {
  const completed = rows.filter((r) => !r.pending);
  if (completed.length === 0) return {};
  const to = completed[completed.length - 1];
  const from =
    completed.length > 1 ? completed[completed.length - 2] : undefined;
  return {
    to: toDriverPeriod(to),
    from: from ? toDriverPeriod(from) : undefined,
  };
}

export function DriverPanel({
  contributions,
  metrics,
  footer,
  compareFrom,
  compareTo,
}: {
  contributions: GapDriverContribution[];
  metrics: GapDriverMetric[];
  footer?: string;
  compareFrom?: DriverPeriod;
  compareTo?: DriverPeriod;
}) {
  const used = new Set<string>();
  const paired = contributions.map((contribution) => {
    const metric = metricForContribution(contribution, metrics, used);
    if (metric) used.add(metric.label);
    return { contribution, metric };
  });
  const leftover = metrics.filter((m) => !used.has(m.label));

  const cards = [
    ...paired.map(({ contribution: c, metric }) => ({
      id: c.label,
      label: c.label,
      delta: metric?.delta ?? c.note ?? c.value,
      current: metric?.current,
      periodLabel: compareTo?.label,
      positive: metric ? metric.tone !== "negative" : c.impact >= 0,
    })),
    ...leftover.map((metric) => ({
      id: metric.label,
      label: metric.label,
      delta: metric.delta,
      current: metric.current,
      periodLabel: compareTo?.label,
      positive: metric.tone !== "negative",
    })),
  ];

  return (
    <div className="space-y-8">
      <DriverFlow
        compareFrom={compareFrom}
        compareTo={compareTo}
        cards={cards}
      />
      {footer ? <PanelNote>{footer}</PanelNote> : null}
    </div>
  );
}

/* --------------------------------------------------------------------- Issues */

const STATUS_PILL: Record<IssueStatusTone, string> = {
  danger: "bg-red-50 text-red-700",
  warning: "bg-amber-50 text-amber-800",
  success: "bg-emerald-50 text-emerald-700",
  neutral: "bg-surface-muted text-fg-secondary",
};

const VALUE_TONE: Record<IssueStatusTone, string> = {
  danger: "text-feedback-danger",
  warning: "text-amber-700",
  success: "text-feedback-success",
  neutral: "text-fg-primary",
};

export function IssueList({ items }: { items: GapIssueItem[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const tone = item.statusTone ?? "neutral";

        return (
          <li
            key={item.title}
            className="flex flex-col gap-2 rounded-xl border border-border-default bg-surface px-3.5 py-3.5"
          >
            <div className="flex items-start justify-between gap-2">
              {item.value ? (
                <div
                  className={cn(
                    "text-[20px] font-semibold tabular-nums tracking-tight",
                    VALUE_TONE[tone],
                  )}
                >
                  {item.value}
                </div>
              ) : (
                <span />
              )}
              {item.statusLabel ? (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    STATUS_PILL[tone],
                  )}
                >
                  {item.statusLabel}
                </span>
              ) : null}
            </div>

            {item.meta ? (
              <div className="text-[11px] text-fg-tertiary">{item.meta}</div>
            ) : null}

            <h4 className="text-[13px] font-semibold leading-snug text-fg-primary">
              {item.title}
            </h4>
            <p className="text-[12.5px] leading-relaxed text-fg-secondary">
              {item.body}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------------------------------------------------------------- Trend */

export function TrendPanel({
  points,
  actualLabel,
  planLabel,
}: {
  points: TrendSeriesPoint[];
  actualLabel?: string;
  planLabel?: string;
}) {
  return (
    <TrendChart
      points={points}
      actualLabel={actualLabel}
      planLabel={planLabel}
      framed={false}
      showGapArea
    />
  );
}

/* ------------------------------------------------------------- Recommendations */

export function RecommendationList({ items }: { items: ActionRecommendation[] }) {
  return (
    <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {items.map((item, i) => (
        <li
          key={item.title}
          className="flex gap-3 rounded-[10px] bg-surface-muted px-[18px] py-3.5"
        >
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface text-[11px] font-semibold tabular-nums text-fg-secondary">
            {i + 1}
          </span>
          <div className="min-w-0">
            <h4 className="text-[13.5px] font-semibold text-fg-primary">
              {item.title}
            </h4>
            <p className="mt-0.5 text-[13px] leading-relaxed text-fg-secondary">
              {item.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
