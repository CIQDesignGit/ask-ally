import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
  CircularLoader,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ciq-dev/ciq-design-system";
import { Check, ChevronDown } from "lucide-react";

import type { ThinkingStep } from "@/types";

interface AgentThinkingProps {
  steps: ThinkingStep[];
  done: boolean;
}

export function AgentThinking({ steps, done }: AgentThinkingProps) {
  if (!steps.length) return null;

  return (
    <div className="w-fit max-w-full">
      <Collapsible defaultOpen={!done}>
        <CollapsibleTrigger className="flex w-auto max-w-full items-center justify-start gap-2 text-left text-xs font-medium text-fg-secondary">
          <span>{done ? `Completed ${steps.length} steps.` : "Working through steps..."}</span>
          <ChevronDown className="size-4 shrink-0 text-fg-tertiary transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pt-2">
            <ChainOfThought>
              {steps.map((step) => (
                <ChainOfThoughtStep key={step.id} defaultOpen={!done}>
                  <ChainOfThoughtTrigger
                    showExpandIcon
                    swapIconOnHover={false}
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
