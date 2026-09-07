import { defaultScope, getFixtureById } from "@/fixtures";
import { buildSucceededRun, computeNextRunAt } from "@/lib/automation-utils";
import { uid } from "@/lib/utils";
import type { Automation } from "@/types";

/** Sample recurring analyses for denser demos when the hub is empty */
export function buildDemoAutomations(): Automation[] {
  const gap = getFixtureById("gap-categories");
  const bb = getFixtureById("bb-off-today");
  const now = Date.now();

  const gapRun = gap
    ? {
        ...buildSucceededRun(gap.answer, "Gap to plan — daily"),
        at: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
        // Leave unviewed so nav badge shows for the away signal
      }
    : null;

  const bbRun = bb
    ? {
        ...buildSucceededRun(bb.answer, "Buy Box — morning check"),
        at: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
        viewedAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
      }
    : null;

  const items: Automation[] = [
    {
      id: uid("auto"),
      name: "Gap to plan — daily",
      question: "Where did we miss plan this month?",
      scope: { ...defaultScope },
      schedule: { freq: "daily", time: "09:00 IST" },
      status: "active",
      notifyInApp: true,
      nextRunAt: computeNextRunAt({ freq: "daily", time: "09:00 IST" }),
      runHistory: gapRun ? [gapRun] : [],
    },
    {
      id: uid("auto"),
      name: "Buy Box — morning check",
      question: "Which SKUs lost Buy Box today?",
      scope: { ...defaultScope, brand: "Aurelle" },
      schedule: {
        freq: "weekly",
        time: "08:00 IST",
        days: ["Mon", "Wed", "Fri"],
      },
      status: "active",
      notifyInApp: true,
      nextRunAt: computeNextRunAt({
        freq: "weekly",
        time: "08:00 IST",
        days: ["Mon", "Wed", "Fri"],
      }),
      runHistory: bbRun ? [bbRun] : [],
    },
  ];

  return items;
}
