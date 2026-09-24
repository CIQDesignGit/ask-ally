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
import { Appear } from "./gap-motion";
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

const VALUE_TONE: Record<IssueStatusTone, string> = {
  danger: "text-red-600",
  warning: "text-amber-800",
  success: "text-feedback-success",
  neutral: "text-fg-primary",
};

const HEADER_TONE: Record<IssueStatusTone, string> = {
  danger: "bg-red-50",
  warning: "bg-amber-50",
  success: "bg-emerald-50",
  neutral: "bg-surface-muted",
};

const DOT_TONE: Record<IssueStatusTone, string> = {
  danger: "bg-red-500",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  neutral: "bg-slate-400",
};

const PILL_TONE: Record<IssueStatusTone, string> = {
  danger: "border-red-200 text-red-700",
  warning: "border-amber-200 text-amber-800",
  success: "border-emerald-200 text-emerald-700",
  neutral: "border-border-default text-fg-secondary",
};

function IssueCard({ item }: { item: GapIssueItem }) {
  const tone = item.statusTone ?? "neutral";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border-default bg-surface">
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-5 py-4",
          HEADER_TONE[tone],
        )}
      >
        {item.value ? (
          <div
            className={cn(
              "text-[20px] font-semibold leading-none tabular-nums tracking-tight",
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
              "shrink-0 rounded-full border bg-white px-2.5 py-1 text-[11px] font-medium",
              PILL_TONE[tone],
            )}
          >
            {item.statusLabel}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-5 py-4">
        {item.meta ? (
          <div className="flex items-center gap-1.5 text-[12px] text-fg-secondary">
            <span
              className={cn("size-1.5 shrink-0 rounded-full", DOT_TONE[tone])}
              aria-hidden
            />
            {item.meta}
          </div>
        ) : null}

        <h4
          className={cn(
            "text-[15px] font-semibold leading-snug text-fg-primary",
            item.meta ? "mt-1.5" : "mt-0",
          )}
        >
          {item.title}
        </h4>
        <p className="mt-1 text-[13px] leading-relaxed text-fg-secondary">
          {item.body}
        </p>
      </div>
    </article>
  );
}

export function IssueList({
  items,
  appearDelay = 0,
}: {
  items: GapIssueItem[];
  appearDelay?: number;
}) {
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3",
        items.length > 1 && "sm:grid-cols-2",
      )}
    >
      {items.map((entry, i) => (
        <Appear key={entry.title} delay={appearDelay + i * 0.1} y={10} duration={0.45}>
          <IssueCard item={entry} />
        </Appear>
      ))}
    </div>
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

export function RecommendationList({
  items,
  appearDelay = 0,
}: {
  items: ActionRecommendation[];
  appearDelay?: number;
}) {
  return (
    <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {items.map((entry, i) => (
        <Appear
          as="li"
          key={entry.title}
          delay={appearDelay + i * 0.1}
          y={10}
          duration={0.45}
          className="flex gap-3 rounded-[10px] bg-surface-muted px-[18px] py-3.5"
        >
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface text-[11px] font-semibold tabular-nums text-fg-secondary">
            {i + 1}
          </span>
          <div className="min-w-0">
            <h4 className="text-[13.5px] font-semibold text-fg-primary">
              {entry.title}
            </h4>
            <p className="mt-0.5 text-[13px] leading-relaxed text-fg-secondary">
              {entry.body}
            </p>
          </div>
        </Appear>
      ))}
    </ol>
  );
}
