import { cn } from "@ciq-dev/ciq-design-system";
import {
  ChevronDown,
  DollarSign,
  Eye,
  Percent,
  Plus,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import type {
  GapBrandCard,
  GapDriverCard,
  GapDriverInsight,
  GapPeriodRow,
  GapToPlanReportData,
  GapTone,
  TrendSeriesPoint,
} from "@/types";

import { EmphasisText } from "./EmphasisText";
import { Appear, sectionDelay } from "./gap-motion";

interface GapToPlanReportProps {
  report: GapToPlanReportData;
  keyFinding: string[];
  streaming?: boolean;
  streamingText?: string;
  onSkipStream?: () => void;
  showAnalysis?: boolean;
}

/** Section inside the single report card — no nested card chrome. */
function CollapsibleSection({
  title,
  subtitle,
  meta,
  defaultOpen = true,
  children,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-muted/30"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 className="text-base font-semibold tracking-tight text-fg-primary">
              {title}
            </h3>
            {subtitle ? (
              <span className="text-sm text-fg-tertiary">{subtitle}</span>
            ) : null}
            {meta ? (
              <span className="text-sm text-fg-tertiary">{meta}</span>
            ) : null}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "mt-0.5 size-4 shrink-0 text-fg-tertiary transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? <div className="px-5 pb-5">{children}</div> : null}
    </section>
  );
}

function SectionDivider() {
  return <div className="border-t border-border-default" role="separator" />;
}

/* ---------------------------------------------------------------- Trend */

function formatAxisM(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

function RevenueTrendChart({
  points,
  comparedFromIndex = Math.max(0, points.length - 2),
  endLabels,
}: {
  points: TrendSeriesPoint[];
  comparedFromIndex?: number;
  endLabels?: { plan: string; actual: string };
}) {
  const layout = useMemo(() => {
    const width = 680;
    const height = 280;
    const padL = 48;
    const padR = 72;
    const padT = 28;
    const padB = 36;
    const values = points.flatMap((p) => [p.actual, p.plan]);
    const lo = Math.min(...values);
    const hi = Math.max(...values, 1);
    const span = Math.max(hi - lo, 1);
    const minY = Math.max(0, lo - span * 0.2);
    const maxY = hi + span * 0.12;
    const spanX = Math.max(points.length - 1, 1);
    const x = (i: number) => padL + (i / spanX) * (width - padL - padR);
    const y = (v: number) =>
      padT + (1 - (v - minY) / (maxY - minY || 1)) * (height - padT - padB);

    const actualPath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.actual)}`)
      .join(" ");
    const planPath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.plan)}`)
      .join(" ");

    const ticks = 5;
    const yTicks = Array.from({ length: ticks }, (_, i) => {
      const v = minY + ((maxY - minY) / (ticks - 1)) * i;
      return { v, y: y(v) };
    });

    const highlightX0 = x(comparedFromIndex) - 18;
    const highlightX1 = x(points.length - 1) + 18;
    const last = points[points.length - 1];

    return {
      width,
      height,
      padL,
      padR,
      padT,
      padB,
      x,
      y,
      actualPath,
      planPath,
      yTicks,
      highlightX0,
      highlightX1,
      last,
    };
  }, [points, comparedFromIndex]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-fg-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-brand-500" aria-hidden />
          Actual
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-sky-600" aria-hidden />
          Plan
        </span>
      </div>
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="h-auto w-full"
        role="img"
        aria-label="8-week revenue trend: actual vs plan"
      >
        <rect
          x={layout.highlightX0}
          y={layout.padT - 8}
          width={layout.highlightX1 - layout.highlightX0}
          height={layout.height - layout.padT - layout.padB + 16}
          rx={8}
          className="fill-brand-50"
          fillOpacity={0.65}
        />
        <text
          x={(layout.highlightX0 + layout.highlightX1) / 2}
          y={layout.padT - 12}
          textAnchor="middle"
          className="fill-brand-600"
          fontSize={11}
          fontWeight={600}
        >
          Compared below
        </text>

        {layout.yTicks.map((t) => (
          <g key={t.v}>
            <line
              x1={layout.padL}
              x2={layout.width - layout.padR}
              y1={t.y}
              y2={t.y}
              className="stroke-slate-100"
              strokeWidth={1}
            />
            <text
              x={layout.padL - 8}
              y={t.y + 3}
              textAnchor="end"
              className="fill-slate-400"
              fontSize={10}
            >
              {formatAxisM(t.v)}
            </text>
          </g>
        ))}

        <path
          d={layout.planPath}
          fill="none"
          className="stroke-sky-600"
          strokeWidth={2}
          strokeDasharray="6 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={layout.actualPath}
          fill="none"
          className="stroke-brand-500"
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <g key={p.label}>
            <circle
              cx={layout.x(i)}
              cy={layout.y(p.actual)}
              r={i === points.length - 1 ? 4 : 3.5}
              className={
                i === points.length - 1
                  ? "fill-brand-500"
                  : "fill-surface stroke-brand-500"
              }
              strokeWidth={i === points.length - 1 ? 0 : 1.75}
            />
            <text
              x={layout.x(i)}
              y={layout.height - 10}
              textAnchor="middle"
              className="fill-slate-400"
              fontSize={10}
            >
              {p.label}
            </text>
          </g>
        ))}

        {layout.last && endLabels ? (
          <>
            <text
              x={layout.x(points.length - 1) + 10}
              y={layout.y(layout.last.plan) + 4}
              className="fill-sky-700"
              fontSize={12}
              fontWeight={700}
            >
              {endLabels.plan}
            </text>
            <text
              x={layout.x(points.length - 1) + 10}
              y={layout.y(layout.last.actual) + 4}
              className="fill-brand-700"
              fontSize={12}
              fontWeight={700}
            >
              {endLabels.actual}
            </text>
          </>
        ) : null}
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------- Week cards */

