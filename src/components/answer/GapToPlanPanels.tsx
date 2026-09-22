import { cn } from "@ciq-dev/ciq-design-system";
import { ArrowRight } from "lucide-react";

import type {
  ActionRecommendation,
  GapDriverContribution,
  GapDriverMetric,
  GapIssueItem,
  GapPeriodRow,
  IssueStatusTone,
  TrendSeriesPoint,
} from "@/types";

import { DivergingBar, MagnitudeBar } from "./GapToPlanBars";
import { toneTextClass } from "./gap-tone";
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
  const scale = Math.max(
    ...rows.map((r) => Math.max(r.planValue ?? 0, r.actualValue ?? 0)),
    1,
  );

  return (
    <div className="space-y-4">
      {/* Periods sit side by side so the gap trajectory is one left-to-right read. */}
      <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
        {rows.map((row) => {
          const planShare = ((row.planValue ?? 0) / scale) * 100;
          const actualShare = ((row.actualValue ?? 0) / scale) * 100;

          return (
            <div key={row.label} className="space-y-1.5">
              <dt className="text-[13px] font-medium leading-tight text-fg-primary">
                {row.label}
                {row.caption ? (
                  <span className="font-normal text-fg-tertiary">
                    {" "}
                    ({row.caption})
                  </span>
                ) : null}
              </dt>

              <dd className="space-y-1.5">
                <div
                  className={cn(
                    "text-[15px] font-semibold tabular-nums",
                    row.pending ? "text-fg-tertiary" : "text-feedback-danger",
                  )}
                >
                  {row.gap}
                </div>

                {row.pending ? (
                  <div className="h-2 w-full rounded-full border border-dashed border-border-default" />
                ) : (
                  <div className="relative h-2 w-full">
                    <div
                      className="absolute inset-y-0 rounded-full bg-slate-200"
                      style={{ width: `${planShare}%` }}
                    />
                    <div
                      className="absolute inset-y-0 rounded-full bg-slate-600"
                      style={{ width: `${actualShare}%` }}
                    />
                  </div>
                )}

                <div className="text-[12px] leading-snug tabular-nums text-fg-secondary">
                  {row.pending ? (
                    "Week in progress"
                  ) : (
                    <>
                      <span className="font-medium text-fg-primary">{row.actual}</span>
                      <span> of {row.plan}</span>
                      {row.attainment ? (
                        <span> ({row.attainment})</span>
                      ) : null}
                    </>
                  )}
                </div>
              </dd>
            </div>
          );
        })}
      </dl>

      {footer ? <PanelNote>{footer}</PanelNote> : null}
    </div>
  );
}

/* -------------------------------------------------------------------- Drivers */

export function DriverPanel({
  contributions,
  metrics,
  footer,
}: {
  contributions: GapDriverContribution[];
  metrics: GapDriverMetric[];
  footer?: string;
}) {
  const max = Math.max(...contributions.map((c) => Math.abs(c.impact)), 1);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <dl className="space-y-2.5">
          {contributions.map((c) => (
            <div
              key={c.label}
              className="grid grid-cols-[104px_1fr_92px] items-center gap-3"
            >
              <dt className="truncate text-[13px] text-fg-primary">{c.label}</dt>
              <DivergingBar value={c.impact} max={max} />
              <dd className="text-right text-[13px] font-semibold tabular-nums">
                <span
                  className={
                    c.impact >= 0 ? "text-feedback-success" : "text-feedback-danger"
                  }
                >
                  {c.value}
                </span>
                {c.note ? (
                  <span className="block text-[11px] font-normal text-fg-tertiary">
                    {c.note}
                  </span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="space-y-2">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-fg-tertiary">
          Underlying metrics
        </h4>
        <dl className="divide-y divide-border-default">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="grid grid-cols-[minmax(0,1fr)_5.75rem_0.75rem_5.75rem_4.75rem] items-center gap-x-2 py-2"
            >
              <dt className="truncate text-[13px] text-fg-primary">{m.label}</dt>
              <dd className="text-right text-[13px] tabular-nums text-fg-tertiary">
                {m.prior}
              </dd>
              <dd className="flex justify-center text-fg-disabled" aria-hidden>
                <ArrowRight className="size-3" />
              </dd>
              <dd className="text-right text-[13px] font-medium tabular-nums text-fg-primary">
                {m.current}
              </dd>
              <dd
                className={cn(
                  "text-right text-[13px] font-semibold tabular-nums",
                  toneTextClass(m.tone),
                )}
              >
                {m.delta}
              </dd>
            </div>
          ))}
        </dl>
      </div>

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

const STATUS_DOT: Record<IssueStatusTone, string> = {
  danger: "bg-feedback-danger",
  warning: "bg-amber-500",
  success: "bg-feedback-success",
  neutral: "bg-fg-disabled",
};

export function IssueList({ items }: { items: GapIssueItem[] }) {
  const max = Math.max(...items.map((i) => i.magnitude ?? 0), 1);

  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const tone = item.statusTone ?? "neutral";

        return (
          <li key={item.title} className="space-y-2">
            <div className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-[7px] size-1.5 shrink-0 rounded-full",
                  STATUS_DOT[tone],
                )}
                aria-hidden
              />
              <h4 className="min-w-0 flex-1 text-[13.5px] font-medium leading-snug text-fg-primary">
                {item.title}
              </h4>
              {item.statusLabel ? (
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                    STATUS_PILL[tone],
                  )}
                >
                  {item.statusLabel}
                </span>
              ) : null}
            </div>

            {item.magnitude ? (
              <div className="flex w-full items-center gap-3 pl-4">
                <MagnitudeBar
                  share={item.magnitude / max}
                  tone={tone === "neutral" ? "neutral" : "negative"}
                  className="min-w-0 flex-1"
                />
                <span className="shrink-0 text-xs tabular-nums text-fg-secondary">
                  <span className="font-semibold text-fg-primary">{item.value}</span>
                  {item.meta ? (
                    <span className="text-fg-tertiary"> · {item.meta}</span>
                  ) : null}
                </span>
              </div>
            ) : null}

            <p className="pl-4 text-[13px] leading-relaxed text-fg-secondary">
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
