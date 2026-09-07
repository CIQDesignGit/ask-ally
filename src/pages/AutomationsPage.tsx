import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, ConfirmationModal, cn } from "@ciq-dev/ciq-design-system";
import { Plus } from "lucide-react";

import { AutomationCreatePanel } from "@/components/automations/AutomationCreatePanel";
import { AutomationDetailPanel } from "@/components/automations/AutomationDetailPanel";
import {
  AutomationEmptyState,
  type AutomationTemplate,
} from "@/components/automations/AutomationEmptyState";
import { AutomationList } from "@/components/automations/AutomationList";
import { AutomationRunReport } from "@/components/automations/AutomationRunReport";
import { sortAutomations } from "@/lib/automation-utils";
import { prefersReducedMotion } from "@/lib/utils";
import { useAllyStore } from "@/store/ally-store";

type PanelView =
  | { kind: "create" }
  | { kind: "detail"; automationId: string }
  | { kind: "run"; automationId: string; runId: string };

const PANEL_MS = 280;
/** Fixed detail pane width so open/close animates cleanly */
const DETAIL_W = "min(100%, 28rem)";

export function AutomationsPage() {
  const automations = useAllyStore((s) => s.automations);
  const pauseAutomation = useAllyStore((s) => s.pauseAutomation);
  const resumeAutomation = useAllyStore((s) => s.resumeAutomation);
  const duplicateAutomation = useAllyStore((s) => s.duplicateAutomation);
  const deleteAutomation = useAllyStore((s) => s.deleteAutomation);
  const createAutomation = useAllyStore((s) => s.createAutomation);
  const runAutomationNow = useAllyStore((s) => s.runAutomationNow);
  const updateAutomation = useAllyStore((s) => s.updateAutomation);
  const markRunViewed = useAllyStore((s) => s.markRunViewed);

  const sorted = useMemo(() => sortAutomations(automations), [automations]);

  const [panel, setPanel] = useState<PanelView | null>(null);
  const [panelEntered, setPanelEntered] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);
  const panelWasOpen = useRef(false);

  useEffect(() => {
    const runSeed = () => {
      useAllyStore.getState().seedDemoAutomationsIfNeeded();
    };
    if (useAllyStore.persist.hasHydrated()) {
      runSeed();
    }
    return useAllyStore.persist.onFinishHydration(runSeed);
  }, []);

  useEffect(() => {
    if (!panel) {
      setPanelEntered(false);
      panelWasOpen.current = false;
      return;
    }
    if (panelWasOpen.current) {
      setPanelEntered(true);
      return;
    }
    panelWasOpen.current = true;
    if (prefersReducedMotion()) {
      setPanelEntered(true);
      return;
    }
    setPanelEntered(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPanelEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [panel]);

  useEffect(() => {
    if (!panel || panel.kind === "create") return;
    if (!automations.some((a) => a.id === panel.automationId)) {
      setPanel(null);
      setPanelEntered(false);
    }
  }, [automations, panel]);

  const openPanel = useCallback((next: PanelView) => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setPanel(next);
  }, []);

  const dismissPanel = useCallback(() => {
    if (!panel) return;
    if (prefersReducedMotion()) {
      setPanel(null);
      setPanelEntered(false);
      return;
    }
    setPanelEntered(false);
    closeTimer.current = window.setTimeout(() => {
      setPanel(null);
      closeTimer.current = null;
    }, PANEL_MS);
  }, [panel]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissPanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, dismissPanel]);

  const selectedId =
    panel && panel.kind !== "create" ? panel.automationId : null;

  const selectedAutomation = selectedId
    ? automations.find((a) => a.id === selectedId)
    : undefined;

  const selectedRun =
    panel?.kind === "run" && selectedAutomation
      ? selectedAutomation.runHistory.find((r) => r.id === panel.runId)
      : undefined;

  const handleSelect = (id: string) => {
    openPanel({ kind: "detail", automationId: id });
  };

  const handleCreated = (id: string) => {
    openPanel({ kind: "detail", automationId: id });
  };

  const handleUseTemplate = (template: AutomationTemplate) => {
    const id = createAutomation(template.toCreateInput());
    runAutomationNow(id);
    openPanel({ kind: "detail", automationId: id });
  };

  const handleDuplicate = () => {
    if (!selectedId) return;
    const copyId = duplicateAutomation(selectedId);
    if (copyId) openPanel({ kind: "detail", automationId: copyId });
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteAutomation(deleteId);
    setDeleteId(null);
    dismissPanel();
  };

  const handleMarkViewed = useCallback(() => {
    if (panel?.kind !== "run") return;
    markRunViewed(panel.automationId, panel.runId);
  }, [panel, markRunViewed]);

  const panelOpen = Boolean(panel) && panelEntered;
  const showDetailChrome = Boolean(panel);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-default bg-surface px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-fg-primary">Automations</h1>
          <p className="text-sm text-fg-secondary">
            Recurring analyses Ally runs for you — reports land here even when
            you’re away.
          </p>
        </div>
        <Button size="sm" onClick={() => openPanel({ kind: "create" })}>
          <Plus className="size-4" aria-hidden />
          New automation
        </Button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Master list — always visible & interactive */}
        <div
          className={cn(
            "min-w-0 flex-1 overflow-y-auto transition-[flex-basis] ease-out",
            showDetailChrome && "border-r border-border-default"
          )}
          style={{ transitionDuration: `${PANEL_MS}ms` }}
        >
          {sorted.length === 0 ? (
            <AutomationEmptyState
              onStartFromScratch={() => openPanel({ kind: "create" })}
              onUseTemplate={handleUseTemplate}
            />
          ) : (
            <div
              className={cn(
                "px-6 py-4",
                showDetailChrome ? "max-w-none" : "mx-auto w-full max-w-3xl"
              )}
            >
              <div className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-tertiary">
                {sorted.length} automation{sorted.length === 1 ? "" : "s"}
              </div>
              <div className="overflow-hidden rounded-xl border border-border-default bg-surface">
                <AutomationList
                  automations={sorted}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                />
              </div>
            </div>
          )}
        </div>

        {/* Detail pane — grows beside the list, no scrim */}
        <aside
          aria-label={
            panel?.kind === "create"
              ? "Create automation"
              : "Automation details"
          }
          className={cn(
            "flex h-full shrink-0 flex-col overflow-hidden bg-surface transition-[width] ease-out",
            showDetailChrome ? "border-l border-border-default" : "border-0"
          )}
          style={{
            width: panelOpen ? DETAIL_W : 0,
            transitionDuration: `${PANEL_MS}ms`,
          }}
        >
          <div
            className="flex h-full min-h-0 w-full flex-col"
            style={{ width: "28rem", maxWidth: "100%" }}
          >
            {panel?.kind === "create" ? (
              <AutomationCreatePanel
                onCancel={dismissPanel}
                onCreated={handleCreated}
              />
            ) : panel?.kind === "run" &&
              selectedAutomation &&
              selectedRun ? (
              <AutomationRunReport
                automation={selectedAutomation}
                run={selectedRun}
                onBack={() =>
                  openPanel({
                    kind: "detail",
                    automationId: selectedAutomation.id,
                  })
                }
                onDismiss={dismissPanel}
                onMarkViewed={handleMarkViewed}
                onRetry={
                  selectedRun.status === "failed"
                    ? () => runAutomationNow(selectedAutomation.id)
                    : undefined
                }
              />
            ) : selectedAutomation ? (
              <AutomationDetailPanel
                automation={selectedAutomation}
                onDismiss={dismissPanel}
                onPause={() => pauseAutomation(selectedAutomation.id)}
                onResume={() => resumeAutomation(selectedAutomation.id)}
                onRunNow={() => runAutomationNow(selectedAutomation.id)}
                onDuplicate={handleDuplicate}
                onDelete={() => setDeleteId(selectedAutomation.id)}
                onSave={(patch) =>
                  updateAutomation(selectedAutomation.id, patch)
                }
                onOpenRun={(runId) =>
                  openPanel({
                    kind: "run",
                    automationId: selectedAutomation.id,
                    runId,
                  })
                }
              />
            ) : null}
          </div>
        </aside>
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Delete automation?"
        message="Deletes the automation and all run reports. This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
