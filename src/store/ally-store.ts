import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createAbortController, runAgentTurn, uid } from "@/agent/runner";
import {
  currentPeriodScope,
  defaultScope,
  getFixtureById,
} from "@/fixtures";
import { buildDemoAutomations } from "@/fixtures/automation-seed";
import {
  buildSucceededRun,
  computeNextRunAt,
  normalizeAutomation,
} from "@/lib/automation-utils";
import { matchFixture } from "@/lib/match-intent";
import { autoTitle } from "@/lib/utils";
import type {
  AnswerPayload,
  AttachmentMeta,
  Automation,
  AutomationCreateInput,
  AutomationDraft,
  FixtureEntry,
  KnownPreference,
  ScopeContext,
  ThinkingStep,
  Thread,
  Turn,
} from "@/types";

interface AllyState {
  scope: ScopeContext;
  threads: Thread[];
  activeThreadId: string | null;
  breadcrumb: string[];
  preferences: KnownPreference[];
  automations: Automation[];
  isRunning: boolean;
  dashboardFromThreadId: string | null;
  /** In-progress abort for stop button */
  abortController: AbortController | null;

  setScope: (patch: Partial<ScopeContext>) => void;
  newThread: () => void;
  /** Wipe all saved conversations from the history rail (and persist). */
  clearHistory: () => void;
  selectThread: (id: string) => void;
  jumpBreadcrumb: (index: number) => void;

  submitMessage: (
    text: string,
    opts?: {
      attachments?: AttachmentMeta[];
      explicitFixtureId?: string;
    }
  ) => Promise<void>;
  stopGeneration: () => void;

  setFeedback: (
    turnId: string,
    feedback: Turn["feedback"]
  ) => void;
  regenerateTurn: (turnId: string) => Promise<void>;
  correctTurn: (turnId: string, correction: string) => Promise<void>;

  addPreferenceFromAssumption: (label: string, value: string) => void;
  updatePreference: (id: string, value: string) => void;
  clearPreference: (id: string) => void;

  activateAutomation: (draft: AutomationDraft, threadId: string) => void;
  createAutomation: (input: AutomationCreateInput) => string;
  pauseAutomation: (id: string) => void;
  resumeAutomation: (id: string) => void;
  duplicateAutomation: (id: string) => string | null;
  deleteAutomation: (id: string) => void;
  runAutomationNow: (id: string) => void;
  updateAutomation: (id: string, patch: Partial<Automation>) => void;
  markRunViewed: (automationId: string, runId: string) => void;
  /** One-time demo seed when hub is empty (persists a local flag) */
  seedDemoAutomationsIfNeeded: () => void;

  rerunThread: (threadId: string) => Promise<void>;
  openDashboard: (threadId: string) => void;
  closeDashboard: () => void;

  getActiveThread: () => Thread | null;
}

function ensureThread(
  state: AllyState,
  firstQuestion: string
): { threads: Thread[]; threadId: string } {
  if (state.activeThreadId) {
    const existing = state.threads.find((t) => t.id === state.activeThreadId);
    if (existing) return { threads: state.threads, threadId: existing.id };
  }

  const id = uid("thread");
  const now = new Date().toISOString();
  const thread: Thread = {
    id,
    title: autoTitle(firstQuestion, state.scope.period.label),
    createdAt: now,
    updatedAt: now,
    scope: { ...state.scope },
    turns: [],
    breadcrumb: ["Portfolio"],
  };
  return { threads: [thread, ...state.threads], threadId: id };
}

function patchThread(
  threads: Thread[],
  threadId: string,
  updater: (t: Thread) => Thread
): Thread[] {
  return threads.map((t) => (t.id === threadId ? updater(t) : t));
}

function applyFixtureScope(
  scope: ScopeContext,
  fixture: FixtureEntry
): ScopeContext {
  if (!fixture.scopePatch) return scope;
  return {
    ...scope,
    ...fixture.scopePatch,
    period: fixture.scopePatch.period ?? scope.period,
    taxonomyPath:
      fixture.scopePatch.taxonomyPath ?? scope.taxonomyPath,
  };
}

/** A gap-to-plan report is only renderable if it carries the verdict block. */
function stripLegacyGapReport(thread: unknown): unknown {
  if (!thread || typeof thread !== "object") return thread;
  const t = thread as { turns?: unknown };
  if (!Array.isArray(t.turns)) return thread;

  return {
    ...t,
    turns: t.turns.map((turn) => {
      const answer = (turn as { answer?: Record<string, unknown> })?.answer;
      const report = answer?.gapToPlanReport as Record<string, unknown> | undefined;
      if (!report || "verdict" in report) return turn;

      const { gapToPlanReport: _legacy, ...rest } = answer!;
      return { ...(turn as object), answer: rest };
    }),
  };
}

