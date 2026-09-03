import { useMemo, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@ciq-dev/ciq-design-system";
import { ChevronDown } from "lucide-react";

import type { VisualBlock } from "@/types";

import { BridgeChart } from "./BridgeChart";
import { HeatStrip } from "./HeatStrip";
import { RankedBarList } from "./RankedBarList";
import { Sparkline } from "./Sparkline";
import { StatusBoard } from "./StatusBoard";
import {
  answerColumnAlign,
  answerTableCellClass,
  answerTableHeadClass,
} from "./table-chrome";

interface VisualBlockViewProps {
  visual: VisualBlock;
  ready: boolean;
}

export function VisualBlockView({ visual, ready }: VisualBlockViewProps) {
  if (!ready) {
    return (
      <div className="space-y-2 rounded-xl border border-border-default p-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  switch (visual.kind) {
    case "bridge":
      return <BridgeChart steps={visual.steps} />;
    case "rankedBars":
      return <RankedBarList items={visual.items} />;
    case "sparkline":
      return <Sparkline points={visual.points} label={visual.label} />;
    case "heatStrip":
      return <HeatStrip days={visual.days} />;
    case "statusBoard":
      return <StatusBoard groups={visual.groups} />;
    default:
      return null;
  }
}

interface DetailTableProps {
  columns: string[];
  rows: (string | number)[][];
}

export function DetailTable({ columns, rows }: DetailTableProps) {
  const [open, setOpen] = useState(false);
  const count = useMemo(() => rows.length, [rows]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500">
        Show the detail ({count} rows)
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 overflow-x-auto rounded-xl border border-border-default bg-surface p-4">
        <Table>
          <TableHeader className="border-border-default [&_tr]:border-border-default">
            <TableRow className="border-border-default hover:bg-transparent">
              {columns.map((c, i) => (
                <TableHead
                  key={c}
                  className={cn(
                    answerTableHeadClass,
                    answerColumnAlign(i, columns.length)
                  )}
                >
                  {c}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr]:border-border-default">
            {rows.map((row, i) => (
              <TableRow key={i} className="border-border-default">
                {row.map((cell, j) => (
                  <TableCell
                    key={j}
                    className={cn(
                      answerTableCellClass,
                      answerColumnAlign(j, row.length),
                      j === 0 && "font-semibold text-fg-primary"
                    )}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CollapsibleContent>
    </Collapsible>
  );
}
