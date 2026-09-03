import { Clock } from "lucide-react";

interface ChangeLogCardProps {
  campaign: string;
  metricLabel: string;
  fromValue: string;
  toValue: string;
  meta: string[];
}

/** Campaign change block from RCA mock (budget cut log). */
export function ChangeLogCard({
  campaign,
  metricLabel,
  fromValue,
  toValue,
  meta,
}: ChangeLogCardProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[10px] border border-slate-100 bg-slate-50 px-[18px] py-4">
      <div className="flex items-center gap-2.5">
        <Clock className="size-4 shrink-0 text-brand-600" aria-hidden />
        <span className="font-mono text-[13px] font-semibold text-fg-primary">
          {campaign}
        </span>
        <span className="text-xs text-fg-tertiary">{metricLabel}</span>
      </div>
      <div className="flex items-baseline gap-2.5 pl-[26px]">
        <span className="text-lg font-semibold text-red-700 line-through">
          {fromValue}
        </span>
        <span className="text-fg-tertiary">→</span>
        <span className="text-lg font-bold text-fg-primary">{toValue}</span>
      </div>
      {meta.map((line) => (
        <div
          key={line}
          className="pl-[26px] text-[12.5px] leading-snug text-fg-tertiary"
        >
          {line}
        </div>
      ))}
    </div>
  );
}
