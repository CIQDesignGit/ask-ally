import { Sparkles } from "lucide-react";

import type { GapToPlanReportData, GapToPlanVerdict } from "@/types";

import { EmphasisText } from "./EmphasisText";
import { PlanCompositionBar } from "./GapToPlanBars";
import { GapToPlanDisclosure } from "./GapToPlanDisclosure";
import {
  DriverPanel,
  IssueList,
  PlanVsActualPanel,
  RecommendationList,
  TrendPanel,
} from "./GapToPlanPanels";

interface GapToPlanReportProps {
  report: GapToPlanReportData;
  /** Key finding copy (from AnswerPayload.why) */
  keyFinding: string[];
  streaming?: boolean;
  streamingText?: string;
  onSkipStream?: () => void;
  /** Hold the analysis back until the key finding finishes streaming */
  showAnalysis?: boolean;
}

/**
 * Verdict — one composition bar with Actual, Gap, and Plan plotted on it.
 * Actual + Gap = Plan; the shortfall is the coloured segment, not a second rail.
 */
function Verdict({ verdict }: { verdict: GapToPlanVerdict }) {
  return (
    <div className="space-y-3">
      <PlanCompositionBar
        actualValue={verdict.actualValue}
        planValue={verdict.planValue}
        gapValue={verdict.gapValue}
        attainmentPct={verdict.attainmentPct}
        gapDirection={verdict.gapDirection}
      />
      <div className="text-[13px] font-semibold tabular-nums text-fg-primary">
        {verdict.attainmentPct.toFixed(1)}% attainment
      </div>
    </div>
  );
}

/**
 * Fixed Gap to Plan analysis response template.
 *
 *   Header → Verdict → Key finding → Supporting analysis
 *     (Plan vs Actual · Drivers · Top Issues · Trend · Recommendations)
 *
 * One card only: inside it, grouping comes from hairlines, indentation and
 * white space, and detail is revealed on demand rather than dumped up front.
 *
 * Trigger: “Run Gap to plan analysis for …”
 */
export function GapToPlanReport({
  report,
  keyFinding,
  streaming,
  streamingText,
  onSkipStream,
  showAnalysis = true,
}: GapToPlanReportProps) {
  const issuesTitle =
    report.issues.title ??
    (report.level === "overall" ? "Top issues — by brand" : "Top issues");
  const trendTitle =
    report.trend.title ??
    (report.level === "overall" ? "8-week revenue trend" : "Recent trend");

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

  return (
    <article className="overflow-hidden rounded-xl border border-border-default bg-surface">
      <header className="px-6 pt-5">
        <div className="mb-2 flex items-center gap-1.5 text-brand-600">
          <Sparkles className="size-3.5 shrink-0" aria-hidden />
          <span className="text-[10px] font-semibold uppercase tracking-wide">
            Ally
          </span>
        </div>
        <h2 className="text-base font-semibold leading-snug tracking-tight text-fg-primary">
          {report.title}
        </h2>
        <p className="mt-0.5 text-xs text-fg-tertiary">{report.subtitle}</p>
      </header>

      <div className="space-y-5 px-6 py-6">
        <Verdict verdict={report.verdict} />
        <div className="space-y-2">{findingBody}</div>
      </div>

      {showAnalysis ? (
        <section
          aria-labelledby="gap-to-plan-supporting"
          className="border-t border-border-default"
        >
          <h3
            id="gap-to-plan-supporting"
            className="px-6 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-fg-tertiary"
          >
            Supporting analysis
          </h3>

          <div className="divide-y divide-border-default">
            <GapToPlanDisclosure
              title={report.planVsActual.title ?? "Plan vs actual"}
              summary={report.planVsActual.summary}
              defaultOpen
            >
              <PlanVsActualPanel
                rows={report.planVsActual.rows}
                footer={report.planVsActual.footer}
              />
            </GapToPlanDisclosure>

            <GapToPlanDisclosure
              title={
                report.drivers.title ?? "Quick Ecommerce Equation Breakdown"
              }
            >
              <DriverPanel
                contributions={report.drivers.contributions}
                metrics={report.drivers.metrics}
                footer={report.drivers.footer}
              />
            </GapToPlanDisclosure>

            <GapToPlanDisclosure
              title={issuesTitle}
              summary={report.issues.summary}
            >
              <IssueList items={report.issues.items} />
            </GapToPlanDisclosure>

            <GapToPlanDisclosure
              title={trendTitle}
              summary={report.trend.summary}
            >
              <TrendPanel
                points={report.trend.points}
                actualLabel={report.trend.actualLabel}
                planLabel={report.trend.planLabel}
              />
            </GapToPlanDisclosure>

            <GapToPlanDisclosure
              title={report.recommendations.title ?? "Recommended next steps"}
              summary={report.recommendations.summary}
            >
              <RecommendationList items={report.recommendations.items} />
            </GapToPlanDisclosure>
          </div>
        </section>
      ) : null}
    </article>
  );
}
