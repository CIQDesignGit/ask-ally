import { Accordion } from "@ciq-dev/ciq-design-system";

import type { IssueBreakdownItem, IssueStatusTone } from "@/types";

interface IssueBreakdownProps {
  title?: string;
  items: IssueBreakdownItem[];
}

function statusPillClass(tone?: IssueStatusTone): string {
  switch (tone) {
    case "danger":
      return "bg-red-50 text-red-700";
    case "warning":
      return "bg-amber-50 text-amber-800";
    case "success":
      return "bg-green-50 text-green-700";
    default:
      return "bg-surface-muted text-fg-secondary";
  }
}

/**
 * Top Issues accordion — title on the left, status pill on the right
 * (Still an Issue / Worth Watching).
 */
export function IssueBreakdown({ title, items }: IssueBreakdownProps) {
  return (
    <div className="space-y-3">
      {title ? (
        <h3 className="text-sm font-semibold text-fg-primary">{title}</h3>
      ) : null}
      <div className="space-y-2">
        {items.map((item) => (
          <Accordion
            key={item.title}
            title={
              <span className="flex w-full min-w-0 items-center justify-between gap-3 pr-1">
                <span className="min-w-0 text-sm font-medium text-fg-primary">
                  {item.title}
                </span>
                {item.statusLabel ? (
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${statusPillClass(item.statusTone)}`}
                  >
                    {item.statusLabel}
                  </span>
                ) : null}
              </span>
            }
            defaultExpanded={item.defaultExpanded ?? false}
            chevronPosition="right"
            className="rounded-xl border border-border-default bg-surface"
            triggerClassName="px-4 py-3"
            contentClassName="border-t border-border-default px-4 pb-3.5 pt-3"
          >
            <p className="text-[13.5px] leading-relaxed text-fg-secondary">
              {item.body}
            </p>
          </Accordion>
        ))}
      </div>
    </div>
  );
}
