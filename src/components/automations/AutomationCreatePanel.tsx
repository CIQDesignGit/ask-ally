import { useMemo, useState } from "react";
import { Button, Input, Label } from "@ciq-dev/ciq-design-system";
import { ChevronDown } from "lucide-react";

import { ScopeChips } from "@/components/chat/ScopeChips";
import { AutomationScheduleFields } from "@/components/automations/AutomationScheduleFields";
import { suggestAutomationName } from "@/lib/automation-utils";
import { useAllyStore } from "@/store/ally-store";
import type { AutomationSchedule, ScopeContext, Thread } from "@/types";

interface AutomationCreatePanelProps {
  onCancel: () => void;
  onCreated: (id: string) => void;
}

function threadsWithAnswers(threads: Thread[]) {
  return threads.filter((t) =>
    t.turns.some((turn) => turn.role === "ally" && turn.answer)
  );
}

function firstUserQuestion(thread: Thread): string {
  return (
    thread.turns.find((t) => t.role === "user" && t.input)?.input?.trim() ??
    thread.title
  );
}

export function AutomationCreatePanel({
  onCancel,
  onCreated,
}: AutomationCreatePanelProps) {
  const threads = useAllyStore((s) => s.threads);
  const createAutomation = useAllyStore((s) => s.createAutomation);
  const globalScope = useAllyStore((s) => s.scope);

  const eligible = useMemo(() => threadsWithAnswers(threads), [threads]);

  const [showPast, setShowPast] = useState(false);
  const [sourceThreadId, setSourceThreadId] = useState<string | undefined>();
  const [question, setQuestion] = useState("");
  const [scope, setScope] = useState<ScopeContext>({ ...globalScope });
  const [schedule, setSchedule] = useState<AutomationSchedule>({
    freq: "daily",
    time: "09:00 IST",
    days: ["Mon"],
  });
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [notifyInApp, setNotifyInApp] = useState(true);

  const displayName = nameTouched
    ? name
    : name || suggestAutomationName(question);
  const canSubmit = Boolean(question.trim() && displayName.trim());

  const applyPastThread = (thread: Thread) => {
    const q = firstUserQuestion(thread);
    setQuestion(q);
    setScope({ ...thread.scope });
    setSourceThreadId(thread.id);
    if (!nameTouched) setName(thread.title);
    setShowPast(false);
  };

  const handleCreate = () => {
    if (!canSubmit) return;
    const id = createAutomation({
      name: displayName.trim(),
      question: question.trim(),
      scope,
      schedule: {
        ...schedule,
        days:
          schedule.freq === "weekly"
            ? schedule.days?.length
              ? schedule.days
              : ["Mon"]
            : undefined,
      },
      notifyInApp,
      sourceThreadId,
    });
    onCreated(id);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border-default px-5 py-4">
        <h2 className="text-base font-semibold text-fg-primary">
          New automation
        </h2>
        <p className="mt-0.5 text-sm text-fg-secondary">
          Ally will re-run this analysis on a schedule and save each report
          here.
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
        <section className="space-y-3">
          <div className="text-sm font-medium text-fg-primary">What to run</div>

          <div className="space-y-1">
            <Label htmlFor="auto-question">Question</Label>
            <textarea
              id="auto-question"
              rows={3}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                setSourceThreadId(undefined);
                if (!nameTouched) {
                  setName(suggestAutomationName(e.target.value));
                }
              }}
              placeholder="e.g. Where did we miss plan this month?"
              className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-brand-500"
            />
          </div>

          <div className="space-y-1">
            <Label>Scope</Label>
            <ScopeChips
              scope={scope}
              onScopeChange={(patch) => {
                setSourceThreadId(undefined);
                setScope((s) => ({ ...s, ...patch }));
              }}
            />
          </div>

          {eligible.length > 0 ? (
            <div className="rounded-lg border border-border-default">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-fg-secondary hover:bg-surface-muted"
                aria-expanded={showPast}
                onClick={() => setShowPast((o) => !o)}
              >
                <span>Use a past analysis</span>
                <ChevronDown
                  className={`size-4 shrink-0 transition-transform ${showPast ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {showPast ? (
                <ul className="max-h-44 space-y-0.5 overflow-y-auto border-t border-border-default p-1">
                  {eligible.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => applyPastThread(t)}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-surface-muted ${
                          sourceThreadId === t.id
                            ? "bg-brand-50 text-brand-700"
                            : "text-fg-primary"
                        }`}
                      >
                        <div className="font-medium line-clamp-1">{t.title}</div>
                        <div className="mt-0.5 line-clamp-1 text-xs text-fg-tertiary">
                          {firstUserQuestion(t)}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-fg-tertiary">
              Tip: after you run analyses in chat, you can fill this form from
              them here.
            </p>
          )}
        </section>

        <section className="space-y-3">
          <div className="text-sm font-medium text-fg-primary">When</div>
          <AutomationScheduleFields
            schedule={schedule}
            onChange={setSchedule}
            timeId="auto-time"
          />
        </section>

        <section className="space-y-1">
          <Label htmlFor="auto-name">Name</Label>
          <Input
            id="auto-name"
            value={displayName}
            onChange={(e) => {
              setNameTouched(true);
              setName(e.target.value);
            }}
          />
        </section>

        <section>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-fg-primary">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-border-default"
              checked={notifyInApp}
              onChange={(e) => setNotifyInApp(e.target.checked)}
            />
            <span>
              <span className="font-medium">Notify when ready</span>
              <span className="mt-0.5 block text-xs text-fg-secondary">
                Show an unread badge on Automations when a new report lands.
              </span>
            </span>
          </label>
        </section>
      </div>

      <div className="flex gap-2 border-t border-border-default px-5 py-3">
        <Button size="sm" disabled={!canSubmit} onClick={handleCreate}>
          Create automation
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
