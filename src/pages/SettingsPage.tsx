import { useState } from "react";
import {
  Button,
  EmptyState,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@ciq-dev/ciq-design-system";

import { answerTableCellClass, answerTableHeadClass } from "@/components/answer/table-chrome";
import { useAllyStore } from "@/store/ally-store";

export function SettingsPage() {
  const preferences = useAllyStore((s) => s.preferences);
  const updatePreference = useAllyStore((s) => s.updatePreference);
  const clearPreference = useAllyStore((s) => s.clearPreference);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto p-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-fg-primary">
          Known preferences
        </h1>
        <p className="text-sm text-fg-secondary">
          Assumptions you corrected in chat become defaults here — never an
          invisible black box.
        </p>
      </div>

      {preferences.length === 0 ? (
        <EmptyState
          title="No saved preferences yet"
          description="When you correct an assumption chip in chat, it will appear here with source attribution."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border-default bg-surface p-4">
          <Table>
            <TableHeader className="border-border-default [&_tr]:border-border-default">
              <TableRow className="border-border-default hover:bg-transparent">
                <TableHead className={cn(answerTableHeadClass, "text-left")}>
                  Preference
                </TableHead>
                <TableHead className={cn(answerTableHeadClass, "text-left")}>
                  Value
                </TableHead>
                <TableHead className={cn(answerTableHeadClass, "text-left")}>
                  Source
                </TableHead>
                <TableHead className={cn(answerTableHeadClass, "text-right")}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr]:border-border-default">
              {preferences.map((p) => (
                <TableRow key={p.id} className="border-border-default">
                  <TableCell className={cn(answerTableCellClass, "font-medium")}>
                    {p.label}
                  </TableCell>
                  <TableCell className={answerTableCellClass}>
                    {editingId === p.id ? (
                      <Input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      p.value
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      answerTableCellClass,
                      "text-xs text-fg-tertiary"
                    )}
                  >
                    {p.source}
                  </TableCell>
                  <TableCell
                    className={cn(answerTableCellClass, "text-right")}
                  >
                    {editingId === p.id ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          onClick={() => {
                            updatePreference(p.id, draft);
                            setEditingId(null);
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(p.id);
                            setDraft(p.value);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => clearPreference(p.id)}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
