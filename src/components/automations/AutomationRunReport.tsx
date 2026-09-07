import { useEffect } from "react";
import { Badge, Button } from "@ciq-dev/ciq-design-system";
import { ArrowLeft, X } from "lucide-react";

import { AnswerSections } from "@/components/answer/AnswerSections";
import { HeroStatTile } from "@/components/answer/HeroStatTile";
import { WhyList } from "@/components/answer/WhyList";
import type { Automation, AutomationRun } from "@/types";

interface AutomationRunReportProps {
  automation: Automation;
  run: AutomationRun;
  onBack: () => void;
  onDismiss: () => void;
  onMarkViewed: () => void;
  onRetry?: () => void;
}

export function AutomationRunReport({
  automation,
  run,
  onBack,
  onDismiss,
  onMarkViewed,
  onRetry,
}: AutomationRunReportProps) {
  useEffect(() => {
    if (!run.viewedAt) onMarkViewed();
  }, [run.id, run.viewedAt, onMarkViewed]);

  const answer = run.answer;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border-default px-5 py-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-fg-secondary hover:text-fg-primary"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to {automation.name}
          </button>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Close details"
            onClick={onDismiss}
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-fg-primary">
            Run report
          </h2>
          <Badge variant="secondary">Automated report</Badge>
          <Badge
            variant={run.status === "failed" ? "destructive" : "secondary"}
          >
            {run.status === "failed" ? "Failed" : "Succeeded"}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-fg-tertiary">
          {automation.name} · {new Date(run.at).toLocaleString()}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {run.status === "failed" || !answer ? (
          <div className="space-y-3 rounded-lg border border-border-default bg-surface-muted/40 p-4">
            <p className="text-sm text-fg-primary">
              {run.summary || "This run did not produce a report."}
            </p>
            {onRetry ? (
              <Button size="sm" onClick={onRetry}>
                Retry
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-5">
            {answer.scopeLine ? (
              <p className="text-xs text-fg-tertiary">{answer.scopeLine}</p>
            ) : null}
            {answer.headline ? (
              <HeroStatTile
                value={answer.headline.value}
                delta={answer.headline.delta}
                direction={answer.headline.direction}
              />
            ) : null}
            {answer.why?.length ? <WhyList bullets={answer.why} /> : null}
            {answer.sections?.length ? (
              <AnswerSections sections={answer.sections} ready />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
