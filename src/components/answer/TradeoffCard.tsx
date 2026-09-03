interface TradeoffCardProps {
  options: { label: string; outcome: string; tradeoff?: string }[];
}

export function TradeoffCard({ options }: TradeoffCardProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.slice(0, 2).map((opt) => (
        <div
          key={opt.label}
          className="rounded-xl border border-border-default bg-surface p-3 shadow-xs"
        >
          <div className="text-sm font-semibold text-fg-primary">{opt.label}</div>
          <p className="mt-1 text-xs text-fg-secondary">{opt.outcome}</p>
          {opt.tradeoff && (
            <p className="mt-2 border-t border-border-default pt-2 text-xs text-fg-tertiary">
              Trade-off: {opt.tradeoff}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
