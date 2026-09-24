import { cn } from "@ciq-dev/ciq-design-system";

import type { GapPeriodRow, GapTone } from "@/types";

/**
 * Attainment against a plan track.
 * Fill is the actual; the unfilled sliver is the shortfall to plan.
 * The lollipop sits at the end of the fill. Over-plan weeks go green.
 */
export function AttainmentBar({
  label,
  caption,
  actual,
  plan,
  gap,
  attainment,
  actualValue,
  planValue,
  pending,
  featured = false,
}: GapPeriodRow & { featured?: boolean }) {
  const pct =
    !pending && actualValue != null && planValue != null && planValue > 0
      ? (actualValue / planValue) * 100
      : parseAttainment(attainment);
  const over = pct != null && pct >= 100;
  const trackScale = over && pct ? pct : 100;
  const fillPct = pct == null ? 0 : Math.min(100, (pct / trackScale) * 100);
  const markerPct = fillPct;
  const gapTone =
    pending || gap === "—"
      ? "neutral"
      : gap.trim().startsWith("−") || gap.trim().startsWith("-")
        ? "negative"
        : gap.trim().startsWith("+")
          ? "positive"
          : "neutral";

  return (
    <div
      className={cn("space-y-2.5", featured && "space-y-3")}
      role="img"
      aria-label={
        pending
          ? `${label} — week in progress`
          : `${label}: ${actual} actual of ${plan} plan — gap ${gap}${attainment ? ` (${attainment})` : ""}`
      }
    >
      <div
        className={cn(
          "truncate text-fg-tertiary",
          featured ? "text-[12px]" : "text-[11px]",
        )}
      >
        {label}
        {caption ? <span> ({caption})</span> : null}
      </div>

      {pending ? (
        <div className="text-[15px] font-semibold tabular-nums text-fg-tertiary">
          {gap}
        </div>
      ) : (
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wide text-fg-tertiary">
              Actual
            </div>
            <div
              className={cn(
                "font-semibold tabular-nums tracking-tight text-fg-primary",
                featured ? "text-[22px] leading-none" : "text-[17px] leading-none",
              )}
            >
              {actual}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] font-medium uppercase tracking-wide text-fg-tertiary">
              Gap
            </div>
            <div
              className={cn(
                "font-semibold tabular-nums tracking-tight",
                featured ? "text-[22px] leading-none" : "text-[17px] leading-none",
                gapTone === "positive" && "text-feedback-success",
                gapTone === "negative" && "text-feedback-danger",
                gapTone === "neutral" && "text-fg-tertiary",
              )}
            >
              {gap}
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <div
          className={cn(
            "relative overflow-hidden rounded-md",
            featured ? "h-7" : "h-5",
            pending &&
              "border-2 border-dashed border-slate-400 bg-slate-200",
          )}
        >
          {pending ? null : (
            <>
              <div className="absolute inset-0 bg-slate-100" />
              {over ? (
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-500"
                  style={{ width: `${fillPct}%` }}
                />
              ) : (
                <>
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-500"
                    style={{ width: `${fillPct}%` }}
                  />
                  <div
                    className="absolute inset-y-0 bg-rose-200"
                    style={{
                      left: `${fillPct}%`,
                      width: `${Math.max(0, 100 - fillPct)}%`,
                    }}
                  />
                </>
              )}
              {attainment ? (
                <span
                  className={cn(
                    "absolute inset-y-0 left-2 flex items-center font-semibold tabular-nums text-white",
                    featured ? "text-[11px]" : "text-[10px]",
                  )}
                >
                  {attainment}
                </span>
              ) : null}
            </>
          )}
        </div>

        {!pending ? (
          <div
            className="pointer-events-none absolute -top-1 -bottom-0.5 flex w-2.5 -translate-x-1/2 flex-col items-center"
            style={{ left: `${markerPct}%` }}
            aria-hidden
          >
            <span className="size-1.5 shrink-0 rounded-full bg-slate-900 ring-2 ring-surface" />
            <span className="w-px flex-1 bg-slate-900" />
          </div>
        ) : null}
      </div>

      {pending ? (
        <div className="text-[12px] text-fg-tertiary">Week in progress</div>
      ) : (
        <div className="text-right text-[12px] tabular-nums text-fg-tertiary">
          {plan}
          <span className="ml-1 text-[10px] font-medium uppercase tracking-wide">
            plan
          </span>
        </div>
      )}
    </div>
  );
}

function parseAttainment(value?: string): number | null {
  if (!value) return null;
  const n = Number.parseFloat(value.replace("%", ""));
  return Number.isFinite(n) ? n : null;
}

/**
 * One composition bar: Actual + Gap = Plan.
 * Values are plotted on the composition — Actual and Plan as endpoints,
 * Gap on the shortfall segment. Near-plan misses get a minimum gap width
 * so the shortfall stays readable without inventing new numbers.
 */
export function PlanCompositionBar({
  actualValue,
  planValue,
  gapValue,
  attainmentPct,
  gapDirection = "down",
  className,
}: {
  actualValue: string;
  planValue: string;
  gapValue: string;
  attainmentPct: number;
  gapDirection?: "up" | "down";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(attainmentPct, 100));
  // Keep the gap segment visible even when attainment is 95%+.
  const gapVisual = Math.max(14, 100 - clamped);
  const actualVisual = 100 - gapVisual;
  const short = gapDirection === "down" && clamped < 100;

  return (
    <div
      className={cn("space-y-1.5", className)}
      role="img"
      aria-label={`${actualValue} actual of ${planValue} plan — gap ${gapValue} (${clamped.toFixed(1)}% attainment)`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-fg-tertiary">
            Actual
          </div>
          <div className="truncate text-[20px] font-semibold tabular-nums tracking-tight text-fg-primary">
            {actualValue}
          </div>
        </div>
        <div className="min-w-0 text-right">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-fg-tertiary">
            Plan
          </div>
          <div className="truncate text-[20px] font-semibold tabular-nums tracking-tight text-fg-primary">
            {planValue}
          </div>
        </div>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full">
        <div
          className="h-full bg-slate-700 transition-[width] duration-500"
          style={{ width: `${actualVisual}%` }}
        />
        <div
          className={cn(
            "h-full transition-[width] duration-500",
            short ? "bg-red-300" : "bg-emerald-300",
          )}
          style={{ width: `${gapVisual}%` }}
        />
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[13px] font-semibold tabular-nums text-fg-primary">
          {clamped.toFixed(1)}% attainment
        </div>
        <div
          className={cn(
            "text-[13px] font-semibold tabular-nums",
            short ? "text-feedback-danger" : "text-feedback-success",
          )}
        >
          {gapValue}
          <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-fg-tertiary">
            gap
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Diverging bar around a centre axis — negative extends left, positive right.
 * Lets a set of signed contributions be compared at a glance.
 */
export function DivergingBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const share = max > 0 ? Math.min(Math.abs(value) / max, 1) : 0;
  const width = share * 50;
  const positive = value >= 0;

  return (
    <div
      className={cn(
        "relative h-2.5 w-full rounded-sm bg-slate-200 ring-1 ring-inset ring-slate-300/80",
        className,
      )}
    >
      <div className="absolute inset-y-[-3px] left-1/2 w-px bg-slate-400" />
      <div
        className={cn(
          "absolute inset-y-0 rounded-sm",
          positive ? "bg-feedback-success" : "bg-feedback-danger",
        )}
        style={
          positive
            ? { left: "50%", width: `${width}%` }
            : { right: "50%", width: `${width}%` }
        }
      />
    </div>
  );
}

/** Left-anchored magnitude bar — relative size of one item within a set. */
export function MagnitudeBar({
  share,
  tone = "negative",
  className,
}: {
  share: number;
  tone?: GapTone;
  className?: string;
}) {
  // Floor at 4% so tiny shares still read as a mark on the track.
  const width = Math.max(4, Math.min(share, 1) * 100);
  const fill =
    tone === "positive"
      ? "bg-feedback-success"
      : tone === "neutral"
        ? "bg-slate-400"
        : "bg-feedback-danger";

  return (
    <div
      className={cn(
        "h-2 w-full rounded-full bg-slate-200 ring-1 ring-inset ring-slate-300/80",
        className,
      )}
    >
      <div className={cn("h-full rounded-full", fill)} style={{ width: `${width}%` }} />
    </div>
  );
}

/** Two opposing magnitudes meeting in the middle of one track. */
export function SplitBar({
  leftMagnitude,
  rightMagnitude,
}: {
  leftMagnitude: number;
  rightMagnitude: number;
}) {
  const total = leftMagnitude + rightMagnitude || 1;
  const leftPct = (leftMagnitude / total) * 100;

  return (
    <div className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
      <div className="bg-red-300" style={{ width: `${leftPct}%` }} />
      <div className="flex-1 bg-emerald-300" />
    </div>
  );
}
