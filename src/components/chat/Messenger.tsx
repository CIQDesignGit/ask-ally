import { useCallback, useRef, useState } from "react";
import { Button } from "@ciq-dev/ciq-design-system";
import { ArrowUp, Square, X } from "lucide-react";

import { FollowupChips } from "@/components/answer/FollowupChips";
import { useAllyStore } from "@/store/ally-store";
import type { AttachmentMeta } from "@/types";

const DISCLAIMER =
  "Agent is currently trained to answer SKU level RCA only. AI can make mistakes. Please double-check responses.";

/** One-line ask box with follow-ups above and disclaimer below. */
export function Messenger() {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<AttachmentMeta[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitMessage = useAllyStore((s) => s.submitMessage);
  const stopGeneration = useAllyStore((s) => s.stopGeneration);
  const isRunning = useAllyStore((s) => s.isRunning);
  const thread = useAllyStore((s) => s.getActiveThread());

  const lastAllyWithFollowups = !isRunning
    ? thread?.turns.findLast(
        (t) =>
          t.role === "ally" &&
          Boolean(t.answer?.followups?.length) &&
          (!t.thinking || t.thinking.done),
      )
    : undefined;
  const followups = lastAllyWithFollowups?.answer?.followups ?? [];

  const canSend = value.trim().length > 0 || files.length > 0;

  const onSubmit = useCallback(() => {
    if (isRunning) {
      stopGeneration();
      return;
    }
    const text = value.trim();
    if (!text && files.length === 0) return;

    const hasFile = files.length > 0;
    void submitMessage(text || "Check MAP pricing against my policy file", {
      attachments: files.length ? files : undefined,
      explicitFixtureId: hasFile ? "map-violations" : undefined,
    });
    setValue("");
    setFiles([]);
  }, [value, files, isRunning, submitMessage, stopGeneration]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files);
    setFiles(
      list.map((f) => ({
        name: f.name,
        sizeKb: Math.max(1, Math.round(f.size / 1024)),
      })),
    );
  };

  return (
    <div
      className="bg-surface px-3 pt-2 pb-2"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="mx-auto w-full max-w-[820px] space-y-2.5">
        {followups.length > 0 ? (
          <FollowupChips
            followups={followups}
            disabled={isRunning}
            onSelect={(label, nextTurnId) =>
              void submitMessage(label, { explicitFixtureId: nextTurnId })
            }
          />
        ) : null}

        {files.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {files.map((f) => (
              <span
                key={f.name}
                className="inline-flex items-center gap-1 rounded-lg border border-border-default bg-surface-muted px-2 py-1 text-xs"
              >
                {f.name}
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  className="rounded p-0.5 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
                  onClick={() =>
                    setFiles((prev) => prev.filter((x) => x.name !== f.name))
                  }
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <form
          className="flex h-12 items-center gap-2 rounded-full border border-border-default bg-surface py-1.5 pr-1.5 pl-4 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask Ally about gap to plan, Buy Box, promos…"
            disabled={isRunning}
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-fg-primary outline-none placeholder:text-fg-tertiary disabled:opacity-60"
            aria-label="Message Ally"
          />
          <Button
            type="submit"
            size="icon"
            aria-label={isRunning ? "Stop generating" : "Send"}
            disabled={!isRunning && !canSend}
            className="size-9 shrink-0 rounded-full bg-action-primary text-action-primary-fg shadow-none hover:bg-action-primary-hover disabled:opacity-40 [&_svg]:size-4"
          >
            {isRunning ? (
              <Square className="size-3.5 fill-current" />
            ) : (
              <ArrowUp />
            )}
          </Button>
        </form>

        <p className="text-center text-[11px] leading-relaxed text-fg-tertiary">
          {DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
