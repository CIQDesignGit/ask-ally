interface WeekdayPatternProps {
  body: string;
  caption: string;
  days: { label: string; height: number; hot?: boolean }[];
}

/** Thu–Sun spike bars from chronic Buy Box RCA mock. */
export function WeekdayPattern({ body, caption, days }: WeekdayPatternProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-slate-100 bg-slate-50 px-[18px] py-4">
      <p className="text-[13px] leading-relaxed text-fg-secondary">{body}</p>
      <div className="flex h-[52px] items-end gap-1.5">
        {days.map((d) => (
          <div
            key={d.label}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <div
              className={
                d.hot
                  ? "w-full rounded border border-red-300 bg-red-200"
                  : "w-full rounded bg-slate-200"
              }
              style={{ height: `${Math.max(8, d.height)}%` }}
            />
            <span
              className={
                d.hot
                  ? "text-[10.5px] font-semibold text-red-700"
                  : "text-[10.5px] text-fg-tertiary"
              }
            >
              {d.label}
            </span>
          </div>
        ))}
      </div>
      <div className="text-[11.5px] text-fg-tertiary">{caption}</div>
    </div>
  );
}
