interface RecommendationCardsProps {
  cards: {
    variant: "recommended" | "alternative";
    title: string;
    body: string;
  }[];
}

/** Recommended + alternative action cards from RCA campaign mock. */
export function RecommendationCards({ cards }: RecommendationCardsProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {cards.map((card) => {
        const isRec = card.variant === "recommended";
        return (
          <div
            key={card.title}
            className={
              isRec
                ? "rounded-[10px] border-[1.5px] border-brand-600 bg-violet-50 px-[18px] py-4"
                : "rounded-[10px] border border-border-default bg-surface px-[18px] py-4"
            }
          >
            <div
              className={
                isRec
                  ? "mb-2 inline-block rounded-[5px] bg-brand-600 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-white"
                  : "mb-2 inline-block rounded-[5px] bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-fg-secondary"
              }
            >
              {isRec ? "Recommended" : "Alternative"}
            </div>
            <div className="mb-1 text-[14.5px] font-semibold text-fg-primary">
              {card.title}
            </div>
            <div className="text-[13px] leading-relaxed text-fg-secondary">
              {card.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}