function WeekCard({ row }: { row: GapPeriodRow }) {
  const pct =
    !row.pending &&
    row.actualValue != null &&
    row.planValue != null &&
    row.planValue > 0
      ? Math.min(100, (row.actualValue / row.planValue) * 100)
      : null;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-3 rounded-xl border bg-surface px-3.5 py-3",
        row.featured
          ? "border-brand-400 shadow-[0_0_0_1px_var(--color-brand-200)]"
          : "border-border-default",
      )}
    >
      <div className="text-[11px] font-medium text-fg-secondary">
        {row.label}
        {row.caption ? (
          <span className="text-fg-tertiary"> ({row.caption})</span>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-wide text-fg-tertiary">
            Actual
          </div>
          <div
            className={cn(
              "text-base font-semibold tabular-nums tracking-tight",
              row.pending ? "text-fg-tertiary" : "text-fg-primary",
            )}
          >
            {row.actual}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-semibold uppercase tracking-wide text-fg-tertiary">
            Plan
          </div>
          <div className="text-base font-semibold tabular-nums tracking-tight text-fg-primary">
            {row.plan}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="relative h-2.5 overflow-hidden rounded-full bg-red-50">
          {row.pending ? (
            <div className="absolute inset-0 bg-slate-100" />
          ) : (
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-slate-800"
              style={{ width: `${pct ?? 0}%` }}
            />
          )}
        </div>
        {!row.pending && row.gap !== "—" ? (
          <div className="text-right text-[11px] font-semibold tabular-nums text-feedback-danger">
            {row.gap} GAP
          </div>
        ) : null}
      </div>

      <div className="mt-auto text-[11px] text-fg-tertiary">
        {row.pending
          ? "Week in progress"
          : row.attainment
            ? `${row.attainment} attainment`
            : null}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Drivers */

const DRIVER_ICON: Record<string, LucideIcon> = {
  Traffic: Eye,
  Conversion: Percent,
  Price: DollarSign,
};

function InsightRow({ insight }: { insight: GapDriverInsight }) {
  const negative = insight.tone === "negative";
  return (
    <div
      className={cn(
        "relative rounded-lg border border-border-default bg-surface px-3 py-2.5 pl-3.5",
        negative ? "bg-red-50/40" : "bg-emerald-50/40",
      )}
    >
      <span
        className={cn(
          "absolute inset-y-2 left-0 w-[3px] rounded-full",
          negative ? "bg-feedback-danger" : "bg-feedback-success",
        )}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold leading-snug text-fg-primary">
          {insight.title}
        </p>
        <Plus className="mt-0.5 size-3.5 shrink-0 text-fg-tertiary" aria-hidden />
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-fg-secondary">
        {insight.body}
      </p>
    </div>
  );
}

function DriverColumn({ driver }: { driver: GapDriverCard }) {
  const positive = driver.impactTone === "positive";
  const Icon = DRIVER_ICON[driver.label] ?? Eye;

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border-default bg-surface">
      <div
        className={cn(
          "space-y-2 px-3.5 py-3",
          positive ? "bg-emerald-50/70" : "bg-red-50/70",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-fg-primary">
            <Icon className="size-3.5 text-fg-secondary" aria-hidden />
            {driver.label}
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
              positive
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-700",
            )}
          >
            {driver.direction === "up" ? "↗" : "↘"} {driver.pctChange}
          </span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-wide text-fg-tertiary">
              Last week
            </div>
            <div className="text-lg font-semibold tabular-nums tracking-tight text-fg-primary">
              {driver.lastWeek}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-semibold uppercase tracking-wide text-fg-tertiary">
              Prev week
            </div>
            <div className="text-sm tabular-nums text-fg-tertiary">
              {driver.prevWeek}
            </div>
          </div>
        </div>
        <p
          className={cn(
            "text-[12px] font-semibold",
            positive ? "text-feedback-success" : "text-feedback-danger",
          )}
        >
          Revenue impact ≈ {driver.revenueImpact}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 py-3">
        {driver.insights.map((insight) => (
          <InsightRow key={insight.title} insight={insight} />
        ))}
      </div>

      <div className="mt-auto border-t border-border-default bg-surface-muted/60 px-3.5 py-2.5 text-[12px] leading-relaxed text-fg-secondary">
        <span className="font-semibold text-fg-primary">Net: </span>
        {driver.net}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Brands + recs */

function brandValueClass(tone: GapTone): string {
  if (tone === "negative") return "text-feedback-danger";
  if (tone === "positive") return "text-feedback-success";
  return "text-emerald-800";
}

function BrandCard({ item }: { item: GapBrandCard }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-xl border border-border-default bg-slate-50 px-4 py-3.5">
      <div
        className={cn(
          "text-2xl font-semibold tabular-nums tracking-tight",
          brandValueClass(item.tone),
        )}
      >
        {item.value}
      </div>
      <div className="text-[11px] text-fg-tertiary">{item.meta}</div>
      <p className="text-sm font-semibold leading-snug text-fg-primary">
        {item.title}
      </p>
      <p className="text-[13px] leading-relaxed text-fg-secondary">{item.body}</p>
    </div>
  );
}

/**
 * Gap to Plan analysis — single card container with divider-separated sections.
 */
export function GapToPlanReport({
  report,
  keyFinding,
  streaming,
  streamingText,
  onSkipStream,
  showAnalysis = true,
}: GapToPlanReportProps) {
  const findingBody = streaming ? (
    <p
      className="text-[15px] leading-relaxed text-fg-primary"
      onClick={onSkipStream}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSkipStream?.();
      }}
      role="button"
      tabIndex={0}
      title="Click to skip to full text"
    >
      {streamingText}
    </p>
  ) : (
    keyFinding.map((para) => (
      <EmphasisText
        key={para.slice(0, 48)}
        text={para}
        className="text-[15px] leading-relaxed text-fg-primary"
      />
    ))
  );

  const featuredWeek = report.planVsDrivers.weeks.find((w) => w.featured);

  return (
    <div className="overflow-hidden rounded-2xl border border-border-default bg-surface shadow-pane">
      {/* Header + narrative */}
      <header className="space-y-3 px-5 py-5">
        <div className="inline-flex items-center gap-1.5 text-brand-600">
          <Sparkles className="size-3.5" aria-hidden />
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase">
            Analysis
          </span>
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-fg-primary">
            {report.title}
          </h2>
          <p className="mt-1 text-sm text-fg-tertiary">{report.subtitle}</p>
        </div>
        <div className="space-y-2">{findingBody}</div>
      </header>

      {showAnalysis ? (
        <>
          <SectionDivider />
          <Appear delay={sectionDelay(0)}>
            <CollapsibleSection
              title={report.trend.title ?? "8-week revenue trend"}
              subtitle={report.trend.subtitle ?? "Actual vs plan"}
            >
              <RevenueTrendChart
                points={report.trend.points}
                comparedFromIndex={report.trend.comparedFromIndex}
                endLabels={report.trend.endLabels}
              />
            </CollapsibleSection>
          </Appear>

          <SectionDivider />
          <Appear delay={sectionDelay(1)}>
            <CollapsibleSection
              title={
                report.planVsDrivers.title ?? "Plan vs actual → what drove it"
              }
              subtitle={
                report.planVsDrivers.subtitle ??
                "Last 3 weeks, then last week's drivers"
              }
            >
              <div className="flex flex-col">
                <EmphasisText
                  text={report.planVsDrivers.narrative}
                  className="text-sm leading-relaxed text-fg-secondary"
                />

                <div className="my-4 border-t border-border-default" />

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {report.planVsDrivers.weeks.map((week) => (
                    <WeekCard key={week.label} row={week} />
                  ))}
                </div>

                <div className="my-4 border-t border-border-default" />

                {featuredWeek ? (
                  <div className="relative pt-2">
                    <div
                      className="pointer-events-none absolute inset-x-[16.6%] -top-1 hidden h-6 border-x border-t border-border-default md:block"
                      aria-hidden
                    />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      {report.planVsDrivers.drivers.map((driver) => (
                        <DriverColumn key={driver.id} driver={driver} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {report.planVsDrivers.drivers.map((driver) => (
                      <DriverColumn key={driver.id} driver={driver} />
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </Appear>

          <SectionDivider />
          <Appear delay={sectionDelay(2)}>
            <CollapsibleSection
              title={report.brands.title ?? "Where the gap sits by brand"}
              meta={`${report.brands.items.length} items`}
            >
              <EmphasisText
                text={report.brands.summary}
                className="mb-4 text-sm leading-relaxed text-fg-secondary"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {report.brands.items.map((item) => (
                  <BrandCard key={item.title} item={item} />
                ))}
              </div>
            </CollapsibleSection>
          </Appear>

          <SectionDivider />
          <Appear delay={sectionDelay(3)}>
            <CollapsibleSection
              title={
                report.recommendations.title ?? "Recommended next steps"
              }
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {report.recommendations.items.map((rec, i) => (
                  <div
                    key={rec.title}
                    className="rounded-xl border border-border-default bg-surface px-4 py-3.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-fg-primary">
                            {rec.title}
                          </p>
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border-default text-fg-tertiary">
                            <Plus className="size-3.5" aria-hidden />
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-fg-secondary">
                          {rec.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </Appear>
        </>
      ) : null}
    </div>
  );
}
