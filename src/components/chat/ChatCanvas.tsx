import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@ciq-dev/ciq-design-system";

import { formatScopeChips } from "@/lib/utils";
import { useAllyStore } from "@/store/ally-store";

import { AgentMessage, UserMessage } from "./AgentMessage";
import { Messenger } from "./Messenger";
import { SuggestedQuestions } from "./SuggestedQuestions";

/** Prefer the question portion of "question · period" titles. */
function displayTitle(title: string): string {
  const sep = title.indexOf(" · ");
  return sep === -1 ? title : title.slice(0, sep);
}

export function ChatCanvas() {
  const thread = useAllyStore((s) => s.getActiveThread());
  const scope = useAllyStore((s) => s.scope);
  const chips = formatScopeChips(scope);
  const isEmpty = !thread || thread.turns.length === 0;

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {thread && !isEmpty && (
        <div className="border-b border-border-default px-4 py-2">
          <h2
            className="truncate text-sm font-medium text-fg-primary"
            title={thread.title}
          >
            {displayTitle(thread.title)}
          </h2>
        </div>
      )}

      <ChatContainerRoot className="min-h-0 flex-1">
        <ChatContainerContent
          className={
            isEmpty
              ? "mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-4 py-6"
              : "mx-auto w-full max-w-3xl space-y-4 px-4 py-6"
          }
        >
          {isEmpty ? (
            <SuggestedQuestions />
          ) : (
            thread.turns.map((turn, idx) => {
              if (turn.role === "user") {
                return (
                  <UserMessage
                    key={turn.id}
                    turn={turn}
                    scopeChips={chips}
                  />
                );
              }
              return (
                <AgentMessage
                  key={turn.id}
                  turn={turn}
                  threadId={thread.id}
                  isLast={idx === thread.turns.length - 1}
                />
              );
            })
          )}
        </ChatContainerContent>
      </ChatContainerRoot>

      <Messenger />
    </div>
  );
}
