import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
  CircularLoader,
} from "@ciq-dev/ciq-design-system";
import { Check } from "lucide-react";

import type { ThinkingStep } from "@/types";

interface AgentThinkingProps {
  steps: ThinkingStep[];
  done: boolean;
}

export function AgentThinking({ steps, done }: AgentThinkingProps) {
  if (!steps.length) return null;

  return (
    <div className="rounded-xl border border-border-default bg-surface-muted/60 px-3 py-2">
      <ChainOfThought>
        {steps.map((step, index) => (
          <ChainOfThoughtStep key={step.id} defaultOpen={!done || index === 0}>
            <ChainOfThoughtTrigger
              leftIcon={
                step.status === "done" ? (
                  <Check className="size-3.5 text-feedback-success" />
                ) : step.status === "scanning" ? (
                  <CircularLoader className="size-3.5" />
                ) : (
                  <span className="size-3.5 rounded-full border border-slate-300" />
                )
              }
            >
              {step.label}
            </ChainOfThoughtTrigger>
            <ChainOfThoughtContent>
              <span className="text-xs text-fg-tertiary">
                {step.status === "done"
                  ? "Done"
                  : step.status === "scanning"
                    ? "Working…"
                    : "Queued"}
              </span>
            </ChainOfThoughtContent>
          </ChainOfThoughtStep>
        ))}
      </ChainOfThought>
    </div>
  );
}
