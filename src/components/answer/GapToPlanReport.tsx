import { cn } from "@ciq-dev/ciq-design-system";
import { Sparkles } from "lucide-react";

import type { GapToPlanReportData, GapToPlanVerdict } from "@/types";

import { EmphasisText } from "./EmphasisText";
import { GapToPlanDisclosure } from "./GapToPlanDisclosure";
import {
  DriverPanel,
  driverComparePeriods,
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

const verdictValueClass =
  "mt-0.5 text-lg font-semibold leading-none tabular-nums tracking-tight";

function VerdictMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger" | "success";
}) {
  return (
    <div className="px-4 text-right first:pl-0 last:pr-0">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-fg-tertiary">
        {label}
      </dt>
      <dd
        className={cn(
          verdictValueClass,
          tone === "danger" && "text-feedback-danger",
          tone === "success" && "text-feedback-success",
          !tone && "text-fg-primary",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * Header KPIs — three equal figures. Semantic color only on gap.
 */
function HeaderVerdict({ verdict }: { verdict: GapToPlanVerdict }) {
  const attainment = `${verdict.attainmentPct.toFixed(1)}%`;
  const missed = verdict.gapDirection === "down";

  return (
    <dl
      className="flex shrink-0 items-start divide-x divide-border-default"
      aria-label={`${verdict.actualValue} actual of ${verdict.planValue} plan — gap ${verdict.gapValue} (${attainment})`}
    >
      <VerdictMetric
        label="Gap"
        value={verdict.gapValue}
        tone={missed ? "danger" : "success"}
      />
      <VerdictMetric label="Actual" value={verdict.actualValue} />
      <VerdictMetric label="Attainment" value={attainment} />
    </dl>
  );
}

/**
 * Fixed Gap to Plan analysis response template.
 *
 *   Header (title + verdict KPIs) → Key finding → Supporting analysis
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
  const driverPeriods = driverComparePeriods(report.planVsActual.rows);

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
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-1.5 text-brand-600">
              <Sparkles className="size-3.5 shrink-0" aria-hidden />
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                Ally
              </span>
            </div>
            <h2 className="text-base font-semibold leading-snug tracking-tight text-fg-primary">
              {report.title}
            </h2>
          </div>
          <HeaderVerdict verdict={report.verdict} />
        </div>
        <p className="mt-1.5 text-xs text-fg-tertiary">{report.subtitle}</p>
      </header>

      <div className="space-y-2 px-6 py-6">{findingBody}</div>

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
                compareFrom={driverPeriods.from}
                compareTo={driverPeriods.to}
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
