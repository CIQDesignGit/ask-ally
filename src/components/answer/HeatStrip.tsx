import { useState } from "react";

interface HeatStripProps {
  days: { date: string; state: "ok" | "issue" }[];
}

export function HeatStrip({ days }: HeatStripProps) {
  const [hover, setHover] = useState<number | null>(null);
  const cell = 22;
  const gap = 4;

  return (
    <div className="relative rounded-xl border border-border-default bg-surface p-3 shadow-xs">
      <div className="mb-2 text-xs font-medium text-fg-secondary">
        Chronic vs one-off pattern
      </div>
      <div className="flex items-center gap-1">
        {days.map((d, i) => (
          <div
            key={`${d.date}-${i}`}
            title={d.date}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="rounded-sm transition-transform hover:-translate-y-px"
            style={{
              width: cell,
              height: cell,
              background: d.state === "ok" ? "#f1f5f9" : "#a78bfa",
            }}
            aria-label={`${d.date}: ${d.state}`}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-3 text-xs text-fg-tertiary">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-3 rounded-sm bg-slate-100" /> OK
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-3 rounded-sm bg-brand-400" /> Issue
        </span>
        <span className="ml-auto">gap {gap}px · {days.length} days</span>
      </div>
      {hover !== null && (
        <div className="absolute right-3 top-3 rounded-md border border-border-default bg-surface px-2 py-1 text-xs shadow-sm">
          {days[hover].date}: {days[hover].state}
        </div>
      )}
    </div>
  );
}
