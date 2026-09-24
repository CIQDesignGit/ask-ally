import { useLayoutEffect, useRef } from "react";

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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const prevUserTurnId = useRef<string | undefined>(undefined);
  const lastUserTurnId = thread?.turns.findLast((t) => t.role === "user")?.id;

  // Pin a newly asked question to the top of the pane once. Do not follow
  // the answer as it grows — the user reads from the start of the turn.
  useLayoutEffect(() => {
    const prev = prevUserTurnId.current;
    prevUserTurnId.current = lastUserTurnId;
    if (!lastUserTurnId || !prev || lastUserTurnId === prev) return;

    const scroller = scrollerRef.current;
    const el = document.getElementById(`turn-${lastUserTurnId}`);
    if (!scroller || !el) return;

    const delta =
      el.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    scroller.scrollTop += delta;
  }, [lastUserTurnId]);

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

      <div
        ref={scrollerRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-atomic="false"
        aria-label="Chat messages"
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
      >
        <div
          className={
            isEmpty
              ? "mx-auto flex min-h-full w-full max-w-[820px] flex-col justify-center px-4 py-6"
              : "mx-auto w-full max-w-[820px] space-y-4 px-4 py-6"
          }
        >
          {isEmpty ? (
            <SuggestedQuestions />
          ) : (
            thread.turns.map((turn, idx) => {
              if (turn.role === "user") {
                return (
                  <div key={turn.id} id={`turn-${turn.id}`}>
                    <UserMessage turn={turn} scopeChips={chips} />
                  </div>
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
        </div>
      </div>

      <Messenger />
    </div>
  );
}
