import type {
  AnswerTableData,
  FixtureEntry,
  ScopeContext,
  SuggestedQuestionGroup,
  TableCellValue,
} from "@/types";

/** Helper: negative delta cell */
function neg(text: string): TableCellValue {
  return { text, tone: "negative" };
}
function pos(text: string): TableCellValue {
  return { text, tone: "positive" };
}
function warn(text: string): TableCellValue {
  return { text, tone: "warning" };
}

/** Default scope shown in the empty state */
export const defaultScope: ScopeContext = {
  retailer: "Amazon US",
  brand: "All brands",
  taxonomyPath: ["All categories"],
  tier: "business",
  period: {
    label: "Week 34 (Aug 17–23)",
    start: "2026-08-17",
    end: "2026-08-23",
  },
  comparison: "vs_plan",
  asOf: "2026-08-29T23:00:00-07:00",
};

export const currentPeriodScope: ScopeContext = {
  ...defaultScope,
  period: {
    label: "Week 35 (Aug 24–30)",
    start: "2026-08-24",
    end: "2026-08-30",
  },
  asOf: "2026-09-01T08:00:00-07:00",
};

export const suggestedQuestionGroups: SuggestedQuestionGroup[] = [
  {
    label: "Gap to plan analysis",
    questions: [
      "Which categories did not meet last week's plan?",
      "Run Gap to plan analysis for the entire portfolio",
      "Which SKUs did not meet the plan for the last 6 weeks?",
    ],
  },
  {
    label: "Period-over-period analysis",
    questions: [
      "Do a week-on-week analysis for the entire portfolio",
      "How is this week trending for the hair care category?",
      "Do a July vs Aug analysis for the baby care category.",
    ],
  },
  {
    label: "Store health",
    questions: [
      "Which important SKUs are out of stock or about to go out of stock?",
      "Give me the list of SKUs not on Buy Box today",
      "Are the promotions running as planned?",
    ],
  },
];

const categoryGapTable: AnswerTableData = {
  emphasis: "primary",
  previewRows: 3,
  expandLabel: "3 more categories · minor variance, −$30K combined",
  expandItems: [
    { label: "Oral Care", value: "−$14K vs plan", actual: 86, plan: 100 },
    { label: "Feminine Care", value: "−$11K vs plan", actual: 79, plan: 90 },
    { label: "Sun Care", value: "−$5K vs plan", actual: 45, plan: 50 },
  ],
  rowHighlight: ["negative", "negative", "none"],
  columns: ["Category", "Actual", "Plan", "Gap", "Status"],
  rows: [
    [
      "Skin Care",
      "$612K",
      "$750K",
      neg("−$138K"),
      { text: "Missed", tone: "negative", badge: true },
    ],
    [
      "Baby Care",
      "$481K",
      "$593K",
      neg("−$112K"),
      { text: "Missed", tone: "negative", badge: true },
    ],
    [
      "Hair Care",
      "$398K",
      "$390K",
      pos("+$8K"),
      { text: "Met", tone: "positive", badge: true },
    ],
  ],
};

/** Conv 1 · Turn 1 — categories missed plan */
export const gapCategories: FixtureEntry = {
  id: "gap-categories",
  match: [
    "which categories did not meet",
    "categories did not meet last week's plan",
    "gap to plan analysis for the entire portfolio",
    "missing plan",
    "gap to plan",
    "run gap to plan",
  ],
  thinkingSteps: [
    "Loading Week 34 attainment vs plan",
    "Ranking categories by absolute dollar gap",
    "Tagging likely drivers per category",
  ],
  answer: {
    scopeLine:
      "Amazon US · Week 34 (Aug 17–23) vs plan · data through Aug 29, 11:00 PM PT",
    headline: {
      value: "−$280K",
      delta: "−6.1% vs plan",
      direction: "down",
    },
    // Single lead line = mock headline (supporting insight lives in sections)
    why: [
      "5 of 6 categories missed plan. The portfolio did $4.32M against a $4.60M plan — short by $280K (−6.1%).",
    ],
    sections: [
      {
        id: "gap-score",
        kind: "scorecard",
        tiles: [
          { label: "Actual", value: "$4.32M" },
          { label: "Plan", value: "$4.60M" },
          {
            label: "Gap",
            value: "−$280K",
            delta: "−6.1%",
            direction: "down",
            variant: "danger",
          },
        ],
      },
      {
        id: "gap-insight",
        kind: "narrative",
        body: "Two categories account for 89% of the miss — Skin Care and Baby Care are $250K of the $280K gap. The other three misses are small enough that I'd leave them alone this week.",
      },
      {
        id: "gap-table",
        kind: "table",
        // Untitled — still framed in SectionCard via AnswerTable (framed default)
        table: categoryGapTable,
      },
    ],
    followups: [
      {
        type: "drill",
        label: "Why did Skin Care miss by $138K?",
        nextTurnId: "skin-care-drivers",
      },
      {
        type: "drill",
        label: "Show me the SKUs driving the Baby Care gap",
        nextTurnId: "baby-care-availability",
      },
      {
        type: "pivot",
        label: "How did these categories do vs last week rather than vs plan?",
        nextTurnId: "wow-portfolio",
      },
      {
        type: "pivot",
        label: "What did Hair Care do right? Can we copy it?",
        nextTurnId: "wow-portfolio",
      },
    ],
    sources: [
      { label: "Attainment cube", refId: "att_w34" },
      { label: "Finance forecast v3", refId: "fcst_v3" },
    ],
  },
};

