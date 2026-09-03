import { useState } from "react";

interface RankedBarListProps {
  items: {
    label: string;
    value: number;
    confidence: "high" | "medium" | "low";
  }[];
}

const opacity: Record<string, number> = {
  high: 1,
  medium: 0.7,
  low: 0.45,
};

export function RankedBarList({ items }: RankedBarListProps) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...items.map((i) => i.value), 1);
  const width = 400;
  const rowH = 28;

  return (
    <div className="relative rounded-xl border border-border-default bg-surface p-3 shadow-xs">
      <div className="mb-2 text-xs font-medium text-fg-secondary">
        Drivers by dollar impact ($K)
      </div>
      <svg
        width={width}
        height={items.length * rowH + 8}
        role="img"
        aria-label="Ranked bar drivers"
      >
        {items.map((item, i) => {
          const barW = Math.max(4, (item.value / max) * 220);
          const y = i * rowH + 4;
          return (
            <g
              key={item.label}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <text
                x={0}
                y={y + 14}
                className="fill-fg-secondary"
                style={{ fontSize: 11 }}
              >
                {item.label.length > 22
                  ? `${item.label.slice(0, 21)}…`
                  : item.label}
              </text>
              <rect
                x={160}
                y={y + 4}
                width={barW}
                height={14}
                rx={4}
                fill={`rgba(124,58,237,${opacity[item.confidence]})`}
              />
              <text
                x={168 + barW}
                y={y + 15}
                className="fill-fg-primary"
                style={{ fontSize: 11, fontWeight: 600 }}
              >
                ${item.value}K
              </text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="absolute right-3 top-3 rounded-md border border-border-default bg-surface px-2 py-1 text-xs shadow-sm">
          {items[hover].label}: ${items[hover].value}K (
          {items[hover].confidence} confidence)
        </div>
      )}
    </div>
  );
}
