import type { InsightCalloutData } from "@/types";
import { AlertTriangle } from "lucide-react";

const toneClass: Record<
  NonNullable<InsightCalloutData["tone"]>,
  string
> = {
  neutral: "border-border-default bg-surface-muted",
  brand: "border-brand-300 bg-violet-50",
  warning: "border-amber-200 bg-amber-50",
  success: "border-feedback-success-border bg-feedback-success-subtle",
};

interface InsightCalloutProps {
  callout: InsightCalloutData;
}

export function InsightCallout({ callout }: InsightCalloutProps) {
  const tone = callout.tone ?? "neutral";
  const isWarning = tone === "warning";

  return (
    <aside
      className={`flex gap-2.5 rounded-[10px] border px-4 py-3.5 ${toneClass[tone]}`}
      aria-label={callout.title}
    >
      {isWarning ? (
        <AlertTriangle
          className="mt-0.5 size-4 shrink-0 text-amber-700"
          aria-hidden
        />
      ) : null}
      <div>
        {callout.title && !isWarning ? (
          <div className="text-xs font-semibold uppercase tracking-wide text-fg-tertiary">
            {callout.title}
          </div>
        ) : null}
        <p
          className={`text-[13.5px] leading-relaxed ${
            isWarning ? "text-amber-950" : "mt-1 text-fg-primary"
          }`}
        >
          {callout.body}
        </p>
      </div>
    </aside>
  );
}
