import type { ActionRecommendation } from "@/types";

interface ActionRecommendationsProps {
  title?: string;
  items: ActionRecommendation[];
  /** When false, render cards only (no outer section chrome) — used inside GapToPlanReport */
  framed?: boolean;
}

/**
 * Gap-to-plan recommendations — plain action cards
 * (no Recommended/Alternative badges).
 */
export function ActionRecommendations({
  title = "Recommendations",
  items,
  framed = true,
}: ActionRecommendationsProps) {
  const cards = (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-[10px] border border-border-default bg-surface px-[18px] py-3.5"
        >
          <div className="mb-1 text-[14.5px] font-semibold text-fg-primary">
            {item.title}
          </div>
          <p className="text-[13px] leading-relaxed text-fg-secondary">
            {item.body}
          </p>
        </div>
      ))}
    </div>
  );

  if (!framed) return cards;

  return (
    <section className="overflow-hidden rounded-xl border border-border-default border-l-[3px] border-l-brand-600 bg-surface">
      <header className="border-b border-border-default px-4 py-2.5">
        <h3 className="text-sm font-semibold text-fg-primary">{title}</h3>
      </header>
      <div className="p-4">{cards}</div>
    </section>
  );
}
