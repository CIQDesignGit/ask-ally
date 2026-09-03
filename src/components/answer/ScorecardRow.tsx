import type { ScorecardTile } from "@/types";

interface ScorecardRowProps {
  title?: string;
  tiles: ScorecardTile[];
}

function tileShell(variant?: ScorecardTile["variant"], featured?: boolean) {
  if (variant === "danger") {
    return "min-w-0 rounded-lg bg-red-50 px-3.5 py-3";
  }
  if (variant === "success") {
    return "min-w-0 rounded-lg bg-green-50 px-3.5 py-3";
  }
  if (featured) {
    return "min-w-0 rounded-[10px] bg-violet-50 px-4 py-3.5";
  }
  return "min-w-0 rounded-lg bg-slate-50 px-3.5 py-3";
}

function labelClass(variant?: ScorecardTile["variant"], featured?: boolean) {
  if (variant === "danger") {
    return "mb-1 text-[11px] font-semibold uppercase tracking-wide text-red-700";
  }
  if (featured) {
    return "mb-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700";
  }
  return "mb-1 text-[11px] font-semibold uppercase tracking-wide text-fg-tertiary";
}

function valueClass(variant?: ScorecardTile["variant"], featured?: boolean) {
  if (variant === "danger") return "text-[20px] font-medium text-red-600";
  if (variant === "success") return "text-[20px] font-medium text-feedback-success";
  if (featured) return "text-[24px] font-medium text-fg-primary";
  // Side tiles are narrower — slightly smaller so values don't wrap awkwardly
  return "text-[18px] font-medium text-fg-primary";
}

function Tile({
  tile,
  featured,
}: {
  tile: ScorecardTile;
  featured?: boolean;
}) {
  return (
    <div className={tileShell(tile.variant, featured)}>
      <div className={labelClass(tile.variant, featured)}>{tile.label}</div>
      <div
        className={`tabular-nums tracking-tight ${valueClass(tile.variant, featured)}`}
      >
        {tile.value}
      </div>
      {/* Delta always sits as quiet subtext — never inline with the big number */}
      {tile.delta ? (
        <div className="mt-1 text-[12px] leading-snug text-fg-tertiary">
          {tile.delta}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Metric tiles.
 * - Equal trio (no featured): Actual | Plan | Gap
 * - Featured + side tiles: uneven row — featured slightly wider, side pair gets enough room
 */
export function ScorecardRow({ title, tiles }: ScorecardRowProps) {
  if (!tiles.length) return null;

  const featured = tiles.find((t) => t.featured);
  const rest = featured ? tiles.filter((t) => !t.featured) : tiles;

  return (
    <div className="space-y-3">
      {title ? (
        <h3 className="text-sm font-semibold text-fg-primary">{title}</h3>
      ) : null}

      {featured ? (
        rest.length > 0 ? (
          // ~1 : 1.2 — featured still a bit bigger, side pair less cramped than 1.4 : 1
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <Tile tile={featured} featured />
            <div
              className={`grid min-w-0 gap-2.5 ${
                rest.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {rest.map((tile) => (
                <Tile key={tile.label} tile={tile} />
              ))}
            </div>
          </div>
        ) : (
          <Tile tile={featured} featured />
        )
      ) : (
        <div
          className="grid gap-2.5"
          style={{
            gridTemplateColumns: `repeat(${Math.min(tiles.length, 4)}, minmax(0, 1fr))`,
          }}
        >
          {tiles.map((tile) => (
            <Tile key={tile.label} tile={tile} />
          ))}
        </div>
      )}
    </div>
  );
}
