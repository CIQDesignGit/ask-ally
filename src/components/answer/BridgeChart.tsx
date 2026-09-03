import { useMemo, useState } from "react";

interface BridgeChartProps {
  steps: { label: string; value: number }[];
}

/** Waterfall / bridge: plan → drivers → actual (values in $M). */
export function BridgeChart({ steps }: BridgeChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  const layout = useMemo(() => {
    const width = 420;
    const height = 160;
    const pad = 28;
    const barW = 36;
    const gap = 28;
    let running = 0;
    const absMax = Math.max(
      ...steps.map((s) => Math.abs(s.value)),
      Math.abs(steps.reduce((a, s) => a + (s.label === "Plan" || s.label === "Actual" ? 0 : s.value), steps[0]?.value ?? 0))
    );
    // Rebuild cumulative for waterfall
    const items: {
      label: string;
      value: number;
      y0: number;
      y1: number;
      x: number;
      isTotal: boolean;
    }[] = [];

    let cursor = 0;
    steps.forEach((s, i) => {
      const isTotal = s.label === "Plan" || s.label === "Actual";
      if (isTotal) {
        if (s.label === "Plan") cursor = s.value;
        const y0 = 0;
        const y1 = s.value;
        items.push({
          label: s.label,
          value: s.value,
          y0,
          y1,
          x: pad + i * (barW + gap),
          isTotal: true,
        });
        if (s.label === "Actual") cursor = s.value;
      } else {
        const y0 = cursor;
        cursor = cursor + s.value;
        items.push({
          label: s.label,
          value: s.value,
          y0,
          y1: cursor,
          x: pad + i * (barW + gap),
          isTotal: false,
        });
      }
      running = cursor;
    });

    const allY = items.flatMap((it) => [it.y0, it.y1]);
    const minY = Math.min(...allY, 0);
    const maxY = Math.max(...allY, absMax);
    const span = maxY - minY || 1;
    const scale = (v: number) =>
      height - pad - ((v - minY) / span) * (height - pad * 2);

    return { width, height, barW, items, scale, running };
  }, [steps]);

  return (
    <div className="relative w-full overflow-x-auto rounded-xl border border-border-default bg-surface p-3 shadow-xs">
      <div className="mb-1 text-xs font-medium text-fg-secondary">
        Plan → drivers → actual ($M)
      </div>
      <svg
        width={layout.width}
        height={layout.height}
        role="img"
        aria-label="Bridge chart from plan to actual"
      >
        {/* baseline */}
        <line
          x1={16}
          x2={layout.width - 8}
          y1={layout.scale(0)}
          y2={layout.scale(0)}
          stroke="#e2e8f0"
          strokeWidth={2}
        />
        {layout.items.map((it, i) => {
          const yTop = layout.scale(Math.max(it.y0, it.y1));
          const yBot = layout.scale(Math.min(it.y0, it.y1));
          const h = Math.max(4, yBot - yTop);
          const fill =
            it.isTotal
              ? "#7c3aed"
              : it.value < 0
                ? "rgba(124,58,237,0.7)"
                : "rgba(124,58,237,0.45)";
          return (
            <g
              key={it.label}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="cursor-default"
            >
              <rect
                x={it.x}
                y={yTop}
                width={layout.barW}
                height={h}
                rx={4}
                fill={fill}
              />
              <text
                x={it.x + layout.barW / 2}
                y={layout.height - 8}
                textAnchor="middle"
                className="fill-fg-tertiary"
                style={{ fontSize: 10 }}
              >
                {it.label.length > 10 ? `${it.label.slice(0, 9)}…` : it.label}
              </text>
              {(it.isTotal || Math.abs(it.value) >= 0.1) && (
                <text
                  x={it.x + layout.barW / 2}
                  y={yTop - 6}
                  textAnchor="middle"
                  className="fill-fg-primary"
                  style={{ fontSize: 10, fontWeight: 600 }}
                >
                  {it.value > 0 && !it.isTotal ? "+" : ""}
                  {it.value.toFixed(2)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && layout.items[hover] && (
        <div className="pointer-events-none absolute right-3 top-3 rounded-md border border-border-default bg-surface px-2 py-1 text-xs shadow-sm">
          <span className="font-medium">{layout.items[hover].label}</span>
          {": "}
          {layout.items[hover].value > 0 && !layout.items[hover].isTotal
            ? "+"
            : ""}
          ${Math.abs(layout.items[hover].value).toFixed(2)}M
        </div>
      )}
    </div>
  );
}
