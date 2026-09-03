import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  ChatContainerContent,
  ChatContainerRoot,
} from "@ciq-dev/ciq-design-system";
import { Fragment } from "react";

import { formatScopeChips } from "@/lib/utils";
import { useAllyStore } from "@/store/ally-store";

import { AgentMessage, UserMessage } from "./AgentMessage";
import { Messenger } from "./Messenger";
import { SuggestedQuestions } from "./SuggestedQuestions";

export function ChatCanvas() {
  const thread = useAllyStore((s) => s.getActiveThread());
  const breadcrumb = useAllyStore((s) => s.breadcrumb);
  const jumpBreadcrumb = useAllyStore((s) => s.jumpBreadcrumb);
  const scope = useAllyStore((s) => s.scope);
  const chips = formatScopeChips(scope);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {breadcrumb.length > 1 && (
        <div className="border-b border-border-default px-4 py-2">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumb.map((crumb, i) => (
                <Fragment key={`${crumb}-${i}`}>
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {i === breadcrumb.length - 1 ? (
                      <BreadcrumbPage>{crumb}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          jumpBreadcrumb(i);
                        }}
                      >
                        {crumb}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      <ChatContainerRoot className="min-h-0 flex-1">
        <ChatContainerContent className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6">
          {!thread || thread.turns.length === 0 ? (
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
