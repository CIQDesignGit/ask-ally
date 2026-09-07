import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Input,
  Label,
} from "@ciq-dev/ciq-design-system";
import { MoreHorizontal, X } from "lucide-react";

import { ScopeChips } from "@/components/chat/ScopeChips";
import { AutomationScheduleFields } from "@/components/automations/AutomationScheduleFields";
import {
  formatSchedule,
  formatScopeLine,
  relativeTime,
} from "@/lib/automation-utils";
import type { Automation, AutomationSchedule, ScopeContext } from "@/types";

interface AutomationDetailPanelProps {
  automation: Automation;
  onDismiss: () => void;
  onPause: () => void;
  onResume: () => void;
  onRunNow: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSave: (patch: {
    name: string;
    question: string;
    scope: ScopeContext;
    schedule: AutomationSchedule;
  }) => void;
  onOpenRun: (runId: string) => void;
}

export function AutomationDetailPanel({
  automation: a,
  onDismiss,
  onPause,
  onResume,
  onRunNow,
  onDuplicate,
  onDelete,
  onSave,
  onOpenRun,
}: AutomationDetailPanelProps) {
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState(a.name);
  const [question, setQuestion] = useState(a.question);
  const [scope, setScope] = useState<ScopeContext>(a.scope);
  const [schedule, setSchedule] = useState<AutomationSchedule>(a.schedule);

  useEffect(() => {
    setEditing(false);
    setMenuOpen(false);
    setName(a.name);
    setQuestion(a.question);
    setScope(a.scope);
    setSchedule(a.schedule);
  }, [a.id, a.name, a.question, a.scope, a.schedule]);

  const handleSave = () => {
    onSave({
      name: name.trim() || a.name,
      question: question.trim() || a.question,
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
    });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setName(a.name);
    setQuestion(a.question);
    setScope(a.scope);
    setSchedule(a.schedule);
    setEditing(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border-default px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold text-fg-primary">
                {a.name}
              </h2>
              {a.status === "active" ? (
                <span className="inline-flex items-center rounded-lg border border-transparent bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                  Active
                </span>
              ) : (
                <Badge variant="secondary">Paused</Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-fg-tertiary">
              {a.nextRunAt && a.status === "active"
                ? `Next run ${new Date(a.nextRunAt).toLocaleString()}`
                : a.status === "paused"
                  ? "Paused — will not run on schedule"
                  : "No next run scheduled"}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
            <Button size="sm" variant="outline" onClick={onRunNow}>
              Run now
            </Button>
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                aria-label="More actions"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <MoreHorizontal className="size-4" />
              </Button>
              {menuOpen ? (
                <div className="absolute right-0 z-10 mt-1 min-w-40 rounded-lg border border-border-default bg-surface py-1 shadow-md">
                  {a.status === "active" ? (
                    <button
                      type="button"
                      className="block w-full px-3 py-1.5 text-left text-sm text-fg-primary hover:bg-surface-muted"
                      onClick={() => {
                        setMenuOpen(false);
                        onPause();
                      }}
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="block w-full px-3 py-1.5 text-left text-sm text-fg-primary hover:bg-surface-muted"
                      onClick={() => {
                        setMenuOpen(false);
                        onResume();
                      }}
                    >
                      Resume
                    </button>
                  )}
                  {!editing ? (
                    <button
                      type="button"
                      className="block w-full px-3 py-1.5 text-left text-sm text-fg-primary hover:bg-surface-muted"
                      onClick={() => {
                        setMenuOpen(false);
                        setEditing(true);
                      }}
                    >
                      Edit
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="block w-full px-3 py-1.5 text-left text-sm text-fg-primary hover:bg-surface-muted"
                    onClick={() => {
                      setMenuOpen(false);
                      onDuplicate();
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className="block w-full px-3 py-1.5 text-left text-sm text-red-700 hover:bg-surface-muted"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Close details"
              onClick={onDismiss}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
        {editing ? (
          <>
            <section className="space-y-3">
              <div className="text-sm font-medium text-fg-primary">
                Edit automation
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-question">Question</Label>
                <textarea
                  id="edit-question"
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus-visible:outline-2 focus-visible:outline-brand-500"
                />
              </div>
              <div className="space-y-1">
                <Label>Scope</Label>
                <ScopeChips
                  scope={scope}
                  onScopeChange={(patch) =>
                    setScope((s) => ({ ...s, ...patch }))
                  }
                />
              </div>
            </section>

            <section className="space-y-3">
              <div className="text-sm font-medium text-fg-primary">When</div>
              <AutomationScheduleFields
                schedule={schedule}
                onChange={setSchedule}
                timeId="edit-time"
              />
            </section>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-fg-primary text-fg-inverse hover:bg-fg-primary/90"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <section className="space-y-3">
            <div className="text-sm font-medium text-fg-primary">Definition</div>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-fg-tertiary">Question</dt>
                <dd className="mt-0.5 text-fg-primary">{a.question}</dd>
              </div>
              <div>
                <dt className="text-xs text-fg-tertiary">Scope</dt>
                <dd className="mt-0.5 text-fg-secondary">
                  {formatScopeLine(a.scope)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-fg-tertiary">Schedule</dt>
                <dd className="mt-0.5 text-fg-secondary">
                  {formatSchedule(a.schedule)}
                </dd>
              </div>
            </dl>
          </section>
        )}

        <section className="space-y-3">
          <div className="text-sm font-medium text-fg-primary">Run history</div>
          {a.runHistory.length === 0 ? (
            <p className="text-sm text-fg-tertiary">
              No runs yet — use Run now or wait for the next scheduled run.
            </p>
          ) : (
            <ul className="divide-y divide-border-default rounded-lg border border-border-default">
              {a.runHistory.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => onOpenRun(r.id)}
                    className="flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-surface-muted"
                  >
                    {!r.viewedAt ? (
                      <span
                        className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-600"
                        aria-label="Unread"
                      />
                    ) : (
                      <span className="mt-1.5 size-2 shrink-0" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-fg-tertiary">
                          {new Date(r.at).toLocaleString()}
                        </span>
                        <Badge
                          variant={
                            r.status === "failed" ? "destructive" : "secondary"
                          }
                        >
                          {r.status === "failed" ? "Failed" : "Succeeded"}
                        </Badge>
                        <span className="text-xs text-fg-tertiary">
                          {relativeTime(r.at)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-fg-primary">
                        {r.summary}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
