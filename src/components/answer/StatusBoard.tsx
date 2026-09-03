import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface StatusBoardProps {
  groups: {
    status: "clean" | "attention" | "unplanned";
    items: string[];
  }[];
}

const meta = {
  clean: {
    label: "Clean",
    icon: CheckCircle2,
    className: "border-feedback-success-border bg-feedback-success-subtle text-feedback-success",
  },
  attention: {
    label: "Needs attention",
    icon: AlertTriangle,
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  unplanned: {
    label: "Unplanned",
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-800",
  },
} as const;

export function StatusBoard({ groups }: StatusBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-xl border border-border-default bg-surface p-3 shadow-xs">
      {(["clean", "attention", "unplanned"] as const).map((key) => {
        const group = groups.find((g) => g.status === key);
        const m = meta[key];
        const Icon = m.icon;
        return (
          <div key={key} className="min-w-0">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-fg-secondary">
              <Icon className="size-3.5" aria-hidden />
              {m.label}
            </div>
            <div className="flex flex-col gap-1.5">
              {(group?.items ?? []).map((item) => (
                <span
                  key={item}
                  className={`inline-flex items-start gap-1 rounded-md border px-2 py-1 text-xs ${m.className}`}
                >
                  <Icon className="mt-0.5 size-3 shrink-0" aria-hidden />
                  {item}
                </span>
              ))}
              {!group?.items?.length && (
                <span className="text-xs text-fg-tertiary">None</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
