import { useMemo, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TargetProgressBar,
  cn,
} from "@ciq-dev/ciq-design-system";
import { ChevronDown } from "lucide-react";

import type { AnswerTableData, CellTone, TableCellValue } from "@/types";

import { SectionCard } from "./SectionCard";
import {
  answerColumnAlign,
  answerTableCellClass,
  answerTableHeadClass,
} from "./table-chrome";

function cellText(cell: TableCellValue): string {
  if (typeof cell === "object" && cell !== null && "text" in cell) {
    return cell.text;
  }
  return String(cell);
}

function cellTone(cell: TableCellValue): CellTone | undefined {
  if (typeof cell === "object" && cell !== null && "tone" in cell) {
    return cell.tone;
  }
  return undefined;
}

function isBadge(cell: TableCellValue): boolean {
  return typeof cell === "object" && cell !== null && Boolean(cell.badge);
}

function toneClass(tone?: CellTone): string {
  switch (tone) {
    case "positive":
      return "text-feedback-success font-medium";
    case "negative":
      return "text-feedback-danger font-medium";
    case "warning":
      return "text-amber-700 font-medium";
    default:
      return "text-fg-primary";
  }
}

function statusPillClass(tone?: CellTone): string {
  switch (tone) {
    case "positive":
      return "bg-green-50 text-green-700";
    case "negative":
      return "bg-red-50 text-red-700";
    case "warning":
      return "bg-amber-50 text-amber-800";
    default:
      return "bg-surface-muted text-fg-secondary";
  }
}

/** Format thousands as $86K for progress labels */
function formatK(value: number): string {
  return `$${value}K`;
}

function CellView({ cell, isFirst }: { cell: TableCellValue; isFirst: boolean }) {
  const tone = cellTone(cell);
  const text = cellText(cell);

  if (isBadge(cell)) {
    // Plain status pill — not the DS Badge (that ships shadow + hover like a button)
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
          statusPillClass(tone)
        )}
      >
        {text}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-sm",
        isFirst ? "font-semibold text-fg-primary" : "tabular-nums",
        !isFirst && toneClass(tone)
      )}
    >
      {text}
    </span>
  );
}

function rowBg(highlight?: "negative" | "positive" | "none"): string {
  if (highlight === "negative") return "bg-red-50/70 hover:bg-red-50";
  if (highlight === "positive") return "bg-green-50/40 hover:bg-green-50/60";
  return "hover:bg-surface-muted/50";
}

interface AnswerTableProps {
  title?: string;
  description?: string;
  table: AnswerTableData;
  framed?: boolean;
}

