interface BacktestPreviewCardProps {
  summary: string;
}

export function BacktestPreviewCard({ summary }: BacktestPreviewCardProps) {
  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-fg-primary">
      <span className="font-medium">Backtest: </span>
      {summary}
    </div>
  );
}
