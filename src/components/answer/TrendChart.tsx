import { useMemo } from "react";

import type { TrendSeriesPoint } from "@/types";

import { SectionCard } from "./SectionCard";

interface TrendChartProps {
  title?: string;
  points: TrendSeriesPoint[];
  actualLabel?: string;
  planLabel?: string;
  /** When false, render chart only (no SectionCard) — used inside GapToPlanReport */
  framed?: boolean;
  /** Shade the area between plan and actual so the shortfall reads as volume */
  showGapArea?: boolean;
}

function formatAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

/** Dual-line actual vs plan trend for the gap-to-plan report. */
export function TrendChart({
  title = "8-Week Revenue Trend",
  points,
  actualLabel = "Actual",
  planLabel = "Plan",
  framed = true,
  showGapArea = false,
}: TrendChartProps) {
  const layout = useMemo(() => {
    const width = 640;
    const height = 260;
    const padL = 52;
    const padR = 16;
    const padT = 16;
    const padB = 36;
    const values = points.flatMap((p) => [p.actual, p.plan]);
    const lo = Math.min(...values);
    const hi = Math.max(...values, 1);
    const span = Math.max(hi - lo, 1);
    // Anchor near the data floor rather than zero — at these magnitudes a
    // zero baseline flattens the plan-vs-actual separation into one line.
    const minY = Math.max(0, lo - span * 0.35);
    const maxY = hi + span * 0.15;
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

    const gapArea = [
      ...points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.plan)}`),
      ...points
        .map((p, i) => `L ${x(i)} ${y(p.actual)}`)
        .reverse(),
      "Z",
    ].join(" ");

    const ticks = 5;
    const yTicks = Array.from({ length: ticks }, (_, i) => {
      const v = minY + ((maxY - minY) / (ticks - 1)) * i;
      return { v, y: y(v) };
    });

    return {
      width,
      height,
      padL,
      padB,
      x,
      y,
      actualPath,
      planPath,
      gapArea,
      yTicks,
      maxY,
    };
  }, [points]);

  const chart = (
    <>
      <div className="mb-2 flex items-center gap-4 text-[11px] text-fg-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded bg-slate-700" />
          {actualLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-amber-500" />
          {planLabel}
        </span>
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="h-auto w-full min-w-[480px]"
          role="img"
          aria-label={`${title}: ${actualLabel} vs ${planLabel}`}
        >
          {layout.yTicks.map((t) => (
            <g key={t.v}>
              <line
                x1={layout.padL}
                x2={layout.width - 16}
                y1={t.y}
                y2={t.y}
                stroke="var(--border-default, #e2e8f0)"
                strokeWidth={1}
              />
              <text
                x={layout.padL - 8}
                y={t.y + 3}
                textAnchor="end"
                className="fill-fg-tertiary"
                fontSize={10}
              >
                {formatAxis(t.v)}
              </text>
            </g>
          ))}

          {showGapArea ? (
            <path d={layout.gapArea} fill="#ef4444" fillOpacity={0.07} />
          ) : null}

          <path
            d={layout.planPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 4"
          />
          <path
            d={layout.actualPath}
            fill="none"
            stroke="#334155"
            strokeWidth={2.25}
          />

          {points.map((p, i) => (
            <g key={p.label}>
              <circle
                cx={layout.x(i)}
                cy={layout.y(p.actual)}
                r={3}
                fill="#334155"
              />
              <circle
                cx={layout.x(i)}
                cy={layout.y(p.plan)}
                r={2.5}
                fill="#f59e0b"
              />
              <text
                x={layout.x(i)}
                y={layout.height - 12}
                textAnchor="middle"
                className="fill-fg-tertiary"
                fontSize={10}
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </>
  );

  if (!framed) return <div className="space-y-0">{chart}</div>;

  return <SectionCard title={title}>{chart}</SectionCard>;
}
