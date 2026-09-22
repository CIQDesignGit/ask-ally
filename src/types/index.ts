/** Core data contracts for the Ally prototype (build spec §5). */

export interface ScopeContext {
  retailer: string;
  /** Brand filter — "All brands" means portfolio-wide */
  brand: string;
  taxonomyPath: string[];
  tier: "business" | "brand" | "category" | "sku" | "issue";
  skuIds?: string[];
  period: { label: string; start: string; end: string };
  comparison: "vs_plan" | "vs_prior_period" | "vs_prior_year";
  asOf: string;
  stale?: { source: string; hoursOld: number };
}

export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  scope: ScopeContext;
  turns: Turn[];
  pinned?: boolean;
  /** Optional breadcrumb trail of taxonomy jumps within the thread */
  breadcrumb?: string[];
}

export interface AttachmentMeta {
  name: string;
  sizeKb: number;
}

export interface Turn {
  id: string;
  role: "user" | "ally" | "system";
  createdAt: string;
  input?: string;
  attachments?: AttachmentMeta[];
  answer?: AnswerPayload;
  /** Present while Ally is still processing this turn */
  thinking?: ThinkingState;
  feedback?: { sentiment: "up" | "down"; reason?: string; note?: string };
  /** Disambiguation-only turn (no full answer yet) */
  disambiguation?: {
    question: string;
    options: string[];
  };
}

export interface ThinkingStep {
  id: string;
  label: string;
  status: "pending" | "scanning" | "done";
}

export interface ThinkingState {
  steps: ThinkingStep[];
  done: boolean;
}

export type VisualBlock =
  | { kind: "bridge"; steps: { label: string; value: number }[] }
  | {
      kind: "rankedBars";
      items: {
        label: string;
        value: number;
        confidence: "high" | "medium" | "low";
      }[];
    }
  | { kind: "sparkline"; points: number[]; label: string }
  | { kind: "heatStrip"; days: { date: string; state: "ok" | "issue" }[] }
  | {
      kind: "statusBoard";
      groups: {
        status: "clean" | "attention" | "unplanned";
        items: string[];
      }[];
    };

/** Cell tone for delta / status coloring in answer tables */
export type CellTone = "positive" | "negative" | "neutral" | "warning";

export type TableCellValue =
  | string
  | number
  | {
      text: string;
      tone?: CellTone;
      /** Render as a status pill (Missed / Met) */
      badge?: boolean;
    };

export interface AnswerTableData {
  columns: string[];
  rows: TableCellValue[][];
  /** primary = always open; secondary = collapsible */
  emphasis?: "primary" | "secondary";
  /** Pin first column when table is wide */
  stickyFirstColumn?: boolean;
  /**
   * Show only the first N rows; rest behind an expand control.
   * Matches progressive disclosure in gap-to-plan answers.
   */
  previewRows?: number;
  /** Label for the expand control, e.g. "3 more categories · minor variance" */
  expandLabel?: string;
  /**
   * When set, expand shows this list instead of remaining table rows
   * (matches ranked-leaderboard accordion in RCA mock).
   * Optional actual/plan numbers drive TargetProgressBar (actual vs plan).
   */
  expandItems?: Array<{
    label: string;
    value: string;
    /** Actual sales in thousands (e.g. 86 → $86K) */
    actual?: number;
    /** Plan target in thousands */
    plan?: number;
  }>;
  /** Per-row background: highlight misses in soft red */
  rowHighlight?: Array<"negative" | "positive" | "none" | undefined>;
}

export interface ScorecardTile {
  label: string;
  value: string;
  delta?: string;
  direction?: "up" | "down";
  /** Larger hero tile — use for the single most important number */
  featured?: boolean;
  /** Equal-trio styles: danger = soft red fill (Gap card in mock) */
  variant?: "default" | "danger" | "success";
}

export interface CompareStripRow {
  label: string;
  prior: string;
  current: string;
  delta: string;
  tone?: CellTone;
}

export type SeverityLevel =
  | "clean"
  | "attention"
  | "broken"
  | "unplanned"
  | "info";

export interface SeverityGroupData {
  level: SeverityLevel;
  title: string;
  summary?: string;
  /** Expand by default (attention / broken usually true) */
  defaultExpanded?: boolean;
  table?: AnswerTableData;
}

export interface InsightCalloutData {
  title: string;
  body: string;
  tone?: "neutral" | "brand" | "warning" | "success";
}

export interface ActionLogRow {
  action: string;
  owner: string;
  date: string;
  result: string;
  status: "done" | "mixed" | "waiting" | "failed";
}

/** Collapsible scorecard + table block used in gap-to-plan report */
export interface AnalysisPanelData {
  title: string;
  tiles: ScorecardTile[];
  table: AnswerTableData;
  /** Footnote under the table */
  footer?: string;
  defaultExpanded?: boolean;
}

export type IssueStatusTone = "danger" | "warning" | "neutral" | "success";

export interface IssueBreakdownItem {
  title: string;
  body: string;
  statusLabel?: string;
  statusTone?: IssueStatusTone;
  defaultExpanded?: boolean;
}