function TableInner({
  table,
  rows,
  rowOffset = 0,
}: {
  table: AnswerTableData;
  rows: TableCellValue[][];
  rowOffset?: number;
}) {
  const sticky = table.stickyFirstColumn;

  return (
    <Table>
      <TableHeader className="border-border-default [&_tr]:border-border-default">
        <TableRow className="border-border-default hover:bg-transparent">
          {table.columns.map((c, i) => (
            <TableHead
              key={c}
              className={cn(
                answerTableHeadClass,
                answerColumnAlign(i, table.columns.length),
                sticky && i === 0 && "sticky left-0 z-10 !bg-surface"
              )}
            >
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className="[&_tr]:border-border-default">
        {rows.map((row, i) => {
          const absoluteIndex = rowOffset + i;
          const highlight = table.rowHighlight?.[absoluteIndex];
          return (
            <TableRow
              key={absoluteIndex}
              className={cn("border-border-default", rowBg(highlight))}
            >
              {row.map((cell, j) => (
                <TableCell
                  key={j}
                  className={cn(
                    answerTableCellClass,
                    answerColumnAlign(j, row.length),
                    sticky &&
                      j === 0 &&
                      "sticky left-0 z-10 bg-inherit shadow-[1px_0_0_var(--border-default)]"
                  )}
                >
                  <CellView cell={cell} isFirst={j === 0} />
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

/**
 * Primary tables always visible. Supports preview + expand footer (mock style).
 */
export function AnswerTable({
  title,
  description,
  table,
  framed = true,
}: AnswerTableProps) {
  const emphasis = table.emphasis ?? "primary";
  const preview = table.previewRows;
  const [expanded, setExpanded] = useState(false);
  const count = useMemo(() => table.rows.length, [table.rows]);

  const visibleRows =
    preview && !expanded && !table.expandItems
      ? table.rows.slice(0, preview)
      : preview && table.expandItems
        ? table.rows.slice(0, preview)
        : table.rows;
  const hiddenCount =
    preview && table.rows.length > preview && !table.expandItems
      ? table.rows.length - preview
      : 0;
  const hasExpandList = Boolean(table.expandItems?.length && table.expandLabel);

  const tableBlock = (
    <div className="overflow-x-auto">
      <TableInner table={table} rows={visibleRows} rowOffset={0} />

      {/* Minor categories: 3 equal columns; thin TargetProgressBar = Actual vs Plan */}
      {hasExpandList ? (
        <div className="mt-1 border-t border-dashed border-border-default pt-3">
          <div className="text-[12.5px] text-fg-tertiary">
            {table.expandLabel}
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-4">
            {table.expandItems!.map((item) => {
              const hasProgress =
                typeof item.actual === "number" &&
                typeof item.plan === "number" &&
                item.plan > 0;
              const met = hasProgress && item.actual! >= item.plan!;

              return (
                <div
                  key={item.label}
                  className="flex min-w-0 flex-1 flex-col gap-1.5"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-medium text-fg-primary">
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "text-[12px] tabular-nums",
                        met ? "text-feedback-success" : "text-feedback-danger"
                      )}
                    >
                      {item.value}
                    </span>
                  </div>
                  {hasProgress ? (
                    <>
                      <TargetProgressBar
                        segments={[
                          {
                            label: "Actual",
                            value: item.actual!,
                            color: met ? "bg-emerald-500" : "bg-red-400",
                          },
                          {
                            label: "Plan",
                            value: item.plan!,
                            color: "bg-slate-200",
                          },
                        ]}
                        showLabels={false}
                        height="h-1.5"
                      />
                      <div className="flex justify-between text-[10px] text-fg-tertiary">
                        <span>Actual {formatK(item.actual!)}</span>
                        <span>Plan {formatK(item.plan!)}</span>
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Extra table rows behind a toggle (only when there is no expandItems list) */}
      {hiddenCount > 0 ? (
        <div className="mt-1 border-t border-dashed border-border-default pt-3">
          <button
            type="button"
            className="flex w-full items-center gap-2 text-left text-[12.5px] text-fg-tertiary hover:text-fg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus"
            onClick={() => setExpanded((v) => !v)}
          >
            <ChevronDown
              className={cn(
                "size-3 shrink-0 text-fg-tertiary transition-transform",
                expanded && "rotate-180"
              )}
            />
            {expanded
              ? "Show less"
              : (table.expandLabel ?? `${hiddenCount} more rows`)}
          </button>
          {expanded ? (
            <div className="mt-2">
              <TableInner
                table={{ ...table, rowHighlight: table.rowHighlight }}
                rows={table.rows.slice(preview)}
                rowOffset={preview ?? 0}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const body =
    emphasis === "secondary" && !preview ? (
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm font-medium text-fg-secondary hover:text-fg-primary">
          {expanded ? "Hide" : "Show"} detail ({count} rows)
          <ChevronDown
            className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">{tableBlock}</CollapsibleContent>
      </Collapsible>
    ) : (
      tableBlock
    );

  // Always use the SectionCard frame when framed — title is optional.
  // Untitled tables (e.g. category gap) still get the same border / header chrome.
  if (!framed) {
    return (
      <div className="space-y-2">
        {title ? (
          <h3 className="text-sm font-semibold text-fg-primary">{title}</h3>
        ) : null}
        {body}
      </div>
    );
  }

  return (
    <SectionCard title={title} description={description}>
      {body}
    </SectionCard>
  );
}
