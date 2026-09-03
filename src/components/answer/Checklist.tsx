import { Square } from "lucide-react";

interface ChecklistProps {
  items: {
    title: string;
    detail: string;
    statusLabel: string;
    statusTone: "warning" | "danger" | "neutral";
  }[];
}

const statusClass = {
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-600",
  neutral: "bg-slate-100 text-fg-secondary",
} as const;

/** Action checklist rows from chronic Buy Box RCA mock. */
export function Checklist({ items }: ChecklistProps) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-100">
      {items.map((item, i) => (
        <div
          key={item.title}
          className={`flex items-center gap-3 px-4 py-3.5 ${
            i % 2 === 1 ? "bg-slate-50" : "bg-surface"
          }`}
        >
          <Square
            className="size-[18px] shrink-0 text-slate-300"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-medium text-fg-primary">
              {item.title}
            </div>
            <div className="text-[12.5px] text-fg-tertiary">{item.detail}</div>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${statusClass[item.statusTone]}`}
          >
            {item.statusLabel}
          </span>
        </div>
      ))}
    </div>
  );
}
