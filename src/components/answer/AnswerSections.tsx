import type { AnswerSection } from "@/types";

import { ActionLog } from "./ActionLog";
import { ActionRecommendations } from "./ActionRecommendations";
import { AnalysisPanel } from "./AnalysisPanel";
import { AnswerTable } from "./AnswerTable";
import { ChangeLogCard } from "./ChangeLogCard";
import { Checklist } from "./Checklist";
import { CompareStrip } from "./CompareStrip";
import { DashboardPreviewCard } from "./DashboardPreviewCard";
import { InsightCallout } from "./InsightCallout";
import { IssueBreakdown } from "./IssueBreakdown";
import { RecommendationCards } from "./RecommendationCards";
import { ScorecardRow } from "./ScorecardRow";
import { SectionCard } from "./SectionCard";
import { SeverityGroups } from "./SeverityGroups";
import { TrendChart } from "./TrendChart";
import { VisualBlockView } from "./VisualBlockView";
import { WeekdayPattern } from "./WeekdayPattern";
import { WeeklyNotes } from "./WeeklyNotes";

interface AnswerSectionsProps {
  sections: AnswerSection[];
  ready: boolean;
  onOpenDashboard?: () => void;
}

export function AnswerSections({
  sections,
  ready,
  onOpenDashboard,
}: AnswerSectionsProps) {
  if (!ready || !sections.length) return null;

  return (
    <div className="space-y-5">
      {sections.map((section) => {
        switch (section.kind) {
          case "scorecard":
            return (
              <ScorecardRow
                key={section.id}
                title={section.title}
                tiles={section.tiles}
              />
            );
          case "table":
            return (
              <AnswerTable
                key={section.id}
                title={section.title}
                table={section.table}
              />
            );
          case "compareStrip":
            return (
              <CompareStrip
                key={section.id}
                title={section.title}
                priorLabel={section.priorLabel}
                currentLabel={section.currentLabel}
                rows={section.rows}
              />
            );
          case "severityGroup":
            return (
              <SeverityGroups
                key={section.id}
                title={section.title}
                groups={section.groups}
              />
            );
          case "callout":
            return (
              <InsightCallout key={section.id} callout={section.callout} />
            );
          case "narrative":
            return (
              <div key={section.id} className="space-y-1.5">
                {section.title ? (
                  <h3 className="text-sm font-semibold text-fg-primary">
                    {section.title}
                  </h3>
                ) : null}
                {section.body ? (
                  <p className="text-sm leading-relaxed text-fg-secondary">
                    {section.body}
                  </p>
                ) : null}
              </div>
            );
          case "visual":
            return (
              <SectionCard key={section.id} title={section.title}>
                <VisualBlockView visual={section.visual} ready={ready} />
              </SectionCard>
            );
          case "actionLog":
            return (
              <ActionLog
                key={section.id}
                title={section.title}
                rows={section.rows}
              />
            );
          case "changeLog":
            return (
              <ChangeLogCard
                key={section.id}
                campaign={section.campaign}
                metricLabel={section.metricLabel}
                fromValue={section.fromValue}
                toValue={section.toValue}
                meta={section.meta}
              />
            );
          case "recommendationCards":
            return (
              <RecommendationCards key={section.id} cards={section.cards} />
            );
          case "weekdayPattern":
            return (
              <WeekdayPattern
                key={section.id}
                body={section.body}
                caption={section.caption}
                days={section.days}
              />
            );
          case "checklist":
            return <Checklist key={section.id} items={section.items} />;
          case "dashboardPreview":
            return (
              <DashboardPreviewCard
                key={section.id}
                title={section.title}
                widgets={section.widgets}
                openLabel={section.openLabel}
                onOpen={onOpenDashboard}
              />
            );
          case "analysisPanel":
            return <AnalysisPanel key={section.id} panel={section.panel} />;
          case "issueBreakdown":
            return (
              <IssueBreakdown
                key={section.id}
                title={section.title}
                items={section.items}
              />
            );
          case "trendChart":
            return (
              <TrendChart
                key={section.id}
                title={section.title}
                points={section.points}
                actualLabel={section.actualLabel}
                planLabel={section.planLabel}
              />
            );
          case "weeklyNotes":
            return <WeeklyNotes key={section.id} notes={section.notes} />;
          case "actionRecommendations":
            return (
              <ActionRecommendations
                key={section.id}
                title={section.title}
                items={section.items}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
