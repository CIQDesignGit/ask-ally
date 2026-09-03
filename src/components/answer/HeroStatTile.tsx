import { TrendingDown, TrendingUp } from "lucide-react";

interface HeroStatTileProps {
  value: string;
  delta?: string;
  direction?: "up" | "down";
}

export function HeroStatTile({ value, delta, direction }: HeroStatTileProps) {
  if (!value) return null;
  return (
    <div className="rounded-xl border border-border-default bg-surface p-4 shadow-xs">
      <div className="text-xs font-medium uppercase tracking-wide text-fg-tertiary">
        Headline
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-fg-primary">{value}</span>
        {direction === "down" && (
          <TrendingDown className="size-4 text-red-600" aria-hidden />
        )}
        {direction === "up" && (
          <TrendingUp className="size-4 text-feedback-success" aria-hidden />
        )}
      </div>
      {delta && (
        <div
          className={`mt-1 text-sm ${
            direction === "down"
              ? "text-red-700"
              : direction === "up"
                ? "text-feedback-success"
                : "text-fg-secondary"
          }`}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
