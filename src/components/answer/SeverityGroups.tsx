import { Accordion, Badge } from "@ciq-dev/ciq-design-system";

import type { SeverityGroupData, SeverityLevel } from "@/types";

import { AnswerTable } from "./AnswerTable";

const levelMeta: Record<
  SeverityLevel,
  { badge: string; variant: "default" | "defaultLight" | "secondary" | "destructive" | "outline" }
> = {
  clean: { badge: "Clean", variant: "defaultLight" },
  attention: { badge: "Attention", variant: "secondary" },
  broken: { badge: "Broken", variant: "destructive" },
  unplanned: { badge: "Unplanned", variant: "destructive" },
  info: { badge: "Info", variant: "outline" },
};

interface SeverityGroupsProps {
  title?: string;
  groups: SeverityGroupData[];
}

export function SeverityGroups({ title, groups }: SeverityGroupsProps) {
  return (
    <div className="space-y-3">
      {title ? (
        <h3 className="text-sm font-semibold text-fg-primary">{title}</h3>
      ) : null}
      <div className="space-y-2">
        {groups.map((group) => {
          const meta = levelMeta[group.level];
          const expand =
            group.defaultExpanded ??
            (group.level === "attention" ||
              group.level === "broken" ||
              group.level === "unplanned");

          return (
            <Accordion
              key={group.title}
              title={
                <span className="flex items-center gap-2">
                  <Badge variant={meta.variant}>{meta.badge}</Badge>
                  <span className="text-sm font-medium text-fg-primary">
                    {group.title}
                  </span>
                </span>
              }
              defaultExpanded={expand}
              className="rounded-xl border border-border-default bg-surface"
            >
              <div className="space-y-2 px-1 pb-1">
                {group.summary ? (
                  <p className="text-sm text-fg-secondary">{group.summary}</p>
                ) : null}
                {group.table ? (
                  <AnswerTable table={group.table} framed={false} />
                ) : null}
              </div>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
}
