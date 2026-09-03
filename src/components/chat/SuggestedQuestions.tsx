import { Button, EmptyState } from "@ciq-dev/ciq-design-system";

import { agentConfig } from "@/config/agent";
import { suggestedQuestionGroups } from "@/fixtures";
import { useAllyStore } from "@/store/ally-store";

export function SuggestedQuestions() {
  const submitMessage = useAllyStore((s) => s.submitMessage);
  const isRunning = useAllyStore((s) => s.isRunning);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-10">
      <EmptyState
        title={`Ask ${agentConfig.name}`}
        description={agentConfig.tagline}
      />

      <div className="mt-2 grid w-full gap-6 sm:grid-cols-3">
        {suggestedQuestionGroups.map((group) => (
          <div key={group.label}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-tertiary">
              {group.label}
            </div>
            <div className="flex flex-col gap-2">
              {group.questions.map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  disabled={isRunning}
                  className="h-auto justify-start whitespace-normal px-3 py-2 text-left text-xs shadow-none"
                  onClick={() => void submitMessage(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
