import { useState } from "react";
import {
  Badge,
  Button,
  ConfirmationModal,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@ciq-dev/ciq-design-system";

import {
  answerTableCellClass,
  answerTableHeadClass,
} from "@/components/answer/table-chrome";
import { useAllyStore } from "@/store/ally-store";
import type { Automation } from "@/types";

export function AutomationsPage() {
  const automations = useAllyStore((s) => s.automations);
  const pauseAutomation = useAllyStore((s) => s.pauseAutomation);
  const resumeAutomation = useAllyStore((s) => s.resumeAutomation);
  const duplicateAutomation = useAllyStore((s) => s.duplicateAutomation);
  const deleteAutomation = useAllyStore((s) => s.deleteAutomation);
  const runAutomationNow = useAllyStore((s) => s.runAutomationNow);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="mx-auto h-full max-w-5xl overflow-y-auto p-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-fg-primary">Automations</h1>
        <p className="text-sm text-fg-secondary">
          Recurring checks Ally runs for you — pause, edit, or run now.
        </p>
      </div>

      {automations.length === 0 ? (
        <EmptyState
          title="No Autopilots yet"
          description="Create one from chat — ask Ally to alert you, or use an Automate action on any answer."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border-default bg-surface p-4">
          <Table>
            <TableHeader className="border-border-default [&_tr]:border-border-default">
              <TableRow className="border-border-default hover:bg-transparent">
                <TableHead className={cn(answerTableHeadClass, "text-left")}>
                  Name
                </TableHead>
                <TableHead className={cn(answerTableHeadClass, "text-left")}>
                  Schedule
                </TableHead>
                <TableHead className={cn(answerTableHeadClass, "text-left")}>
                  Status
                </TableHead>
                <TableHead className={cn(answerTableHeadClass, "text-left")}>
                  Last run
                </TableHead>
                <TableHead className={cn(answerTableHeadClass, "text-right")}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr]:border-border-default">
              {automations.map((a) => (
                <AutomationRow
                  key={a.id}
                  automation={a}
                  expanded={expandedId === a.id}
                  onToggleHistory={() =>
                    setExpandedId((id) => (id === a.id ? null : a.id))
                  }
                  onPause={() => pauseAutomation(a.id)}
                  onResume={() => resumeAutomation(a.id)}
                  onDuplicate={() => duplicateAutomation(a.id)}
                  onDelete={() => setDeleteId(a.id)}
                  onRunNow={() => runAutomationNow(a.id)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Delete automation?"
        message="This cannot be undone. Run history will be removed."
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={() => {
          if (deleteId) deleteAutomation(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}

function AutomationRow({
  automation: a,
  expanded,
  onToggleHistory,
  onPause,
  onResume,
  onDuplicate,
  onDelete,
  onRunNow,
}: {
  automation: Automation;
  expanded: boolean;
  onToggleHistory: () => void;
  onPause: () => void;
  onResume: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRunNow: () => void;
}) {
  const statusVariant =
    a.status === "active" ? "default" : ("secondary" as const);
  const runColor =
    a.lastRun?.result === "found"
      ? "destructive"
      : a.lastRun?.result === "failed"
        ? "destructive"
        : "secondary";

  return (
    <>
      <TableRow className="border-border-default">
        <TableCell className={answerTableCellClass}>
          <div className="font-medium">{a.name}</div>
          <div className="text-xs text-fg-tertiary">
            {a.scope.taxonomyPath.join(" › ")} · {a.threshold}
          </div>
        </TableCell>
        <TableCell className={cn(answerTableCellClass, "text-sm")}>
          {a.schedule.freq} · {a.schedule.time}
        </TableCell>
        <TableCell className={answerTableCellClass}>
          <Badge variant={statusVariant}>{a.status}</Badge>
        </TableCell>
        <TableCell className={answerTableCellClass}>
          {a.lastRun ? (
            <div className="space-y-1">
              <Badge variant={runColor}>{a.lastRun.result}</Badge>
              <div className="text-xs text-fg-tertiary">
                {new Date(a.lastRun.at).toLocaleString()}
              </div>
            </div>
          ) : (
            <span className="text-xs text-fg-tertiary">Never</span>
          )}
        </TableCell>
        <TableCell className={cn(answerTableCellClass, "text-right")}>
          <div className="flex flex-wrap justify-end gap-1">
            <Button size="sm" variant="outline" onClick={onRunNow}>
              Run now
            </Button>
            {a.status === "active" ? (
              <Button size="sm" variant="ghost" onClick={onPause}>
                Pause
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={onResume}>
                Resume
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onDuplicate}>
              Duplicate
            </Button>
            <Button size="sm" variant="ghost" onClick={onToggleHistory}>
              History
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={5} className="bg-surface-muted/50">
            <div className="text-xs font-medium text-fg-secondary">
              Run history
            </div>
            {a.runHistory.length === 0 ? (
              <p className="mt-1 text-xs text-fg-tertiary">No runs yet.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {a.runHistory.map((r) => (
                  <li key={r.at} className="text-xs text-fg-secondary">
                    {new Date(r.at).toLocaleString()} —{" "}
                    <strong>{r.result}</strong>: {r.summary}
                  </li>
                ))}
              </ul>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
