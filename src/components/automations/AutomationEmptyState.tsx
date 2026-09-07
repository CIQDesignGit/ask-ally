import { Badge, Button } from "@ciq-dev/ciq-design-system";
import {
  Bell,
  CalendarClock,
  ChartNoAxesCombined,
  ClipboardList,
  ShoppingCart,
  ShieldAlert,
} from "lucide-react";

import { defaultScope } from "@/fixtures";
import type { AutomationCreateInput, AutomationSchedule } from "@/types";

export interface AutomationTemplate {
  id: string;
  name: string;
  question: string;
  benefit: string;
  schedule: AutomationSchedule;
  scopeLabel: string;
  sampleSummary: string;
  icon: typeof ChartNoAxesCombined;
  toCreateInput: () => AutomationCreateInput;
}

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: "gap-daily",
    name: "Gap to plan — daily",
    question: "Where did we miss plan this month?",
    benefit: "Morning report before standup — even if you’re offline.",
    schedule: { freq: "daily", time: "09:00 IST" },
    scopeLabel: "Amazon US · All brands",
    sampleSummary: "Beauty −$1.2M vs plan · 3 categories need attention",
    icon: ChartNoAxesCombined,
    toCreateInput: () => ({
      name: "Gap to plan — daily",
      question: "Where did we miss plan this month?",
      scope: { ...defaultScope },
      schedule: { freq: "daily", time: "09:00 IST" },
      notifyInApp: true,
    }),
  },
  {
    id: "bb-morning",
    name: "Buy Box — morning check",
    question: "Which SKUs lost Buy Box today?",
    benefit: "Catch ownership losses early, three mornings a week.",
    schedule: {
      freq: "weekly",
      time: "08:00 IST",
      days: ["Mon", "Wed", "Fri"],
    },
    scopeLabel: "Amazon US · Aurelle",
    sampleSummary: "12 SKUs lost Buy Box · 4 high-velocity",
    icon: ShoppingCart,
    toCreateInput: () => ({
      name: "Buy Box — morning check",
      question: "Which SKUs lost Buy Box today?",
      scope: { ...defaultScope, brand: "Aurelle" },
      schedule: {
        freq: "weekly",
        time: "08:00 IST",
        days: ["Mon", "Wed", "Fri"],
      },
      notifyInApp: true,
    }),
  },
  {
    id: "map-daily",
    name: "MAP compliance — daily",
    question: "Alert me if MAP breaks again",
    benefit: "Same MAP check every day; full table waits in this hub.",
    schedule: { freq: "daily", time: "07:00 IST" },
    scopeLabel: "Amazon US · MAP file scope",
    sampleSummary: "5 offers under MAP · Diaper Rash Cream $0.34 under",
    icon: ShieldAlert,
    toCreateInput: () => ({
      name: "MAP compliance — daily",
      question: "Alert me if MAP breaks again",
      scope: { ...defaultScope },
      schedule: { freq: "daily", time: "07:00 IST" },
      notifyInApp: true,
    }),
  },
];

const HOW_IT_WORKS = [
  {
    icon: ClipboardList,
    title: "Pick an analysis",
    body: "Reuse a past chat answer or write the question you keep asking.",
  },
  {
    icon: CalendarClock,
    title: "Set a schedule",
    body: "Daily or weekly — Ally re-runs it whether you’re here or not.",
  },
  {
    icon: Bell,
    title: "Read reports here",
    body: "Each run lands as a full report in this hub, with an unread badge.",
  },
] as const;

function formatScheduleShort(schedule: AutomationSchedule): string {
  if (schedule.freq === "weekly" && schedule.days?.length) {
    return `Weekly · ${schedule.days.join(", ")} · ${schedule.time}`;
  }
  return `Daily · ${schedule.time}`;
}

interface AutomationEmptyStateProps {
  onStartFromScratch: () => void;
  onUseTemplate: (template: AutomationTemplate) => void;
}

/**
 * Onboarding empty state — example gallery + how-it-works.
 * Cards are interactive (templates), not decorative chrome.
 */
export function AutomationEmptyState({
  onStartFromScratch,
  onUseTemplate,
}: AutomationEmptyStateProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-4xl flex-col px-6 py-8 sm:py-10">
        <header className="max-w-xl">
          <h2 className="text-xl font-semibold tracking-tight text-fg-primary sm:text-2xl">
            Recurring analyses, on autopilot
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
            Save a question and schedule. Ally re-runs it while you’re away and
            leaves each full report here — same depth as chat, without opening
            chat.
          </p>
        </header>

        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-xs font-semibold text-brand-700"
                aria-hidden
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-sm font-medium text-fg-primary">
                  <step.icon
                    className="size-3.5 text-fg-tertiary"
                    aria-hidden
                  />
                  {step.title}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-fg-secondary">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold text-fg-primary">
              Start from an example
            </h3>
            <p className="text-xs text-fg-tertiary">
              Creates a live automation you can edit
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {AUTOMATION_TEMPLATES.map((t) => {
              const Icon = t.icon;
              return (
                <article
                  key={t.id}
                  className="flex flex-col rounded-xl border border-border-default bg-surface p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/30"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-fg-secondary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-fg-primary">
                        {t.name}
                      </h4>
                      <p className="mt-0.5 text-xs text-fg-tertiary">
                        {t.scopeLabel}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-fg-secondary">
                    “{t.question}”
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">
                      {formatScheduleShort(t.schedule)}
                    </Badge>
                  </div>

                  <div className="mt-3 rounded-md bg-surface-muted/80 px-2.5 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-fg-tertiary">
                      Sample report line
                    </p>
                    <p className="mt-0.5 text-xs text-fg-secondary">
                      {t.sampleSummary}
                    </p>
                  </div>

                  <p className="mt-3 flex-1 text-xs text-fg-tertiary">
                    {t.benefit}
                  </p>

                  <Button
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => onUseTemplate(t)}
                  >
                    Use this
                  </Button>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border-default pt-6">
          <Button size="sm" variant="outline" onClick={onStartFromScratch}>
            Start from scratch
          </Button>
          <span className="text-xs text-fg-tertiary">
            Or pick a past chat analysis when you create one.
          </span>
        </div>
      </div>
    </div>
  );
}
