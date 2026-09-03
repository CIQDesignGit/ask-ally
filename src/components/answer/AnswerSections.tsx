import type { AnswerSection } from "@/types";

import { ActionLog } from "./ActionLog";
import { AnswerTable } from "./AnswerTable";
import { ChangeLogCard } from "./ChangeLogCard";
import { Checklist } from "./Checklist";
import { CompareStrip } from "./CompareStrip";
import { DashboardPreviewCard } from "./DashboardPreviewCard";
import { InsightCallout } from "./InsightCallout";
import { RecommendationCards } from "./RecommendationCards";
import { ScorecardRow } from "./ScorecardRow";
import { SectionCard } from "./SectionCard";
import { SeverityGroups } from "./SeverityGroups";
import { VisualBlockView } from "./VisualBlockView";
import { WeekdayPattern } from "./WeekdayPattern";

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
              <p
                key={section.id}
                className="text-sm leading-relaxed text-fg-secondary"
              >
                {section.body}
              </p>
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
          default:
            return null;
        }
      })}
    </div>
  );
}
