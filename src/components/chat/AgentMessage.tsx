import { useState } from "react";
import {
  Button,
  Chip,
  Message,
  MessageContent,
  cn,
} from "@ciq-dev/ciq-design-system";
import { ThumbsDown, ThumbsUp } from "lucide-react";

import { AnswerSections } from "@/components/answer/AnswerSections";
import { AssumptionChip } from "@/components/answer/AssumptionChip";
import { FollowupChips } from "@/components/answer/FollowupChips";
import { GapToPlanReport } from "@/components/answer/GapToPlanReport";
import { HeroStatTile } from "@/components/answer/HeroStatTile";
import { TradeoffCard } from "@/components/answer/TradeoffCard";
import { WhyList } from "@/components/answer/WhyList";
import {
  DetailTable,
  VisualBlockView,
} from "@/components/answer/VisualBlockView";
import { AutomationConfigCard } from "@/components/overlays/AutomationConfigCard";
import { DeckBuilder } from "@/components/overlays/DeckBuilder";
import { DisambiguationPrompt } from "@/components/overlays/DisambiguationPrompt";
import { InlineBanner } from "@/components/overlays/InlineBanner";
import { InterpretationEchoCard } from "@/components/overlays/InterpretationEchoCard";
import { useTypewriter } from "@/hooks/useTypewriter";
import { prefersReducedMotion, stripEmphasis } from "@/lib/utils";
import { useAllyStore } from "@/store/ally-store";
import type { Turn } from "@/types";

import { AgentThinking } from "./AgentThinking";

function AgentPlain({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  // Same chrome as MessageContent variant="agent-plain" (no bubble / border / shadow).
  // We use a div because MessageContent's types intersect with Markdown (children: string).
  return (
    <div
      className={cn(
        "w-full !max-w-full break-words whitespace-normal text-fg-primary",
        "bg-transparent p-0",
        className
      )}
    >
      {children}
    </div>
  );
}

interface UserMessageProps {
  turn: Turn;
  scopeChips: string[];
}

export function UserMessage({ turn, scopeChips }: UserMessageProps) {
  return (
    <Message className="justify-end">
      <div className="flex max-w-[85%] flex-col items-end gap-1">
        <MessageContent
          variant="user"
          className="max-w-full !rounded-lg !p-2 md:!p-2.5"
        >
          {turn.input ?? ""}
        </MessageContent>
        {turn.attachments?.map((a) => (
          <div key={a.name} className="text-right text-xs text-fg-tertiary">
            📎 {a.name} ({a.sizeKb} KB)
          </div>
        ))}
        {scopeChips.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1">
            {scopeChips.map((c) => (
              <Chip key={c} message={c} className="border-0 bg-slate-50" />
            ))}
          </div>
        )}
      </div>
    </Message>
  );
}

interface AgentMessageProps {
  turn: Turn;
  threadId: string;
  isLast: boolean;
}

