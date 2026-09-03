import { useState } from "react";
import { Button, Input, Label } from "@ciq-dev/ciq-design-system";

import type { AutomationDraft } from "@/types";

import { BacktestPreviewCard } from "./BacktestPreviewCard";

interface AutomationConfigCardProps {
  draft: AutomationDraft;
  onActivate: (draft: AutomationDraft) => void;
  onCancel: () => void;
}

export function AutomationConfigCard({
  draft: initial,
  onActivate,
  onCancel,
}: AutomationConfigCardProps) {
  const [draft, setDraft] = useState(initial);
  const [previewed, setPreviewed] = useState(false);

  return (
    <div className="space-y-3 rounded-xl border border-border-default bg-surface p-4 shadow-sm">
      <div className="text-sm font-semibold text-fg-primary">
        Configure automation
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="auto-name">Name</Label>
          <Input
            id="auto-name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="auto-threshold">Threshold (judgment call)</Label>
          <Input
            id="auto-threshold"
            value={draft.threshold}
            onChange={(e) => setDraft({ ...draft, threshold: e.target.value })}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="auto-def">Check definition</Label>
          <Input
            id="auto-def"
            value={draft.checkDefinition}
            onChange={(e) =>
              setDraft({ ...draft, checkDefinition: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="auto-sched">Schedule</Label>
          <Input
            id="auto-sched"
            value={`${draft.schedule.freq} at ${draft.schedule.time}`}
            onChange={(e) =>
              setDraft({
                ...draft,
                schedule: { ...draft.schedule, time: e.target.value },
              })
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Delivery</Label>
          <p className="text-sm text-fg-secondary">
            {draft.channels.join(", ")} → {draft.recipients.join(", ")}
          </p>
        </div>
      </div>

      {!previewed ? (
        <Button size="sm" variant="outline" onClick={() => setPreviewed(true)}>
          Preview backtest
        </Button>
      ) : (
        <BacktestPreviewCard summary={draft.backtestSummary} />
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!previewed}
          onClick={() => onActivate(draft)}
        >
          Turn it on
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
