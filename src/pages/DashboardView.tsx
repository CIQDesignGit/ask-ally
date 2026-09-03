import { Button } from "@ciq-dev/ciq-design-system";
import { X } from "lucide-react";

import { AnswerTable } from "@/components/answer/AnswerTable";
import { BridgeChart } from "@/components/answer/BridgeChart";
import { HeroStatTile } from "@/components/answer/HeroStatTile";
import { ScorecardRow } from "@/components/answer/ScorecardRow";
import { useAllyStore } from "@/store/ally-store";
import type { AnswerSection } from "@/types";

interface DashboardViewProps {
  threadId: string;
}

function firstOfKind<K extends AnswerSection["kind"]>(
  sections: AnswerSection[] | undefined,
  kind: K
): Extract<AnswerSection, { kind: K }> | undefined {
  return sections?.find((s): s is Extract<AnswerSection, { kind: K }> => s.kind === kind);
}

export function DashboardView({ threadId }: DashboardViewProps) {
  const closeDashboard = useAllyStore((s) => s.closeDashboard);
  const thread = useAllyStore((s) => s.threads.find((t) => t.id === threadId));

  const lastAnswer = [...(thread?.turns ?? [])]
    .reverse()
    .find((t) => t.answer)?.answer;

  const scorecard = firstOfKind(lastAnswer?.sections, "scorecard");
  const primaryTable = firstOfKind(lastAnswer?.sections, "table");
  const bridge =
    lastAnswer?.visual?.kind === "bridge"
      ? lastAnswer.visual
      : firstOfKind(lastAnswer?.sections, "visual")?.visual.kind === "bridge"
        ? firstOfKind(lastAnswer?.sections, "visual")!.visual
        : undefined;

  return (
    <aside className="flex w-[400px] shrink-0 flex-col border-l border-border-default bg-surface">
      <div className="flex items-center justify-between border-b border-border-default px-3 py-2">
        <div>
          <div className="text-sm font-semibold">Live dashboard</div>
          <div className="text-xs text-fg-tertiary">
            Linked to this conversation
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          aria-label="Close dashboard"
          onClick={closeDashboard}
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="space-y-3 overflow-y-auto p-3">
        {scorecard ? (
          <ScorecardRow title={scorecard.title} tiles={scorecard.tiles} />
        ) : lastAnswer?.headline?.value ? (
          <HeroStatTile
            value={lastAnswer.headline.value}
            delta={lastAnswer.headline.delta}
            direction={lastAnswer.headline.direction}
          />
        ) : null}

        {bridge?.kind === "bridge" ? (
          <BridgeChart steps={bridge.steps} />
        ) : null}

        {primaryTable ? (
          <AnswerTable title={primaryTable.title} table={primaryTable.table} />
        ) : null}

        <div className="rounded-xl border border-border-default p-3 text-xs text-fg-secondary">
          Scope: {thread?.scope.retailer} · {thread?.scope.period.label}
          <br />
          Source footnotes carry through to any export from this dashboard.
        </div>
      </div>
    </aside>
  );
}
