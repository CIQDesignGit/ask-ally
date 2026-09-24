import { cn } from "@ciq-dev/ciq-design-system";
import {
  BaseEdge,
  Handle,
  Position,
  ReactFlow,
  useUpdateNodeInternals,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  DollarSign,
  Eye,
  type LucideIcon,
  Percent,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import type { DriverPeriod } from "./GapToPlanPanels";

import "@xyflow/react/dist/style.css";

const DRIVER_ICON: { match: RegExp; icon: LucideIcon }[] = [
  { match: /price|asp|selling/, icon: DollarSign },
  { match: /traffic|view|pdp/, icon: Eye },
  { match: /conversion|cvr/, icon: Percent },
];

function iconForDriver(label: string): LucideIcon {
  const hit = DRIVER_ICON.find((r) => r.match.test(label.toLowerCase()));
  return hit?.icon ?? TrendingUp;
}

function gapToneClass(gap?: string, muted = false): string {
  if (!gap || gap === "—") return "text-fg-tertiary";
  const n = gap.trim();
  if (n.startsWith("−") || n.startsWith("-")) {
    return muted ? "text-red-300" : "text-feedback-danger";
  }
  if (n.startsWith("+")) {
    return muted ? "text-emerald-300" : "text-feedback-success";
  }
  return muted ? "text-fg-tertiary" : "text-fg-primary";
}

function PeriodStats({
  period,
  emphasis = false,
}: {
  period: DriverPeriod;
  emphasis?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline gap-2 tabular-nums">
        {period.actual ? (
          <span
            className={cn(
              "font-semibold tracking-tight",
              emphasis
                ? "text-base leading-none text-fg-primary"
                : "text-sm leading-none text-fg-tertiary",
            )}
          >
            {period.actual}
          </span>
        ) : null}
        {period.gap ? (
          <span
            className={cn(
              "font-semibold leading-none",
              emphasis ? "text-sm" : "text-[13px]",
              gapToneClass(period.gap, !emphasis),
            )}
          >
            {period.gap}
          </span>
        ) : null}
      </div>
      <div className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-fg-tertiary">
        {period.label}
        {period.caption ? ` · ${period.caption}` : ""}
      </div>
    </div>
  );
}

function DriverCard({
  label,
  delta,
  current,
  periodLabel,
  positive,
}: {
  label: string;
  delta: string;
  current?: string;
  periodLabel?: string;
  positive: boolean;
}) {
  const Icon = iconForDriver(label);

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2 rounded-xl border bg-surface px-3.5 py-3",
        positive ? "border-emerald-400!" : "border-red-400!",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md",
            positive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700",
          )}
          aria-hidden
        >
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <div className="text-[13px] font-semibold text-fg-primary">{label}</div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {current ? (
            <span className="text-base font-semibold leading-none tabular-nums tracking-tight text-fg-primary">
              {current}
            </span>
          ) : null}
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[12px] font-semibold tabular-nums tracking-tight",
              positive
                ? "bg-emerald-50 text-feedback-success"
                : "bg-red-50 text-feedback-danger",
            )}
          >
            {positive ? (
              <TrendingUp className="size-3" aria-hidden />
            ) : (
              <TrendingDown className="size-3" aria-hidden />
            )}
            {delta}
          </span>
        </div>
        {periodLabel ? (
          <div className="mt-1 text-[11px] text-fg-secondary">{periodLabel}</div>
        ) : null}
      </div>
    </div>
  );
}

const hiddenHandle = "opacity-0!";

type CompareNode = Node<
  { compareTo?: DriverPeriod; compareFrom?: DriverPeriod },
  "compare"
>;

type DriverNode = Node<
  {
    label: string;
    delta: string;
    current?: string;
    periodLabel?: string;
    positive: boolean;
  },
  "driver"
>;

type FlowNode = CompareNode | DriverNode;

function CompareNodeView({ data }: NodeProps<CompareNode>) {
  return (
    <div className="flex h-full items-center justify-center px-2">
      <div className="rounded-xl border border-border-default bg-surface px-5 py-2.5">
        {data.compareTo && data.compareFrom ? (
          <div className="flex items-start justify-center gap-5">
            <PeriodStats period={data.compareTo} emphasis />
            <span className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-fg-tertiary">
              vs
            </span>
            <PeriodStats period={data.compareFrom} />
          </div>
        ) : data.compareTo ? (
          <div className="flex justify-center">
            <PeriodStats period={data.compareTo} emphasis />
          </div>
        ) : null}
      </div>
      <Handle
        id="source"
        type="source"
        position={Position.Bottom}
        className={hiddenHandle}
        isConnectable={false}
      />
    </div>
  );
}