export interface TrendSeriesPoint {
  label: string;
  actual: number;
  plan: number;
}

export interface WeeklyNote {
  /** Week start label, e.g. "Jul 12" */
  date: string;
  /** Bold lead metrics line */
  summary: string;
  body: string;
}

export interface ActionRecommendation {
  title: string;
  body: string;
}

/**
 * Fixed Gap to Plan analysis report template
 * (structure mirrors alerts-V2 FullRcaReport).
 * Used when the user asks “Run Gap to plan analysis for …”.
 *
 * Every figure carries a numeric sibling so the UI can encode magnitude
 * as bars instead of printing another wall of numbers.
 */
export type GapToPlanScopeLevel = "overall" | "brand" | "category" | "sku";

export type GapTone = "positive" | "negative" | "neutral";

/** Headline verdict — the numbers that earn the largest type on screen */
export interface GapToPlanVerdict {
  gapValue: string;
  gapDirection: "up" | "down";
  attainmentPct: number;
  actualValue: string;
  planValue: string;
  /** Week-over-week movement, e.g. “Narrowed $1.55M from −$2.7M” */
  changeNote?: string;
  changeTone?: GapTone;
}

/** Two offsetting populations rendered as one diverging bar */
export interface GapSplit {
  label: string;
  left: { label: string; value: string; magnitude: number };
  right: { label: string; value: string; magnitude: number };
}

export interface GapPeriodRow {
  label: string;
  caption?: string;
  actual: string;
  plan: string;
  gap: string;
  attainment?: string;
  /** Drives the bar; omit with `pending` for in-flight weeks */
  actualValue?: number;
  planValue?: number;
  pending?: boolean;
}

export interface GapDriverContribution {
  label: string;
  value: string;
  /** Signed dollar impact — drives the diverging bar */
  impact: number;
  note?: string;
}

export interface GapDriverMetric {
  label: string;
  prior: string;
  current: string;
  delta: string;
  tone?: GapTone;
}

export interface GapIssueItem {
  title: string;
  body: string;
  value?: string;
  /** Absolute dollars — drives the inline magnitude bar */
  magnitude?: number;
  /** Streak / context line, e.g. “8 weeks behind” */
  meta?: string;
  statusLabel?: string;
  statusTone?: IssueStatusTone;
}

/** One week in the trend log — collapsed to a single row until opened */
export interface GapWeekNote {
  date: string;
  actual: string;
  plan: string;
  gap: string;
  tone?: GapTone;
  body: string;
}

export interface GapToPlanReportData {
  title: string;
  subtitle: string;
  level?: GapToPlanScopeLevel;
  verdict: GapToPlanVerdict;
  /** Offsetting SKU populations behind the net gap */
  split?: GapSplit;
  planVsActual: {
    title?: string;
    /** Shown on the collapsed row so it stays useful closed */
    summary?: string;
    rows: GapPeriodRow[];
    footer?: string;
  };
  drivers: {
    title?: string;
    summary?: string;
    contributions: GapDriverContribution[];
    metrics: GapDriverMetric[];
    footer?: string;
  };
  issues: {
    title?: string;
    summary?: string;
    items: GapIssueItem[];
  };
  trend: {
    title?: string;
    summary?: string;
    points: TrendSeriesPoint[];
    actualLabel?: string;
    planLabel?: string;
    notes?: GapWeekNote[];
  };
  recommendations: {
    title?: string;
    summary?: string;
    items: ActionRecommendation[];
  };
}

/** Composable rich sections inside an Ally answer */
export type AnswerSection =
  | {
      id: string;
      kind: "scorecard";
      title?: string;
      tiles: ScorecardTile[];
    }
  | {
      id: string;
      kind: "table";
      title?: string;
      table: AnswerTableData;
    }
  | {
      id: string;
      kind: "compareStrip";
      title?: string;
      priorLabel?: string;
      currentLabel?: string;
      rows: CompareStripRow[];
    }
  | {
      id: string;
      kind: "severityGroup";
      title?: string;
      groups: SeverityGroupData[];
    }
  | {
      id: string;
      kind: "callout";
      callout: InsightCalloutData;
    }
  | {
      id: string;
      /** Plain insight paragraph between metrics and table */
      kind: "narrative";
      title?: string;
      body: string;
    }
  | {
      id: string;
      kind: "visual";
      title?: string;
      visual: VisualBlock;
    }
  | {
      id: string;
      kind: "actionLog";
      title?: string;
      rows: ActionLogRow[];
    }
  | {
      id: string;
      kind: "changeLog";
      campaign: string;
      metricLabel: string;
      fromValue: string;
      toValue: string;
      meta: string[];
    }
  | {
      id: string;
      kind: "recommendationCards";
      cards: {
        variant: "recommended" | "alternative";
        title: string;
        body: string;
      }[];
    }
  | {
      id: string;
      kind: "weekdayPattern";
      body: string;
      caption: string;
      /** Heights 0–100 for Mon–Sun; highlight flags which days are “hot” */
      days: { label: string; height: number; hot?: boolean }[];
    }
  | {
      id: string;
      kind: "checklist";
      items: {
        title: string;
        detail: string;
        statusLabel: string;
        statusTone: "warning" | "danger" | "neutral";
      }[];
    }
  | {
      id: string;
      kind: "dashboardPreview";
      title?: string;
      widgets: { name: string; description: string }[];
      openLabel?: string;
    }
  | {
      id: string;
      /** Gap-to-plan supporting analysis accordion (metrics + table + footer) */
      kind: "analysisPanel";
      panel: AnalysisPanelData;
    }
  | {
      id: string;
      kind: "issueBreakdown";
      title?: string;
      items: IssueBreakdownItem[];
    }
  | {
      id: string;
      kind: "trendChart";
      title?: string;
      points: TrendSeriesPoint[];
      actualLabel?: string;
      planLabel?: string;
    }
  | {
      id: string;
      kind: "weeklyNotes";
      notes: WeeklyNote[];
    }
  | {
      id: string;
      /** Plain action cards (no Recommended/Alternative badges) */
      kind: "actionRecommendations";
      title?: string;
      items: ActionRecommendation[];
    };

