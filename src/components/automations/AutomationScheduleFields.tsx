import { cn, Input, Label } from "@ciq-dev/ciq-design-system";

import type { AutomationSchedule } from "@/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const FREQ_OPTIONS = [
  { value: "daily" as const, label: "Daily" },
  { value: "weekly" as const, label: "Weekly" },
];

interface AutomationScheduleFieldsProps {
  schedule: AutomationSchedule;
  onChange: (schedule: AutomationSchedule) => void;
  timeId?: string;
}

export function AutomationScheduleFields({
  schedule,
  onChange,
  timeId = "auto-time",
}: AutomationScheduleFieldsProps) {
  return (
    <div className="space-y-3">
      <div
        role="radiogroup"
        aria-label="Frequency"
        className="inline-flex rounded-lg bg-surface-muted p-1"
      >
        {FREQ_OPTIONS.map((opt) => {
          const selected = schedule.freq === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() =>
                onChange({
                  ...schedule,
                  freq: opt.value,
                  days:
                    opt.value === "weekly"
                      ? schedule.days?.length
                        ? schedule.days
                        : ["Mon"]
                      : undefined,
                })
              }
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-500",
                selected
                  ? "bg-surface text-fg-primary shadow-xs"
                  : "text-fg-secondary hover:text-fg-primary"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {schedule.freq === "weekly" ? (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Days">
          {WEEKDAYS.map((day) => {
            const active = schedule.days?.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  const current = schedule.days ?? [];
                  const next = current.includes(day)
                    ? current.filter((d) => d !== day)
                    : [...current, day];
                  onChange({
                    ...schedule,
                    days: next.length ? next : [day],
                  });
                }}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-500",
                  active
                    ? "bg-brand-600 text-white"
                    : "bg-surface-muted text-fg-secondary hover:text-fg-primary"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="space-y-1">
        <Label htmlFor={timeId}>Time</Label>
        <Input
          id={timeId}
          value={schedule.time}
          onChange={(e) =>
            onChange({ ...schedule, time: e.target.value })
          }
          placeholder="09:00 IST"
        />
      </div>
    </div>
  );
}