function DriverNodeView({ data }: NodeProps<DriverNode>) {
  return (
    <>
      <Handle
        id="target"
        type="target"
        position={Position.Top}
        className={hiddenHandle}
        isConnectable={false}
      />
      <DriverCard {...data} />
    </>
  );
}

const nodeTypes = {
  compare: CompareNodeView,
  driver: DriverNodeView,
};

/** One shared mid-Y so three edges read as trunk + crossbar + drops. */
function TreeEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
}: EdgeProps) {
  const midY = sourceY + (targetY - sourceY) / 2;
  const path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
  return <BaseEdge id={id} path={path} style={style} />;
}

const edgeTypes = {
  tree: TreeEdge,
};

function RegisterHandles({ ids }: { ids: string }) {
  const update = useUpdateNodeInternals();
  useLayoutEffect(() => {
    if (ids) update(ids.split(","));
  }, [ids, update]);
  return null;
}

const EDGE_STYLE = {
  stroke: "var(--color-slate-400)",
  strokeWidth: 1,
} as const;

const COMPARE_H = 72;
const EDGE_H = 40;
const CARD_H = 102;
const GAP = 12;

export interface DriverFlowCard {
  id: string;
  label: string;
  delta: string;
  current?: string;
  periodLabel?: string;
  positive: boolean;
}

export function DriverFlow({
  compareFrom,
  compareTo,
  cards,
}: {
  compareFrom?: DriverPeriod;
  compareTo?: DriverPeriod;
  cards: DriverFlowCard[];
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const sync = () => setWidth(el.clientWidth);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hasCompare = Boolean(compareTo);
  const height = (hasCompare ? COMPARE_H + EDGE_H : 0) + CARD_H + 8;

  const { nodes, edges } = useMemo(() => {
    if (width <= 0) return { nodes: [] as FlowNode[], edges: [] as Edge[] };

    const colCount = Math.max(cards.length, 1);
    const cardW = (width - GAP * (colCount - 1)) / colCount;
    const nextNodes: FlowNode[] = [];
    const nextEdges: Edge[] = [];

    if (hasCompare) {
      nextNodes.push({
        id: "compare",
        type: "compare",
        position: { x: 0, y: 0 },
        data: { compareTo, compareFrom },
        width,
        height: COMPARE_H,
        style: { width, height: COMPARE_H },
        draggable: false,
        selectable: false,
      });
    }

    cards.forEach((card, i) => {
      const id = `driver-${card.id}`;
      nextNodes.push({
        id,
        type: "driver",
        position: {
          x: i * (cardW + GAP),
          y: hasCompare ? COMPARE_H + EDGE_H : 0,
        },
        data: {
          label: card.label,
          delta: card.delta,
          current: card.current,
          periodLabel: card.periodLabel,
          positive: card.positive,
        },
        width: cardW,
        height: CARD_H,
        style: { width: cardW, height: CARD_H },
        draggable: false,
        selectable: false,
      });

      if (hasCompare) {
        nextEdges.push({
          id: `compare-${id}`,
          source: "compare",
          target: id,
          sourceHandle: "source",
          targetHandle: "target",
          type: "tree",
          style: EDGE_STYLE,
        });
      }
    });

    return { nodes: nextNodes, edges: nextEdges };
  }, [width, hasCompare, compareTo, compareFrom, cards]);

  return (
    <div
      ref={hostRef}
      className="w-full [&_.react-flow__attribution]:hidden [&_.react-flow__node]:overflow-visible! [&_.react-flow__node]:border-0! [&_.react-flow__node]:bg-transparent! [&_.react-flow__node]:p-0! [&_.react-flow__node]:shadow-none! [&_.react-flow__pane]:cursor-default [&_.react-flow__renderer]:overflow-visible! [&_.react-flow]:overflow-visible!"
      style={{ height }}
    >
      {width > 0 ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={1}
          maxZoom={1}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          panOnDrag={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
        >
          <RegisterHandles ids={nodes.map((n) => n.id).join(",")} />
        </ReactFlow>
      ) : null}
    </div>
  );
}