export interface AnswerPayload {
  scopeLine: string;
  headline: { value: string; delta?: string; direction?: "up" | "down" };
  why: string[];
  /**
   * Dedicated Gap to Plan analysis report.
   * When set, AgentMessage renders GapToPlanReport (fixed structure)
   * instead of generic AnswerSections. `why` becomes the Key finding.
   */
  gapToPlanReport?: GapToPlanReportData;
  /**
   * @deprecated Prefer gapToPlanReport.title — kept for transitional fixtures
   */
  reportTitle?: string;
  /** @deprecated Prefer gapToPlanReport.subtitle */
  reportSubtitle?: string;
  visual?: VisualBlock;
  /** Legacy single table — prefer sections[].kind === "table" for new fixtures */
  table?: { columns: string[]; rows: (string | number)[][] };
  /** Rich multi-section layout (preferred for new conversation templates) */
  sections?: AnswerSection[];
  assumptionFlags?: { label: string; detail: string }[];
  recommendation?: {
    options: { label: string; outcome: string; tradeoff?: string }[];
  };
  followups: { type: "drill" | "pivot"; label: string; nextTurnId?: string }[];
  sources?: { label: string; refId: string }[];
  /** File grounding echo-back (trust beat) */
  interpretationEcho?: InterpretationEcho;
  /** Deck outline flow */
  deckOutline?: { slides: string[] };
  /** Opens automation config when true */
  automationDraft?: AutomationDraft;
}

export interface InterpretationEcho {
  fileName: string;
  mappings: { column: string; field: string }[];
  matchedRows: number;
  unmatchedRows: number;
  unmatchedReasons: string[];
}

export interface AutomationDraft {
  name: string;
  checkDefinition: string;
  schedule: { freq: "daily" | "weekly"; time: string; days?: string[] };
  threshold: string;
  channels: ("in_app" | "email" | "slack")[];
  recipients: string[];
  repeatPolicy: "notify_once_then_on_change" | "always_notify";
  backtestSummary: string;
}

export interface KnownPreference {
  id: string;
  label: string;
  value: string;
  source: string;
  editable: true;
}

export interface AutomationSchedule {
  freq: "daily" | "weekly";
  time: string;
  days?: string[];
}

/** One scheduled (or manual) execution of a recurring analysis */
export interface AutomationRun {
  id: string;
  at: string;
  status: "succeeded" | "failed";
  summary: string;
  viewedAt?: string;
  answer?: AnswerPayload;
}

export interface AutomationCreateInput {
  name: string;
  question: string;
  scope: ScopeContext;
  schedule: AutomationSchedule;
  notifyInApp?: boolean;
  sourceThreadId?: string;
}

/** Recurring analysis Ally re-runs on a schedule */
export interface Automation {
  id: string;
  name: string;
  question: string;
  scope: ScopeContext;
  schedule: AutomationSchedule;
  status: "active" | "paused";
  notifyInApp: boolean;
  nextRunAt?: string;
  runHistory: AutomationRun[];
  sourceThreadId?: string;
  /** @deprecated alert-era fields kept optional for chat draft activation */
  checkDefinition?: string;
  threshold?: string;
  channels?: ("in_app" | "email" | "slack")[];
  recipients?: string[];
  repeatPolicy?: "notify_once_then_on_change" | "always_notify";
}

/** Fixture entry the runner pattern-matches against */
export interface FixtureEntry {
  id: string;
  /** Keywords / phrases that match this fixture (lowercase) */
  match: string[];
  /** Named thinking steps shown before the answer */
  thinkingSteps: string[];
  answer: AnswerPayload;
  /** Optional scope overrides applied when this fixture runs */
  scopePatch?: Partial<ScopeContext>;
  /** Breadcrumb segments to append */
  breadcrumbAppend?: string[];
  /** Variant used by re-run (e.g. "current" vs "prior") */
  periodVariant?: "prior" | "current";
  /** If set, reply with disambiguation instead of a full answer */
  disambiguation?: {
    question: string;
    options: string[];
  };
}

export interface SuggestedQuestionGroup {
  label: string;
  questions: string[];
}