/** Conv 1 · Turn 2 — Skin Care drivers */
export const skinCareDrivers: FixtureEntry = {
  id: "skin-care-drivers",
  match: [
    "why did skin care miss",
    "skin care miss by $138",
    "paid traffic decline",
  ],
  thinkingSteps: [
    "Decomposing Skin Care gap into drivers",
    "Checking ad spend vs organic on hero keywords",
  ],
  breadcrumbAppend: ["Skin Care"],
  scopePatch: { taxonomyPath: ["Beauty & Personal Care", "Skin Care"], tier: "category" },
  answer: {
    scopeLine: "Skin Care · Week 34 vs plan",
    headline: {
      value: "−$138K",
      delta: "67% from paid traffic",
      direction: "down",
    },
    why: [
      "Ad budget problem — not a demand problem. Paid traffic is 67% of the gap.",
      "Three keywords carry the entire −$93K paid drop.",
      "Spend and ad sales both fell 62% — efficiency held; volume didn't.",
    ],
    sections: [
      {
        id: "sc-score",
        kind: "scorecard",
        tiles: [
          {
            label: "Skin Care gap",
            value: "−$138K",
            delta: "−14.1% vs plan",
            direction: "down",
            featured: true,
          },
          {
            label: "From paid traffic",
            value: "−$93K",
            delta: "67% of gap",
            direction: "down",
          },
          { label: "Keywords hit", value: "3" },
        ],
      },
      {
        id: "sc-drivers",
        kind: "table",
        title: "What drove the miss",
        table: {
          emphasis: "primary",
          columns: ["Driver", "Impact", "Confidence"],
          rows: [
            ["Paid traffic decline", neg("-$93K"), "High"],
            ["Organic rank slippage on the same terms", neg("-$21K"), "Medium"],
            ["ASP down 2.1% (competitive repricing)", neg("-$14K"), "High"],
            ["Stock-outs (2 SKUs, 1.5 days)", neg("-$6K"), "High"],
            ["Unattributed", neg("-$4K"), "—"],
          ],
        },
      },
      {
        id: "sc-keywords",
        kind: "table",
        title: "Keywords carrying the paid drop",
        table: {
          emphasis: "primary",
          stickyFirstColumn: true,
          columns: [
            "Keyword",
            "Spend W33",
            "Spend W34",
            "Ad sales W33",
            "Ad sales W34",
            "Impression share",
          ],
          rows: [
            [
              "vitamin c serum",
              "$18.4K",
              neg("$6.2K"),
              "$71K",
              neg("$24K"),
              warn("41% → 17%"),
            ],
            [
              "retinol cream for face",
              "$12.1K",
              neg("$5.8K"),
              "$46K",
              neg("$21K"),
              warn("33% → 15%"),
            ],
            [
              "hyaluronic acid serum",
              "$9.6K",
              neg("$3.4K"),
              "$33K",
              neg("$12K"),
              warn("28% → 11%"),
            ],
            ["Total", "$40.1K", neg("$15.4K"), "$150K", neg("$57K"), "—"],
          ],
        },
      },
      {
        id: "sc-callout",
        kind: "callout",
        callout: {
          title: "Next check",
          body: "Looks like a budget or bid change — not a market shift. Dig into SC_SP_Hero_Exact next.",
          tone: "neutral",
        },
      },
    ],
    followups: [
      {
        type: "drill",
        label: "What changed in those campaigns — budget or bids?",
        nextTurnId: "campaign-budget-cut",
      },
      {
        type: "drill",
        label: "Which Skin Care SKUs lost the most ad sales?",
        nextTurnId: "wow-serums-skus",
      },
      {
        type: "pivot",
        label: "Did the same change hit other categories?",
        nextTurnId: "wow-portfolio",
      },
      {
        type: "pivot",
        label: "Move on to Baby Care — what caused its $112K gap?",
        nextTurnId: "baby-care-availability",
      },
    ],
  },
};

