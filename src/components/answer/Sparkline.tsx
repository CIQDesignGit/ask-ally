import { useState } from "react";

interface SparklineProps {
  points: number[];
  label: string;
}

export function Sparkline({ points, label }: SparklineProps) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 360;
  const height = 100;
  const pad = 12;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const coords = points.map((p, i) => {
    const x = pad + (i / Math.max(points.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - ((p - min) / span) * (height - pad * 2);
    return { x, y, p };
  });

  const d = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");

  return (
    <div className="relative rounded-xl border border-border-default bg-surface p-3 shadow-xs">
      <div className="mb-1 text-xs font-medium text-fg-secondary">{label}</div>
      <svg width={width} height={height} role="img" aria-label={label}>
        <line
          x1={pad}
          x2={width - pad}
          y1={height - pad}
          y2={height - pad}
          stroke="#e2e8f0"
          strokeWidth={2}
        />
        <path d={d} fill="none" stroke="#7c3aed" strokeWidth={2} />
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={hover === i ? 5 : 3}
            fill="#7c3aed"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
        {/* direct-label last point */}
        <text
          x={coords[coords.length - 1]?.x ?? 0}
          y={(coords[coords.length - 1]?.y ?? 0) - 8}
          textAnchor="middle"
          style={{ fontSize: 11, fontWeight: 600 }}
          className="fill-fg-primary"
        >
          {points[points.length - 1]}
        </text>
      </svg>
      {hover !== null && (
        <div className="absolute right-3 top-3 rounded-md border border-border-default bg-surface px-2 py-1 text-xs shadow-sm">
          Point {hover + 1}: {points[hover]}
        </div>
      )}
    </div>
  );
}
