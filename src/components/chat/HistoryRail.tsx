import { useMemo } from "react";
import { Button } from "@ciq-dev/ciq-design-system";
import { Plus, RefreshCw, Trash2 } from "lucide-react";

import { startOfIsoWeek } from "@/lib/utils";
import { useAllyStore } from "@/store/ally-store";

export function HistoryRail() {
  const threads = useAllyStore((s) => s.threads);
  const activeThreadId = useAllyStore((s) => s.activeThreadId);
  const selectThread = useAllyStore((s) => s.selectThread);
  const newThread = useAllyStore((s) => s.newThread);
  const clearHistory = useAllyStore((s) => s.clearHistory);
  const rerunThread = useAllyStore((s) => s.rerunThread);

  // Ask once before wiping — hard to undo once localStorage is updated
  const handleClearHistory = () => {
    if (threads.length === 0) return;
    const ok = window.confirm(
      "Clear all conversation history? This cannot be undone."
    );
    if (ok) clearHistory();
  };

  const grouped = useMemo(() => {
    const map = new Map<string, typeof threads>();
    for (const t of threads) {
      const key = startOfIsoWeek(new Date(t.createdAt));
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [threads]);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border-default bg-surface-subtle">
      <div className="flex items-center justify-between border-b border-border-default px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-tertiary">
          History
        </span>
        <Button
          size="sm"
          variant="ghost"
          aria-label="New thread"
          onClick={newThread}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {grouped.length === 0 && (
          <p className="px-2 py-4 text-xs text-fg-tertiary">
            Conversations you start will show up here, grouped by week.
          </p>
        )}
        {grouped.map(([week, list]) => (
          <div key={week} className="mb-3">
            <div className="px-2 py-1 text-xs font-medium text-fg-tertiary">
              Week of {week}
            </div>
            <ul className="space-y-0.5">
              {list.map((t) => (
                <li key={t.id}>
                  <div
                    className={`group flex items-start gap-1 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                      t.id === activeThreadId
                        ? "bg-brand-50 text-brand-800"
                        : "hover:bg-surface-muted"
                    }`}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
                      onClick={() => selectThread(t.id)}
                    >
                      <div className="truncate font-medium">{t.title}</div>
                      <div className="truncate text-xs text-fg-tertiary">
                        {t.scope.period.label}
                      </div>
                    </button>
                    <button
                      type="button"
                      title="Re-run for current period"
                      aria-label="Re-run for current period"
                      className="rounded p-1 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
                      onClick={() => void rerunThread(t.id)}
                    >
                      <RefreshCw className="size-3.5 text-fg-secondary" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Sticky footer action — temporary until we have per-thread delete */}
      <div className="border-t border-border-default p-2">
        <Button
          size="sm"
          variant="ghost"
          className="w-full justify-start gap-2 text-fg-secondary hover:text-red-600"
          disabled={threads.length === 0}
          onClick={handleClearHistory}
        >
          <Trash2 className="size-3.5 shrink-0" />
          Clear history
        </Button>
      </div>
    </aside>
  );
}