/** Conv 1 · Turn 3 — campaign budget cut */
export const campaignBudgetCut: FixtureEntry = {
  id: "campaign-budget-cut",
  match: [
    "what changed in those campaigns",
    "budget or bids",
    "sc_sp_hero_exact",
  ],
  thinkingSteps: [
    "Pulling campaign change log Aug 10–23",
    "Comparing out-of-budget hours W33 vs W34",
  ],
  breadcrumbAppend: ["SC_SP_Hero_Exact"],
  answer: {
    scopeLine: "Skin Care · campaign change log · Aug 10–23",
    headline: { value: "Budget cut", delta: "$6,000 → $2,000" },
    why: ["Budget. One change, one campaign, one timestamp."],
    sections: [
      {
        id: "camp-log",
        kind: "changeLog",
        campaign: "SC_SP_Hero_Exact",
        metricLabel: "daily budget",
        fromValue: "$6,000",
        toValue: "$2,000",
        meta: [
          "Aug 16, 10:42 PM PT · bulk sheet upload · rahul.n@meridianbrands.com",
          "Bids untouched — CPCs flat at $1.84 vs $1.81",
        ],
      },
      {
        id: "camp-narrative",
        kind: "narrative",
        body: "All three keywords sit in this campaign. The paid drop isn't spread across the category:",
      },
      {
        id: "camp-keywords",
        kind: "table",
        table: {
          emphasis: "primary",
          columns: ["Keyword", "Spend Δ", "Ad sales Δ"],
          rows: [
            ["vitamin c serum", neg("−62%"), neg("−62%")],
            ["retinol cream", neg("−58%"), neg("−60%")],
            ["hyaluronic acid", neg("−64%"), neg("−63%")],
          ],
        },
      },
      {
        id: "camp-warn",
        kind: "callout",
        callout: {
          title: "",
          body: "The campaign now goes dark before afternoon and evening, where 61% of this category's conversions happen. We're paying for low-converting morning hours and missing the ones that pay.",
          tone: "warning",
        },
      },
      {
        id: "camp-recs",
        kind: "recommendationCards",
        cards: [
          {
            variant: "recommended",
            title: "Restore the $6,000 daily budget",
            body: "Estimated $88K–$104K weekly sales recovered for ~$25K incremental spend, at the campaign's current 21% ACoS and unchanged CPCs.",
          },
          {
            variant: "alternative",
            title: "Dayparted $4,000 budget, weighted 12 PM–10 PM",
            body: "Recovers most of the gap for less spend, if the cut was deliberate for budget reasons.",
          },
        ],
      },
    ],
    followups: [
      {
        type: "drill",
        label: "Show me sales by hour of day for the days we were out of budget",
        nextTurnId: "wow-skin-care",
      },
      {
        type: "drill",
        label: 'What budget gets impression share back to 40% on "vitamin c serum"?',
        nextTurnId: "skin-care-drivers",
      },
      {
        type: "pivot",
        label: "Which other campaigns had budget changes in the last 2 weeks?",
        nextTurnId: "wow-portfolio",
      },
    ],
  },
};

