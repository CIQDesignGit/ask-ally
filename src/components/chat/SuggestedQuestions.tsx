import { Button, EmptyState } from "@ciq-dev/ciq-design-system";
import { Activity, ChartNoAxesCombined } from "lucide-react";

import { agentConfig } from "@/config/agent";
import { suggestedQuestionGroups } from "@/fixtures";
import { useAllyStore } from "@/store/ally-store";

const groupIcons = [ChartNoAxesCombined, Activity, ChartNoAxesCombined];

export function SuggestedQuestions() {
  const submitMessage = useAllyStore((s) => s.submitMessage);
  const isRunning = useAllyStore((s) => s.isRunning);

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-10 sm:py-12">
      <EmptyState
        title={`Ask ${agentConfig.name}`}
        description={agentConfig.tagline}
      />

      <div className="mt-8 grid w-full gap-4 sm:grid-cols-3">
        {suggestedQuestionGroups.map((group, index) => {
          const Icon = groupIcons[index] ?? Activity;

          return (
          <section
            key={group.label}
            className="flex min-w-0 flex-col pb-3"
          >
            <div className="mb-3 flex items-center gap-2 border-b border-border-default pb-3 text-[10px] font-semibold uppercase tracking-wide text-fg-secondary">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-surface-brand-50 text-fg-brand">
                <Icon className="size-2.5" aria-hidden="true" />
              </span>
              <span className="leading-4">{group.label}</span>
            </div>
            <div className="flex flex-col gap-2">
              {group.questions.map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  disabled={isRunning}
                  className="h-auto min-h-12 justify-start whitespace-normal rounded-md border-0 bg-surface-muted px-3 py-2.5 text-left text-xs leading-4 text-fg-secondary shadow-none transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-surface hover:text-fg-primary"
                  onClick={() => void submitMessage(q)}
                >
                  <span>{q}</span>
                </Button>
              ))}
            </div>
          </section>
          );
        })}
      </div>
    </div>
  );
}
