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
  feedback?: {
    sentiment: "up" | "down";
    /** Tag chip values from FeedbackForm (e.g. accurate, clear) */
    tags?: string[];
    reason?: string;
    note?: string;
    /** True after Share Feedback or Skip */
    submitted?: boolean;
  };
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
 * Fixed Gap to Plan analysis report template.
 * Layout matches the design reference:
 *   ANALYSIS header → narrative → 8-week trend → plan vs drivers
 *   → brand gap cards → numbered recommendations.
 */
export type GapToPlanScopeLevel = "overall" | "brand" | "category" | "sku";

export type GapTone = "positive" | "negative" | "neutral";

/** Headline verdict — kept for persistence migration */
export interface GapToPlanVerdict {
  gapValue: string;
  gapDirection: "up" | "down";
  attainmentPct: number;
  actualValue: string;
  planValue: string;
  changeNote?: string;
  changeTone?: GapTone;
}

/** One week card in “Plan vs actual → what drove it” */
export interface GapPeriodRow {
  label: string;
  caption?: string;
  actual: string;
  plan: string;
  gap: string;
  attainment?: string;
  actualValue?: number;
  planValue?: number;
  pending?: boolean;
  /** Purple ring — focal week that fans into drivers */
  featured?: boolean;
}

export interface GapDriverInsight {
  title: string;
  body: string;
  tone: "positive" | "negative";
}

export interface GapDriverCard {
  id: string;
  label: string;
  /** e.g. "+0.8%" */
  pctChange: string;
  direction: "up" | "down";
  lastWeek: string;
  prevWeek: string;
  /** e.g. "+$231K" */
  revenueImpact: string;
  impactTone: "positive" | "negative";
  insights: GapDriverInsight[];
  net: string;
}

export interface GapBrandCard {
  value: string;
  tone: GapTone;
  meta: string;
  title: string;
  body: string;
}

export interface GapToPlanReportData {
  title: string;
  subtitle: string;
  level?: GapToPlanScopeLevel;
  verdict: GapToPlanVerdict;
  /** 8-week revenue trend (shown first after narrative) */
  trend: {
    title?: string;
    subtitle?: string;
    points: TrendSeriesPoint[];
    /** Index of first week in the “Compared below” highlight */
    comparedFromIndex?: number;
    endLabels?: { plan: string; actual: string };
  };
  /** Week cards + Traffic / Conversion / Price driver columns */
  planVsDrivers: {
    title?: string;
    subtitle?: string;
    narrative: string;
    weeks: GapPeriodRow[];
    drivers: GapDriverCard[];
  };
  brands: {
    title?: string;
    summary: string;
    items: GapBrandCard[];
  };
  recommendations: {
    title?: string;
    items: ActionRecommendation[];
  };
}

/** @deprecated Legacy helpers — GapToPlanPanels / DriverFlow */
export interface GapSplit {
  label: string;
  left: { label: string; value: string; magnitude: number };
  right: { label: string; value: string; magnitude: number };
}
export interface GapDriverContribution {
  label: string;
  value: string;
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
  magnitude?: number;
  meta?: string;
  statusLabel?: string;
  statusTone?: IssueStatusTone;
}
export interface GapWeekNote {
  date: string;
  actual: string;
  plan: string;
  gap: string;
  tone?: GapTone;
  body: string;
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