export const useAllyStore = create<AllyState>()(
  persist(
    (set, get) => ({
      scope: defaultScope,
      threads: [],
      activeThreadId: null,
      breadcrumb: ["Portfolio"],
      preferences: [],
      automations: [],
      isRunning: false,
      dashboardFromThreadId: null,
      abortController: null,

      getActiveThread: () => {
        const { activeThreadId, threads } = get();
        return threads.find((t) => t.id === activeThreadId) ?? null;
      },

      setScope: (patch) =>
        set((s) => ({ scope: { ...s.scope, ...patch } })),

      newThread: () =>
        set({
          activeThreadId: null,
          breadcrumb: ["Portfolio"],
          scope: { ...defaultScope },
        }),

      clearHistory: () => {
        // Stop any in-flight answer so we don't write into a deleted thread
        get().abortController?.abort();
        set({
          threads: [],
          activeThreadId: null,
          breadcrumb: ["Portfolio"],
          scope: { ...defaultScope },
          isRunning: false,
          abortController: null,
          dashboardFromThreadId: null,
        });
      },

      selectThread: (id) => {
        const thread = get().threads.find((t) => t.id === id);
        if (!thread) return;
        set({
          activeThreadId: id,
          scope: { ...thread.scope },
          breadcrumb: thread.breadcrumb ?? ["Portfolio"],
        });
      },

      jumpBreadcrumb: (index) => {
        const crumbs = get().breadcrumb.slice(0, index + 1);
        set({ breadcrumb: crumbs });
      },

      stopGeneration: () => {
        get().abortController?.abort();
        set({ isRunning: false, abortController: null });
      },

      submitMessage: async (text, opts) => {
        const trimmed = text.trim();
        if (!trimmed && !opts?.attachments?.length) return;
        if (get().isRunning) return;

        const controller = createAbortController();
        const { threads, threadId } = ensureThread(get(), trimmed || "File upload");
        const now = new Date().toISOString();

        const userTurn: Turn = {
          id: uid("turn"),
          role: "user",
          createdAt: now,
          input: trimmed,
          attachments: opts?.attachments,
        };

        const allyTurnId = uid("turn");
        const allyTurn: Turn = {
          id: allyTurnId,
          role: "ally",
          createdAt: now,
          thinking: { steps: [], done: false },
        };

        set({
          threads: patchThread(threads, threadId, (t) => ({
            ...t,
            updatedAt: now,
            turns: [...t.turns, userTurn, allyTurn],
          })),
          activeThreadId: threadId,
          isRunning: true,
          abortController: controller,
        });

        await runAgentTurn(trimmed, {
          explicitFixtureId: opts?.explicitFixtureId,
          callbacks: {
            signal: controller.signal,
            onThinkingStart: (steps) => {
              set((s) => ({
                threads: patchThread(s.threads, threadId, (t) => ({
                  ...t,
                  turns: t.turns.map((turn) =>
                    turn.id === allyTurnId
                      ? { ...turn, thinking: { steps, done: false } }
                      : turn
                  ),
                })),
              }));
            },
            onThinkingStep: (stepId, status) => {
              set((s) => ({
                threads: patchThread(s.threads, threadId, (t) => ({
                  ...t,
                  turns: t.turns.map((turn) => {
                    if (turn.id !== allyTurnId || !turn.thinking) return turn;
                    return {
                      ...turn,
                      thinking: {
                        ...turn.thinking,
                        steps: turn.thinking.steps.map((st: ThinkingStep) =>
                          st.id === stepId ? { ...st, status } : st
                        ),
                      },
                    };
                  }),
                })),
              }));
            },
            onThinkingDone: () => {
              set((s) => ({
                threads: patchThread(s.threads, threadId, (t) => ({
                  ...t,
                  turns: t.turns.map((turn) =>
                    turn.id === allyTurnId && turn.thinking
                      ? {
                          ...turn,
                          thinking: { ...turn.thinking, done: true },
                        }
                      : turn
                  ),
                })),
              }));
            },
            onDisambiguation: (question, options) => {
              set((s) => ({
                threads: patchThread(s.threads, threadId, (t) => ({
                  ...t,
                  turns: t.turns.map((turn) =>
                    turn.id === allyTurnId
                      ? {
                          ...turn,
                          thinking: undefined,
                          disambiguation: { question, options },
                        }
                      : turn
                  ),
                })),
                isRunning: false,
                abortController: null,
              }));
            },
            onAnswerReady: (answer: AnswerPayload, fixture: FixtureEntry) => {
              const nextScope = applyFixtureScope(get().scope, fixture);
              const crumbs = [
                ...(get().breadcrumb.length ? get().breadcrumb : ["Portfolio"]),
                ...(fixture.breadcrumbAppend ?? []),
              ];
              // de-dupe consecutive
              const breadcrumb = crumbs.filter(
                (c, i) => i === 0 || c !== crumbs[i - 1]
              );

              if (nextScope.stale) {
                // keep stale on scope for banner
              }

              set((s) => ({
                scope: nextScope,
                breadcrumb,
                threads: patchThread(s.threads, threadId, (t) => ({
                  ...t,
                  scope: nextScope,
                  breadcrumb,
                  updatedAt: new Date().toISOString(),
                  turns: t.turns.map((turn) =>
                    turn.id === allyTurnId
                      ? {
                          ...turn,
                          answer,
                        }
                      : turn
                  ),
                })),
                isRunning: false,
                abortController: null,
              }));
            },
            onError: () => {
              set({ isRunning: false, abortController: null });
            },
          },
        });
      },

      setFeedback: (turnId, feedback) => {
        const threadId = get().activeThreadId;
        if (!threadId) return;
        set((s) => ({
          threads: patchThread(s.threads, threadId, (t) => ({
            ...t,
            turns: t.turns.map((turn) =>
              turn.id === turnId ? { ...turn, feedback } : turn
            ),
          })),
        }));
      },

      regenerateTurn: async (turnId) => {
        const thread = get().getActiveThread();
        if (!thread) return;
        const idx = thread.turns.findIndex((t) => t.id === turnId);
        if (idx < 0) return;
        // Find preceding user turn
        let userInput = "";
        for (let i = idx - 1; i >= 0; i--) {
          if (thread.turns[i].role === "user" && thread.turns[i].input) {
            userInput = thread.turns[i].input!;
            break;
          }
        }
        if (!userInput) return;

        // Drop the ally turn and re-submit
        set((s) => ({
          threads: patchThread(s.threads, thread.id, (t) => ({
            ...t,
            turns: t.turns.filter((turn) => turn.id !== turnId),
          })),
        }));
        await get().submitMessage(userInput);
      },

      correctTurn: async (_turnId, correction) => {
        await get().submitMessage(correction);
      },

      addPreferenceFromAssumption: (label, value) => {
        const pref: KnownPreference = {
          id: uid("pref"),
          label,
          value,
          source: `Set from your correction on ${new Date().toLocaleDateString()}`,
          editable: true,
        };
        set((s) => ({ preferences: [pref, ...s.preferences] }));
      },

      updatePreference: (id, value) =>
        set((s) => ({
          preferences: s.preferences.map((p) =>
            p.id === id ? { ...p, value } : p
          ),
        })),

      clearPreference: (id) =>
        set((s) => ({
          preferences: s.preferences.filter((p) => p.id !== id),
        })),

      activateAutomation: (draft, threadId) => {
        const schedule = draft.schedule;
        const automation: Automation = {
          id: uid("auto"),
          name: draft.name,
          question: draft.checkDefinition,
          scope: { ...get().scope },
          schedule,
          status: "active",
          notifyInApp: draft.channels.includes("in_app"),
          nextRunAt: computeNextRunAt(schedule),
          runHistory: [],
          sourceThreadId: threadId,
          checkDefinition: draft.checkDefinition,
          threshold: draft.threshold,
          channels: draft.channels,
          recipients: draft.recipients,
          repeatPolicy: draft.repeatPolicy,
        };
        set((s) => ({ automations: [automation, ...s.automations] }));
      },

      createAutomation: (input) => {
        const id = uid("auto");
        const automation: Automation = {
          id,
          name: input.name.trim() || "Recurring analysis",
          question: input.question.trim(),
          scope: { ...input.scope },
          schedule: { ...input.schedule },
          status: "active",
          notifyInApp: input.notifyInApp ?? true,
          nextRunAt: computeNextRunAt(input.schedule),
          runHistory: [],
          sourceThreadId: input.sourceThreadId,
        };
        set((s) => ({ automations: [automation, ...s.automations] }));
        return id;
      },

      pauseAutomation: (id) =>
        set((s) => ({
          automations: s.automations.map((a) =>
            a.id === id
              ? { ...a, status: "paused", nextRunAt: undefined }
              : a
          ),
        })),

      resumeAutomation: (id) =>
        set((s) => ({
          automations: s.automations.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: "active",
                  nextRunAt: computeNextRunAt(a.schedule),
                }
              : a
          ),
        })),

      duplicateAutomation: (id) => {
        const src = get().automations.find((a) => a.id === id);
        if (!src) return null;
        const copyId = uid("auto");
        const copy: Automation = {
          ...src,
          id: copyId,
          name: `${src.name} (copy)`,
          status: "paused",
          runHistory: [],
          nextRunAt: undefined,
        };
        set((s) => ({ automations: [copy, ...s.automations] }));
        return copyId;
      },

      deleteAutomation: (id) =>
        set((s) => ({
          automations: s.automations.filter((a) => a.id !== id),
        })),

      updateAutomation: (id, patch) =>
        set((s) => ({
          automations: s.automations.map((a) => {
            if (a.id !== id) return a;
            const next = { ...a, ...patch };
            if (patch.schedule && next.status === "active") {
              next.nextRunAt = computeNextRunAt(next.schedule);
            }
            return next;
          }),
        })),

      markRunViewed: (automationId, runId) => {
        const viewedAt = new Date().toISOString();
        set((s) => ({
          automations: s.automations.map((a) =>
            a.id !== automationId
              ? a
              : {
                  ...a,
                  runHistory: a.runHistory.map((r) =>
                    r.id === runId && !r.viewedAt ? { ...r, viewedAt } : r
                  ),
                }
          ),
        }));
      },

      seedDemoAutomationsIfNeeded: () => {
        if (get().automations.length > 0) return;
        try {
          if (localStorage.getItem("ask-ally-auto-seed-v1")) return;
          localStorage.setItem("ask-ally-auto-seed-v1", "1");
        } catch {
          return;
        }
        set({ automations: buildDemoAutomations() });
      },

      runAutomationNow: (id) => {
        const auto = get().automations.find((a) => a.id === id);
        if (!auto) return;

        const fixture = matchFixture(auto.question);
        const answer: AnswerPayload = {
          ...fixture.answer,
          scopeLine:
            fixture.answer.scopeLine ??
            `${auto.scope.retailer} · automated report · ${auto.name}`,
        };
        const run = buildSucceededRun(answer, auto.name);
        const nextRunAt =
          auto.status === "active"
            ? computeNextRunAt(auto.schedule)
            : auto.nextRunAt;

        set((s) => ({
          automations: s.automations.map((a) =>
            a.id === id
              ? {
                  ...a,
                  runHistory: [run, ...a.runHistory],
                  nextRunAt,
                }
              : a
          ),
        }));
      },

      rerunThread: async (threadId) => {
        const thread = get().threads.find((t) => t.id === threadId);
        if (!thread) return;
        const firstUser = thread.turns.find((t) => t.role === "user" && t.input);
        if (!firstUser?.input) return;

        // Switch to current period fixture when re-running gap questions
        const currentFixture = getFixtureById("gap-to-plan-current");
        set({
          activeThreadId: threadId,
          scope: { ...currentPeriodScope },
        });
        await get().submitMessage(firstUser.input, {
          explicitFixtureId: currentFixture?.id,
        });
      },

      openDashboard: (threadId) => set({ dashboardFromThreadId: threadId }),
      closeDashboard: () => set({ dashboardFromThreadId: null }),
    }),
    {
      name: "ask-ally-store",
      version: 3,
      migrate: (persisted, version) => {
        let state = persisted as {
          automations?: unknown;
          threads?: unknown;
          [key: string]: unknown;
        };
        if (version < 2 && Array.isArray(state.automations)) {
          state = {
            ...state,
            automations: state.automations.map((a) =>
              normalizeAutomation(
                (a && typeof a === "object"
                  ? a
                  : {}) as Record<string, unknown>
              )
            ),
          };
        }
        // v3 reshaped the gap-to-plan report. Drop reports saved in the old
        // shape so stored turns fall back to their text answer instead of
        // rendering against fields that no longer exist.
        if (version < 3 && Array.isArray(state.threads)) {
          state = { ...state, threads: state.threads.map(stripLegacyGapReport) };
        }
        return state as typeof persisted;
      },
      partialize: (s) => ({
        threads: s.threads,
        preferences: s.preferences,
        automations: s.automations,
        scope: s.scope,
        activeThreadId: s.activeThreadId,
        breadcrumb: s.breadcrumb,
      }),
    }
  )
);
