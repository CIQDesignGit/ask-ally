import type {
  AnswerPayload,
  Automation,
  AutomationRun,
  AutomationSchedule,
  ScopeContext,
} from "@/types";

import { uid } from "./utils";

// Avoid circular import from fixtures — inline a minimal fallback
const FALLBACK_SCOPE: ScopeContext = {
  retailer: "Amazon US",
  brand: "All brands",
  taxonomyPath: ["All categories"],
  tier: "business",
  period: { label: "Aug 1–31, 2026", start: "2026-08-01", end: "2026-08-31" },
  comparison: "vs_plan",
  asOf: "2026-09-01T08:00:00Z",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function formatSchedule(schedule: AutomationSchedule): string {
  const freqLabel = schedule.freq === "daily" ? "Daily" : "Weekly";
  if (schedule.freq === "weekly" && schedule.days?.length) {
    return `${freqLabel} (${schedule.days.join(", ")}) · ${schedule.time}`;
  }
  return `${freqLabel} · ${schedule.time}`;
}

export function suggestAutomationName(question: string): string {
  const words = question.trim().split(/\s+/).filter(Boolean).slice(0, 6);
  if (!words.length) return "Recurring analysis";
  const base = words.join(" ");
  return base.length < question.trim().length ? `${base}…` : base;
}

export function computeNextRunAt(
  schedule: AutomationSchedule,
  from = new Date()
): string {
  const next = new Date(from);
  if (schedule.freq === "daily") {
    next.setDate(next.getDate() + 1);
  } else {
    const targetDays = (schedule.days?.length
      ? schedule.days
      : ["Mon"]
    ).map((d) => WEEKDAYS.indexOf(d as (typeof WEEKDAYS)[number]));
    const valid = targetDays.filter((i) => i >= 0);
    const targets = valid.length ? valid : [0];
    // JS: Sun=0 … Sat=6; our WEEKDAYS Mon=0 … Sun=6
    const jsToWeekIdx = (js: number) => (js === 0 ? 6 : js - 1);
    let best: Date | null = null;
    for (let add = 1; add <= 8; add++) {
      const candidate = new Date(from);
      candidate.setDate(candidate.getDate() + add);
      if (targets.includes(jsToWeekIdx(candidate.getDay()))) {
        best = candidate;
        break;
      }
    }
    if (best) {
      next.setTime(best.getTime());
    } else {
      next.setDate(next.getDate() + 7);
    }
  }
  return next.toISOString();
}

export function formatScopeLine(scope: {
  retailer: string;
  brand?: string;
  taxonomyPath: string[];
  period: { label: string };
}): string {
  const category =
    !scope.taxonomyPath.length || scope.taxonomyPath[0] === "All categories"
      ? "All categories"
      : scope.taxonomyPath[scope.taxonomyPath.length - 1]!;
  return [
    scope.retailer,
    scope.brand || "All brands",
    category,
    scope.period.label,
  ].join(" · ");
}

export function unreadRunCount(automation: Automation): number {
  if (!automation.notifyInApp) return 0;
  return automation.runHistory.filter((r) => !r.viewedAt).length;
}

export function totalUnreadRuns(automations: Automation[]): number {
  return automations.reduce((n, a) => n + unreadRunCount(a), 0);
}

export function sortAutomations(automations: Automation[]): Automation[] {
  return [...automations].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "active" ? -1 : 1;
    }
    const aAt = a.runHistory[0]?.at ?? a.nextRunAt ?? "";
    const bAt = b.runHistory[0]?.at ?? b.nextRunAt ?? "";
    return bAt.localeCompare(aAt);
  });
}

export function summaryFromAnswer(answer: AnswerPayload, fallback: string): string {
  if (answer.headline?.value) {
    return answer.headline.delta
      ? `${answer.headline.value} · ${answer.headline.delta}`
      : answer.headline.value;
  }
  if (answer.why?.[0]) return answer.why[0];
  return fallback;
}

export function buildSucceededRun(
  answer: AnswerPayload,
  name: string
): AutomationRun {
  return {
    id: uid("run"),
    at: new Date().toISOString(),
    status: "succeeded",
    summary: summaryFromAnswer(answer, `Report ready for “${name}”`),
    answer,
  };
}

/** Normalize persisted alert-era automations into the recurring-analysis shape */
export function normalizeAutomation(raw: Record<string, unknown>): Automation {
  const schedule = (raw.schedule as AutomationSchedule) ?? {
    freq: "daily" as const,
    time: "09:00 IST",
  };
  const question =
    (raw.question as string) ||
    (raw.checkDefinition as string) ||
    (raw.name as string) ||
    "Recurring analysis";

  const legacyHistory = (raw.runHistory as Array<Record<string, unknown>>) ?? [];
  const runHistory: AutomationRun[] = legacyHistory.map((r) => {
    if (r.id && (r.status === "succeeded" || r.status === "failed")) {
      return r as unknown as AutomationRun;
    }
    const result = r.result as string | undefined;
    const status: AutomationRun["status"] =
      result === "failed" ? "failed" : "succeeded";
    return {
      id: uid("run"),
      at: (r.at as string) ?? new Date().toISOString(),
      status,
      summary: (r.summary as string) ?? "Prior run",
      viewedAt: (r.viewedAt as string) ?? (r.at as string),
      answer: r.answer as AnswerPayload | undefined,
    };
  });

  return {
    id: (raw.id as string) ?? uid("auto"),
    name: (raw.name as string) ?? "Untitled automation",
    question,
    scope: (raw.scope as Automation["scope"]) ?? FALLBACK_SCOPE,
    schedule,
    status: raw.status === "paused" ? "paused" : "active",
    notifyInApp:
      typeof raw.notifyInApp === "boolean"
        ? raw.notifyInApp
        : Array.isArray(raw.channels)
          ? (raw.channels as string[]).includes("in_app")
          : true,
    nextRunAt:
      (raw.nextRunAt as string) ??
      (raw.status === "paused" ? undefined : computeNextRunAt(schedule)),
    runHistory,
    sourceThreadId: raw.sourceThreadId as string | undefined,
    checkDefinition: raw.checkDefinition as string | undefined,
    threshold: raw.threshold as string | undefined,
    channels: raw.channels as Automation["channels"],
    recipients: raw.recipients as string[] | undefined,
    repeatPolicy: raw.repeatPolicy as Automation["repeatPolicy"],
  };
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
