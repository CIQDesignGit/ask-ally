/**
 * Scripted agent runner — the ONLY seam for a future real ACP/LLM call.
 * Pattern-matches input → fixture AnswerPayload → plays back through UI pipeline.
 */
import { matchFixture } from "@/lib/match-intent";
import { prefersReducedMotion, sleep, uid } from "@/lib/utils";
import type {
  AnswerPayload,
  FixtureEntry,
  ThinkingStep,
} from "@/types";

export interface RunnerCallbacks {
  onThinkingStart: (steps: ThinkingStep[]) => void;
  onThinkingStep: (stepId: string, status: ThinkingStep["status"]) => void;
  onThinkingDone: () => void;
  onDisambiguation: (question: string, options: string[]) => void;
  onAnswerReady: (answer: AnswerPayload, fixture: FixtureEntry) => void;
  onError: (message: string) => void;
  signal?: AbortSignal;
}

function buildSteps(labels: string[]): ThinkingStep[] {
  return labels.map((label, i) => ({
    id: `step_${i}`,
    label,
    status: "pending" as const,
  }));
}

export async function runAgentTurn(
  input: string,
  options: {
    explicitFixtureId?: string;
    callbacks: RunnerCallbacks;
  }
): Promise<void> {
  const { explicitFixtureId, callbacks } = options;
  const { signal } = callbacks;

  try {
    const fixture = matchFixture(input, explicitFixtureId);
    const reduced = prefersReducedMotion();
    const steps = buildSteps(fixture.thinkingSteps);

    callbacks.onThinkingStart(steps);

    for (const step of steps) {
      if (signal?.aborted) return;
      callbacks.onThinkingStep(step.id, "scanning");
      await sleep(reduced ? 40 : 500 + Math.random() * 350);
      if (signal?.aborted) return;
      callbacks.onThinkingStep(step.id, "done");
    }

    callbacks.onThinkingDone();

    if (fixture.disambiguation) {
      callbacks.onDisambiguation(
        fixture.disambiguation.question,
        fixture.disambiguation.options
      );
      return;
    }

    // Tiny beat so the bubble mounts cleanly after thinking collapses
    await sleep(reduced ? 20 : 120);
    if (signal?.aborted) return;

    callbacks.onAnswerReady(fixture.answer, fixture);
  } catch (err) {
    callbacks.onError(
      err instanceof Error ? err.message : "Ally could not complete this turn."
    );
  }
}

export function createAbortController(): AbortController {
  return new AbortController();
}

export { uid };