export function AgentMessage({ turn, threadId, isLast }: AgentMessageProps) {
  const submitMessage = useAllyStore((s) => s.submitMessage);
  const activateAutomation = useAllyStore((s) => s.activateAutomation);
  const openDashboard = useAllyStore((s) => s.openDashboard);
  const setFeedback = useAllyStore((s) => s.setFeedback);
  const scope = useAllyStore((s) => s.scope);
  const isRunning = useAllyStore((s) => s.isRunning);

  const [showAutomation, setShowAutomation] = useState(false);
  const [showDeck, setShowDeck] = useState(false);
  const reduced = prefersReducedMotion();

  const answer = turn.answer;
  const whyText = stripEmphasis(answer?.why?.join(" ") ?? "");
  const shouldStream = Boolean(answer) && isLast && !reduced;
  const hasGapToPlanReport = Boolean(answer?.gapToPlanReport);
  const hasSections = Boolean(answer?.sections?.length);

  const {
    displayed: streamedWhy,
    done: streamDone,
    skip,
  } = useTypewriter(whyText, {
    enabled: shouldStream,
    charsPerTick: 4,
    intervalMs: 22,
  });

  if (turn.thinking && !turn.thinking.done && !answer && !turn.disambiguation) {
    return (
      <Message className="w-full">
        <div className="w-full min-w-0 flex-1">
          <AgentThinking steps={turn.thinking.steps} done={false} />
        </div>
      </Message>
    );
  }

  if (turn.disambiguation) {
    return (
      <Message className="w-full">
        <AgentPlain className="!max-w-full">
          <DisambiguationPrompt
            question={turn.disambiguation.question}
            options={turn.disambiguation.options}
            disabled={isRunning}
            onSelect={(opt) => {
              void submitMessage(opt, {
                explicitFixtureId: "skin-care-drivers",
              });
            }}
          />
        </AgentPlain>
      </Message>
    );
  }

  if (!answer) return null;

  const feedback = turn.feedback?.sentiment;

  return (
    <Message className="w-full">
      <div className="w-full min-w-0 flex-1 space-y-3">
        <AgentPlain className="!max-w-full">
          {scope.stale ? (
            <InlineBanner
              message={`${scope.stale.source} last refreshed ${scope.stale.hoursOld} hours ago — past its refresh SLA.`}
            />
          ) : null}

          {/* Plain agent response — fills the chat column (max-w-3xl Content) */}
          <div className="relative w-full space-y-5">
            {turn.thinking?.steps.length ? (
              <AgentThinking
                steps={turn.thinking.steps}
                done={turn.thinking.done}
              />
            ) : null}

            {/* Gap to Plan uses a dedicated report card (header lives inside it) */}
            {!hasGapToPlanReport ? (
              <div className="flex items-start gap-3">
                {answer.reportTitle ? (
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold tracking-tight text-fg-primary">
                      {answer.reportTitle}
                    </h2>
                    {answer.reportSubtitle ? (
                      <p className="text-sm text-fg-secondary">
                        {answer.reportSubtitle}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-fg-tertiary">
                    {answer.scopeLine}
                  </div>
                )}
              </div>
            ) : null}

            <div className="space-y-5">
              {answer.interpretationEcho ? (
                <InterpretationEchoCard {...answer.interpretationEcho} />
              ) : null}

              {hasGapToPlanReport && answer.gapToPlanReport ? (
                <GapToPlanReport
                  report={answer.gapToPlanReport}
                  keyFinding={answer.why}
                  streaming={shouldStream && !streamDone}
                  streamingText={streamedWhy}
                  onSkipStream={skip}
                  showAnalysis={streamDone}
                />
              ) : null}

              {!hasGapToPlanReport && whyText ? (
                <WhyList
                  bullets={answer.why}
                  streaming={shouldStream && !streamDone}
                  streamingText={streamedWhy}
                  onSkip={skip}
                  label={answer.reportTitle ? "Key finding" : undefined}
                />
              ) : null}

              {streamDone && !hasGapToPlanReport && hasSections ? (
                <AnswerSections
                  sections={answer.sections!}
                  ready={streamDone}
                  onOpenDashboard={() => openDashboard(threadId)}
                />
              ) : null}

              {streamDone
                ? answer.assumptionFlags?.map((flag) => (
                    <AssumptionChip
                      key={flag.label}
                      label={flag.label}
                      detail={flag.detail}
                    />
                  ))
                : null}

              {streamDone &&
              !hasGapToPlanReport &&
              !hasSections &&
              answer.headline.value ? (
                <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                  <HeroStatTile
                    value={answer.headline.value}
                    delta={answer.headline.delta}
                    direction={answer.headline.direction}
                  />
                  {answer.visual ? (
                    <VisualBlockView visual={answer.visual} ready={streamDone} />
                  ) : null}
                </div>
              ) : null}

              {streamDone &&
              !hasGapToPlanReport &&
              !hasSections &&
              answer.visual &&
              !answer.headline.value ? (
                <VisualBlockView visual={answer.visual} ready />
              ) : null}

              {streamDone &&
              !hasGapToPlanReport &&
              !hasSections &&
              answer.table ? (
                <DetailTable
                  columns={answer.table.columns}
                  rows={answer.table.rows}
                />
              ) : null}

              {streamDone && answer.recommendation ? (
                <TradeoffCard options={answer.recommendation.options} />
              ) : null}

              {streamDone && answer.deckOutline ? (
                <div>
                  {!showDeck ? (
                    <Button size="sm" onClick={() => setShowDeck(true)}>
                      Review slide outline
                    </Button>
                  ) : (
                    <DeckBuilder slides={answer.deckOutline.slides} />
                  )}
                </div>
              ) : null}

              {streamDone && (answer.automationDraft || showAutomation) ? (
                <AutomationConfigCard
                  draft={
                    answer.automationDraft ?? {
                      name: "Custom automation",
                      checkDefinition: "Repeat this check",
                      schedule: { freq: "daily", time: "07:00 PT" },
                      threshold: "Platform default",
                      channels: ["in_app", "email"],
                      recipients: ["you@brand.com"],
                      repeatPolicy: "notify_once_then_on_change",
                      backtestSummary:
                        "On yesterday's data, this would have flagged 2 items.",
                    }
                  }
                  onActivate={(d) => {
                    activateAutomation(d, threadId);
                    setShowAutomation(false);
                  }}
                  onCancel={() => setShowAutomation(false)}
                />
              ) : null}

              {/* Follow-ups sit with the answer body (RCA mock) */}
              {streamDone && answer.followups?.length > 0 ? (
                <FollowupChips
                  followups={answer.followups}
                  disabled={isRunning}
                  onSelect={(label, nextTurnId) =>
                    void submitMessage(label, { explicitFixtureId: nextTurnId })
                  }
                />
              ) : null}
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                aria-label="Thumbs up"
                className={cn(
                  "rounded-md p-1 text-fg-tertiary hover:bg-surface-muted hover:text-fg-secondary",
                  feedback === "up" && "bg-green-50 text-feedback-success"
                )}
                onClick={() => setFeedback(turn.id, { sentiment: "up" })}
              >
                <ThumbsUp className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label="Thumbs down"
                className={cn(
                  "rounded-md p-1 text-fg-tertiary hover:bg-surface-muted hover:text-fg-secondary",
                  feedback === "down" && "bg-red-50 text-feedback-danger"
                )}
                onClick={() => setFeedback(turn.id, { sentiment: "down" })}
              >
                <ThumbsDown className="size-3.5" />
              </button>
            </div>
          </div>
        </AgentPlain>
      </div>
    </Message>
  );
}
