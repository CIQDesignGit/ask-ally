import { useCallback, useRef, useState } from "react";
import {
  Button,
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTrailing,
} from "@ciq-dev/ciq-design-system";
import { ArrowUp, Paperclip, Square, X } from "lucide-react";

import { ScopeChips } from "@/components/chat/ScopeChips";
import { useAllyStore } from "@/store/ally-store";
import type { AttachmentMeta } from "@/types";

/**
 * Scoped ask box — local composite until CIQ PromptInput `scoped` variant ships.
 * See docs/CIQ_DS_CHANGELOG.md
 */
export function Messenger() {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<AttachmentMeta[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const submitMessage = useAllyStore((s) => s.submitMessage);
  const stopGeneration = useAllyStore((s) => s.stopGeneration);
  const isRunning = useAllyStore((s) => s.isRunning);

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
      }))
    );
  };

  return (
    <div
      className="bg-surface px-3 py-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="mx-auto w-full max-w-[820px] space-y-2">
        {files.length > 0 && (
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
        )}

        {/* Local "scoped" shell: chips + compact PromptInput */}
        <div className="rounded-xl border border-border-default bg-surface p-2.5 shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-emerald-200)_40%,transparent),0_4px_24px_-4px_color-mix(in_srgb,var(--color-brand-400)_28%,transparent)]">
          <PromptInput
            variant="compact"
            value={value}
            onValueChange={setValue}
            onSubmit={onSubmit}
            isLoading={isRunning}
            className="border-0 shadow-none"
          >
            <PromptInputTextarea placeholder="Ask Ally about gap to plan, Buy Box, promos…" />
            <PromptInputTrailing>
              <PromptInputSubmit
                aria-label={isRunning ? "Stop generating" : "Send"}
                onClick={
                  isRunning
                    ? (e) => {
                        e.preventDefault();
                        stopGeneration();
                      }
                    : undefined
                }
              >
                {isRunning ? (
                  <Square className="size-3.5 fill-current" />
                ) : (
                  <ArrowUp />
                )}
              </PromptInputSubmit>
            </PromptInputTrailing>
          </PromptInput>
          <ScopeChips
            className="mt-2"
            leading={
              <>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => {
                    const list = Array.from(e.target.files ?? []);
                    setFiles(
                      list.map((f) => ({
                        name: f.name,
                        sizeKb: Math.max(1, Math.round(f.size / 1024)),
                      }))
                    );
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 rounded-lg shadow-none"
                  aria-label="Attach file"
                  onClick={() => fileRef.current?.click()}
                >
                  <Paperclip className="size-4" />
                </Button>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
