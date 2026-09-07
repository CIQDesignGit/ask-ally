import { useMemo } from "react";

import { useAllyStore } from "@/store/ally-store";

/** Prefer the question portion of "question · period" titles. */
function displayTitle(title: string): string {
  const sep = title.indexOf(" · ");
  return sep === -1 ? title : title.slice(0, sep);
}

export function HistoryRail() {
  const threads = useAllyStore((s) => s.threads);
  const activeThreadId = useAllyStore((s) => s.activeThreadId);
  const selectThread = useAllyStore((s) => s.selectThread);

  const sorted = useMemo(
    () =>
      [...threads].sort((a, b) =>
        a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0
      ),
    [threads]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-3 pt-4 pb-2">
        <span className="type-caption-strong uppercase tracking-wide text-fg-tertiary">
          History
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {sorted.length === 0 && (
          <p className="px-2 py-6 text-center type-caption text-fg-tertiary">
            Conversations you start will show up here.
          </p>
        )}

        <ul className="flex flex-col gap-1">
          {sorted.map((t) => {
            const isActive = t.id === activeThreadId;

            return (
              <li key={t.id}>
                <button
                  type="button"
                      className={`w-full truncate rounded-md py-2 pr-2.5 text-left type-body transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 ${
                    isActive
                      ? "text-fg-primary"
                      : "text-fg-secondary hover:text-fg-primary"
                  }`}
                  onClick={() => selectThread(t.id)}
                  title={t.title}
                >
                  {displayTitle(t.title)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