/** Conv 1 · Turn 4 — Baby Care availability */
export const babyCareAvailability: FixtureEntry = {
  id: "baby-care-availability",
  match: [
    "baby care gap",
    "skus driving the baby care",
    "move on to baby care",
    "what caused its $112",
  ],
  thinkingSteps: [
    "Segmenting Baby Care miss by SKU",
    "Checking FBA inbound and Buy Box winners",
  ],
  breadcrumbAppend: ["Baby Care"],
  scopePatch: {
    taxonomyPath: ["Beauty & Personal Care", "Baby Care"],
    tier: "category",
  },
  answer: {
    scopeLine: "Baby Care · Tinytide · Week 34 vs plan",
    headline: {
      value: "−$112K",
      delta: "Availability, not media",
      direction: "down",
    },
    why: [
      "Different problem — availability, not media. Three SKUs explain $104K of the $112K miss.",
      "Overnight Diapers Size 4 was out of stock Aug 19–23 (inbound landed 11 days late).",
      "Buy Box losses on Wipes and Rash Cream look chronic, not one-off.",
    ],
    sections: [
      {
        id: "bc-score",
        kind: "scorecard",
        tiles: [
          {
            label: "Baby Care gap",
            value: "−$112K",
            delta: "−14.7% vs plan",
            direction: "down",
            featured: true,
          },
          {
            label: "From 3 SKUs",
            value: "−$104K",
            delta: "93% of miss",
            direction: "down",
          },
          { label: "Issue types", value: "OOS + BB" },
        ],
      },
      {
        id: "bc-skus",
        kind: "table",
        title: "SKUs explaining the miss",
        table: {
          emphasis: "primary",
          stickyFirstColumn: true,
          columns: ["SKU", "ASIN", "Issue", "Lost sales"],
          rows: [
            [
              "Overnight Diapers Size 4, 104ct",
              "B0C7K2M4L9",
              warn("Out of stock Aug 19–23"),
              neg("-$47K"),
            ],
            [
              "Sensitive Wipes, 12-pack",
              "B0D4T8N1X3",
              warn("Buy Box → ValuMart Direct"),
              neg("-$38K"),
            ],
            [
              "Diaper Rash Cream, 4oz",
              "B0B9Q3F7V2",
              warn("Buy Box → BrightBuy Wholesale"),
              neg("-$19K"),
            ],
            ["Everything else", "—", "Normal variance", neg("-$8K")],
          ],
        },
      },
      {
        id: "bc-bb",
        kind: "table",
        title: "Buy Box losses — detail",
        table: {
          emphasis: "primary",
          columns: [
            "SKU",
            "BB win rate (W34)",
            "Winning seller",
            "Their price vs ours",
          ],
          rows: [
            [
              "Sensitive Wipes 12-pack",
              warn("54% (was 96%)"),
              "ValuMart Direct",
              neg("−6.2% ($22.49 vs $23.99)"),
            ],
            [
              "Diaper Rash Cream 4oz",
              warn("61% (was 92%)"),
              "BrightBuy Wholesale",
              neg("−4.1% ($11.98 vs $12.49)"),
            ],
          ],
        },
      },
      {
        id: "bc-callout",
        kind: "callout",
        callout: {
          title: "Inventory note",
          body: "Overnight Diapers is back with only 11 days of cover — thin for September. Next: check chronic Buy Box pattern on the two SKUs.",
          tone: "warning",
        },
      },
    ],
    followups: [
      {
        type: "drill",
        label: "How often have these 2 SKUs lost Buy Box in the last 90 days?",
        nextTurnId: "chronic-bb-90d",
      },
      {
        type: "pivot",
        label: "Show me every SKU currently out of stock or about to go out of stock",
        nextTurnId: "bb-off-today",
      },
      {
        type: "pivot",
        label: "Are ValuMart and BrightBuy winning Buy Box in other categories too?",
        nextTurnId: "bb-sellers-cross-cat",
      },
    ],
  },
};

/** Conv 1 · Turn 5 — chronic Buy Box */
export const chronicBb90d: FixtureEntry = {
  id: "chronic-bb-90d",
  match: [
    "lost buy box in the last 90",
    "how often have these 2 skus",
    "chronic buy box",
  ],
  thinkingSteps: [
    "Scanning 90-day Buy Box history",
    "Clustering by winning seller and weekday pattern",
  ],
  answer: {
    scopeLine: "Baby Care · 2 SKUs · Jun 1 – Aug 29",
    headline: {
      value: "Chronic",
      delta: "Not random",
    },
    why: ["This isn't new and it isn't random. Both are chronic."],
    sections: [
      {
        id: "bb-pattern",
        kind: "weekdayPattern",
        body: "ValuMart consistently reprices to roughly 6% under your list on Thursday afternoons and holds it through the weekend — the highest-traffic window for this category.",
        caption:
          "Share of week Buy Box lost to ValuMart, by day · last 90 days",
        days: [
          { label: "Mon", height: 38 },
          { label: "Tue", height: 38 },
          { label: "Wed", height: 42 },
          { label: "Thu", height: 85, hot: true },
          { label: "Fri", height: 92, hot: true },
          { label: "Sat", height: 96, hot: true },
          { label: "Sun", height: 88, hot: true },
        ],
      },
      {
        id: "bb-loss",
        kind: "scorecard",
        tiles: [
          {
            label: "Estimated annualized loss",
            value: "$1.8M–$2.0M",
            delta: "At current run rate, across both SKUs",
            featured: true,
          },
        ],
      },
      {
        id: "bb-check",
        kind: "checklist",
        items: [
          {
            title: "MAP policy coverage",
            detail: "Not yet checked against ValuMart and BrightBuy pricing",
            statusLabel: "Needs review",
            statusTone: "warning",
          },
          {
            title: "Automated repricing rule",
            detail: "Neither ASIN is currently enrolled",
            statusLabel: "Not enrolled",
            statusTone: "danger",
          },
        ],
      },
    ],
    followups: [
      {
        type: "drill",
        label: "What price do we need to hold to win Buy Box back on the Wipes?",
        nextTurnId: "bb-off-today",
      },
      {
        type: "pivot",
        label: "Check these sellers against our MAP policy",
        nextTurnId: "map-violations",
      },
      {
        type: "pivot",
        label: "Alert me whenever either SKU loses Buy Box for more than 2 hours",
        nextTurnId: "automation-map",
      },
    ],
  },
};
