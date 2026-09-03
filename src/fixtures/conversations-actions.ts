import type { FixtureEntry, ScopeContext, TableCellValue } from "@/types";

const currentPeriodScope: ScopeContext = {
  retailer: "Amazon US",
  brand: "All brands",
  taxonomyPath: ["Beauty & Personal Care"],
  tier: "business",
  period: {
    label: "Week 35 (Aug 24–30)",
    start: "2026-08-24",
    end: "2026-08-30",
  },
  comparison: "vs_plan",
  asOf: "2026-09-01T08:00:00-07:00",
};

function neg(text: string): TableCellValue {
  return { text, tone: "negative" };
}
function warn(text: string): TableCellValue {
  return { text, tone: "warning" };
}

/** Conv 5 — MAP file + violations (also id file-echo for attach wiring) */
export const mapViolations: FixtureEntry = {
  id: "map-violations",
  match: [
    "map violations",
    "map policy",
    "check if there are any map",
    "map details attached",
    "check map pricing against my policy",
  ],
  thinkingSteps: [
    "Reading MAP_Policy_Aug2026.xlsx · Sheet MAP Master",
    "Joining 412 rows to Amazon US catalog",
    "Scanning live offers below MAP",
  ],
  answer: {
    scopeLine: "MAP_Policy_Aug2026.xlsx · Sheet \"MAP Master\" · 412 rows",
    headline: {
      value: "7 offers",
      delta: "Below MAP · 5 ASINs",
      direction: "down",
    },
    why: [
      "Matched 398 of 412 rows to your Amazon US catalog. 14 unmatched: 9 discontinued, 3 bad ASIN length, 2 not in catalog.",
      "7 offers are below MAP right now, across 5 ASINs.",
      "Of the 11 SKUs off Buy Box this morning, only 5 are MAP violations — Curl Cream is fulfilment advantage at full price; Travel Serum is our own list $0.60 under MAP.",
    ],
    interpretationEcho: {
      fileName: "MAP_Policy_Aug2026.xlsx",
      mappings: [
        { column: "ASIN", field: "ASIN (join key)" },
        { column: "Item Description", field: "SKU name" },
        { column: "MAP ($)", field: "MAP price" },
        { column: "Effective From", field: "Policy effective date" },
        { column: "Region", field: "Ignored — all US" },
      ],
      matchedRows: 398,
      unmatchedRows: 14,
      unmatchedReasons: [
        "9 ASINs discontinued",
        "3 ASINs wrong length (11 chars)",
        "2 ASINs not in catalog",
      ],
    },
    sections: [
      {
        id: "map-table",
        kind: "table",
        title: "Live MAP violations",
        table: {
          emphasis: "primary",
          stickyFirstColumn: true,
          columns: [
            "SKU",
            "ASIN",
            "MAP",
            "Lowest live offer",
            "Seller",
            "Below MAP by",
            "Running since",
          ],
          rows: [
            [
              "Sensitive Wipes 12-pack",
              "B0D4T8N1X3",
              "$23.99",
              "$22.49",
              "ValuMart Direct",
              neg("-$1.50 (−6.2%)"),
              "6 days",
            ],
            [
              "Vitamin C Serum 50ml",
              "B0F9M4T7B2",
              "$48.99",
              "$45.51",
              "PrimeStock Depot",
              neg("-$3.48 (−7.1%)"),
              warn("11 days"),
            ],
            [
              "Vitamin C Serum 50ml",
              "B0F9M4T7B2",
              "$48.99",
              "$46.99",
              "Coastline Goods",
              neg("-$2.00 (−4.1%)"),
              "3 days",
            ],
            [
              "Overnight Diapers Size 5",
              "B0C8L3P6R2",
              "$42.99",
              "$40.93",
              "Coastline Goods",
              neg("-$2.06 (−4.8%)"),
              "8 days",
            ],
            [
              "Diaper Rash Cream 4oz",
              "B0B9Q3F7V2",
              "$12.49",
              "$11.98",
              "BrightBuy Wholesale",
              neg("-$0.51 (−4.1%)"),
              warn("14 days"),
            ],
            [
              "Diaper Rash Cream 4oz",
              "B0B9Q3F7V2",
              "$12.49",
              "$12.15",
              "ValuMart Direct",
              neg("-$0.34 (−2.7%)"),
              "2 days",
            ],
            [
              "Repair Shampoo 500ml",
              "B0A2V7K9D1",
              "$26.99",
              "$26.07",
              "NorthGate Retail",
              neg("-$0.92 (−3.4%)"),
              "4 days",
            ],
          ],
        },
      },
      {
        id: "map-callout",
        kind: "callout",
        callout: {
          title: "Repeat names",
          body: "ValuMart, Coastline and BrightBuy also showed up in the Buy Box analysis. PrimeStock's Vitamin C Serum offer has been under MAP for 11 straight days.",
          tone: "warning",
        },
      },
    ],
    followups: [
      {
        type: "pivot",
        label: "Check this daily morning and email me if you find any MAP violations",
        nextTurnId: "automation-map",
      },
      {
        type: "pivot",
        label: "Give me the list of SKUs not on Buy Box today",
        nextTurnId: "bb-off-today",
      },
    ],
  },
};

/** Alias id used when user attaches a file in Messenger */
export const fileEcho: FixtureEntry = {
  ...mapViolations,
  id: "file-echo",
  match: ["attached", "policy file", "upload"],
};

/** Conv 6 — Autopilot / automation */
export const automationMap: FixtureEntry = {
  id: "automation-map",
  match: [
    "check this daily morning",
    "email me if you find any map",
    "alert me if map",
    "alert me whenever either sku loses buy box",
    "alert me if bb drops",
    "autopilot",
    "automate",
  ],
  thinkingSteps: [
    "Drafting Daily MAP violation check",
    "Backtesting against yesterday's offers",
  ],
  answer: {
    scopeLine: "Autopilot draft · Amazon US · MAP file pinned",
    headline: { value: "Ready to activate", delta: "Review before go-live" },
    why: [
      "Here's what I'll set up. Have a look before I turn it on.",
      "Two things to decide: threshold (any amount vs 2% floor), and whether repeats email daily or only on change.",
    ],
    sections: [
      {
        id: "auto-summary",
        kind: "table",
        title: "Draft configuration",
        table: {
          emphasis: "primary",
          columns: ["Field", "Value"],
          rows: [
            ["Name", "Daily MAP violation check — Amazon US"],
            ["Runs", "Every day at 9:00 AM IST"],
            ["Scope", "Amazon US · all brands · 398 ASINs from MAP_Policy_Aug2026.xlsx"],
            ["Checks", "Any live offer priced below the MAP for that ASIN"],
            ["Sends", "Email to priya.s@meridianbrands.com"],
            [
              "Email contains",
              "Violation count, SKU table, what changed since yesterday",
            ],
            ["If nothing found", "Skip the email"],
            ["Reference file", "Pinned until you upload a new one"],
          ],
        },
      },
      {
        id: "auto-callout",
        kind: "callout",
        callout: {
          title: "Decisions for you",
          body: "Threshold — right now any amount below MAP counts (yesterday included a $0.34 variance). Quiet hours / repeats — same seller under MAP for 11 days: email every day, or day 1 then weekly?",
          tone: "brand",
        },
      },
    ],
    automationDraft: {
      name: "Daily MAP violation check — Amazon US",
      checkDefinition:
        "Any live offer priced more than 2% below MAP for ASINs in the pinned MAP file",
      schedule: { freq: "daily", time: "09:00 IST" },
      threshold: "Offers more than 2% below MAP",
      channels: ["email", "in_app"],
      recipients: [
        "priya.s@meridianbrands.com",
        "rahul.n@meridianbrands.com",
        "brand-legal@meridianbrands.com",
      ],
      repeatPolicy: "always_notify",
      backtestSummary:
        "On yesterday's data this would have flagged 5 violations — the $0.34 and $0.51 Diaper Rash Cream offers fall below the 2% floor and drop out.",
    },
    followups: [
      {
        type: "pivot",
        label: "Show me the Autopilots I already have running",
        nextTurnId: "gap-categories",
      },
      {
        type: "pivot",
        label: "Set up the same kind of autopilot for unplanned coupons",
        nextTurnId: "promo-compliance",
      },
    ],
  },
};

/** Conv 7 — Dashboard from promo answer */
export const promoDashboardPreview: FixtureEntry = {
  id: "promo-dashboard-preview",
  match: [
    "turn this into a dashboard",
    "dashboard i can check every day",
    "promotion compliance dashboard",
  ],
  thinkingSteps: [
    "Composing scorecard + needs-attention table",
    "Linking dashboard to this conversation scope",
  ],
  answer: {
    scopeLine: "Dashboard created · Promotion compliance · Amazon US",
    headline: { value: "Live", delta: "Refreshes 6:00 AM PT" },
    why: [
      "Done — Promotion compliance · Amazon US is live.",
      "It inherits the scope you were asking in — Amazon US, all brands. Change the scope on the dashboard and every widget follows.",
    ],
    sections: [
      {
        id: "dash-preview",
        kind: "dashboardPreview",
        title: "Promotion compliance · Amazon US",
        openLabel: "Open dashboard",
        widgets: [
          {
            name: "Scorecard",
            description:
              "4 tiles: running clean · badge missing · didn't start · unplanned discounts",
          },
          {
            name: "Needs attention",
            description:
              "The 5 broken promotions + 4 unplanned discounts, one row per SKU",
          },
          {
            name: "Running as planned",
            description: "63 SKUs, collapsed by default",
          },
          {
            name: "Trend",
            description: "Daily unplanned-discount margin impact, last 30 days",
          },
        ],
      },
      {
        id: "dash-score",
        kind: "scorecard",
        title: "Today's snapshot",
        tiles: [
          { label: "Running clean", value: "14" },
          { label: "Badge missing", value: "5", direction: "down" },
          { label: "Didn't start", value: "2", direction: "down" },
          {
            label: "Unplanned / day",
            value: "−$6.7K",
            direction: "down",
          },
        ],
      },
      {
        id: "dash-attention",
        kind: "table",
        title: "Needs attention (preview)",
        table: {
          emphasis: "primary",
          stickyFirstColumn: true,
          columns: ["SKU", "Brand", "Status", "Impact/day"],
          rows: [
            ["Repair Shampoo 500ml", "Aurelle", warn("Badge missing"), neg("$2.4K")],
            ["Vitamin C Serum 30ml", "Kavi", warn("Badge missing"), neg("$3.1K")],
            ["Whitening Toothpaste 3-pack", "Brightline", warn("Didn't start"), "—"],
            ["Retinol Night Serum 30ml", "Kavi", warn("Unplanned"), neg("-$2.6K")],
            ["Curl Cream 8oz", "Aurelle", warn("Unplanned"), neg("-$1.9K")],
          ],
        },
      },
    ],
    followups: [
      {
        type: "pivot",
        label: "Build me a matching one for Buy Box",
        nextTurnId: "bb-off-today",
      },
      {
        type: "pivot",
        label: "Are the promotions running as planned?",
        nextTurnId: "promo-compliance",
      },
    ],
  },
};

/** Conv 8 — Deck outline from WoW */
export const deckOutline: FixtureEntry = {
  id: "deck-outline",
  match: [
    "turn this whole week-on-week review into a deck",
    "build a slide deck",
    "deck for my monday leadership",
    "into a deck",
  ],
  thinkingSteps: [
    "Selecting slides from this conversation",
    "Drafting CommerceIQ template outline",
  ],
  answer: {
    scopeLine: "Deck outline · Week 34 business review · Amazon US",
    headline: { value: "10 slides", delta: "~6-minute read" },
    why: [
      "Here's the outline I'd build. Tell me what to change and I'll go make it.",
      "I'll use the CommerceIQ template — sentence case headings, your headline and accent colours.",
    ],
    sections: [
      {
        id: "deck-slides",
        kind: "table",
        title: "Proposed outline",
        table: {
          emphasis: "primary",
          columns: ["#", "Slide", "Content"],
          rows: [
            ["1", "Title", "Weekly business review · Week 34 · Amazon US"],
            [
              "2",
              "Headline",
              "$280K below plan · −5.1% WoW · three things that caused it",
            ],
            ["3", "Where the gap sits", "Waterfall — plan to actual by category"],
            ["4", "Week on week by category", "Bar chart with WoW deltas"],
            [
              "5",
              "Traffic, conversion, price",
              "Three-metric table, portfolio and by category",
            ],
            [
              "6",
              "Advertising",
              "Spend, sales, ACoS, TACoS + budget-cut callout",
            ],
            [
              "7",
              "Issue 1 — Skin Care media",
              "Budget cut, out-of-budget hours, $93K impact",
            ],
            [
              "8",
              "Issue 2 — Baby Care availability",
              "Stock-out + chronic Buy Box, $104K impact",
            ],
            [
              "9",
              "Actions taken and impact",
              "Last week's 5 actions, colour-coded by outcome",
            ],
            [
              "10",
              "This week's actions",
              "Owners: Rahul (ads), Priya (BB), Supply (diapers)",
            ],
          ],
        },
      },
      {
        id: "deck-actions",
        kind: "table",
        title: "Closing slide — this week's actions",
        table: {
          emphasis: "primary",
          columns: ["Action", "Owner", "By when"],
          rows: [
            ["Restore SC_SP_Hero_Exact budget to $6K/day", "Rahul N.", "Mon Aug 31"],
            ["Enroll 2 Baby Care SKUs in repricing", "Priya S.", "Tue Sep 1"],
            ["Escalate the 9-day-old Buy Box case", "Priya S.", "Mon Aug 31"],
            [
              "Confirm September cover on Overnight Diapers S4",
              "Supply team",
              "Wed Sep 2",
            ],
          ],
        },
      },
    ],
    deckOutline: {
      slides: [
        "Title — Weekly business review · Week 34 · Amazon US",
        "Headline — $280K below plan and the three causes",
        "Where the gap sits — waterfall by category",
        "Week on week by brand",
        "Traffic, conversion, price",
        "Advertising + budget-cut callout",
        "Issue 1 — Skin Care media",
        "Issue 2 — Baby Care availability",
        "Actions taken last week",
        "This week's actions + owners",
      ],
    },
    followups: [
      {
        type: "pivot",
        label: "Do a week-on-week analysis for the entire portfolio",
        nextTurnId: "wow-portfolio",
      },
      {
        type: "pivot",
        label: "Which categories did not meet last week's plan?",
        nextTurnId: "gap-categories",
      },
    ],
  },
};

/** Current-period variant for re-run demos */
export const gapToPlanCurrent: FixtureEntry = {
  id: "gap-to-plan-current",
  match: ["__rerun_current_gap__"],
  periodVariant: "current",
  thinkingSteps: [
    "Loading Week 35 attainment vs plan",
    "Ranking categories by absolute dollar gap",
  ],
  scopePatch: currentPeriodScope,
  answer: {
    scopeLine:
      "Amazon US · Week 35 (Aug 24–30) vs. plan · data through Sep 1, 8:00 AM PT",
    headline: {
      value: "$4.41M",
      delta: "−$190K (−4.1%) vs plan",
      direction: "down",
    },
    why: [
      "Week 35 you're at $4.41M against a $4.60M plan — short by $190K (−4.1%), improved vs last week.",
      "Skin Care is still the top driver (−$98K); Baby Care improved after inbound landed.",
    ],
    sections: [
      {
        id: "cur-score",
        kind: "scorecard",
        tiles: [
          {
            label: "Actual",
            value: "$4.41M",
            delta: "vs $4.60M plan",
            direction: "down",
          },
          {
            label: "Gap",
            value: "−$190K",
            delta: "−4.1% (improved)",
            direction: "down",
          },
        ],
      },
      {
        id: "cur-bridge",
        kind: "visual",
        visual: {
          kind: "bridge",
          steps: [
            { label: "Plan", value: 4.6 },
            { label: "Skin Care", value: -0.098 },
            { label: "Baby Care", value: -0.042 },
            { label: "Others", value: -0.05 },
            { label: "Actual", value: 4.41 },
          ],
        },
      },
    ],
    followups: [
      {
        type: "drill",
        label: "Why did Skin Care miss by $138K?",
        nextTurnId: "skin-care-drivers",
      },
      {
        type: "pivot",
        label: "Do a week-on-week analysis for the entire portfolio",
        nextTurnId: "wow-portfolio",
      },
    ],
  },
};

/** Lightweight disambiguation keep */
export const disambiguation: FixtureEntry = {
  id: "disambiguation-serum",
  match: ["which serum", "serum did you mean"],
  thinkingSteps: ["Ambiguous SKU reference"],
  disambiguation: {
    question: "Which serum did you mean?",
    options: [
      "Kavi Vitamin C Serum 30ml",
      "Kavi Retinol Night Serum 30ml",
      "Kavi Hyaluronic Serum 30ml",
    ],
  },
  answer: {
    scopeLine: "",
    headline: { value: "" },
    why: [],
    followups: [],
  },
};

/** Stale data banner demo */
export const staleData: FixtureEntry = {
  id: "stale-data",
  match: ["stale data", "data freshness"],
  thinkingSteps: ["Checking source freshness"],
  scopePatch: {
    stale: { source: "Buy Box feed", hoursOld: 18 },
  },
  answer: {
    scopeLine: "Amazon US · Buy Box freshness warning",
    headline: { value: "Stale source", delta: "18 hours old" },
    why: [
      "Buy Box feed last refreshed 18 hours ago — past its refresh SLA.",
      "Numbers below may lag live 3P pricing.",
    ],
    sections: [
      {
        id: "stale-callout",
        kind: "callout",
        callout: {
          title: "Proceed carefully",
          body: "I can still answer from the last good snapshot, or you can wait for the next refresh window.",
          tone: "warning",
        },
      },
    ],
    followups: [
      {
        type: "pivot",
        label: "Give me the list of SKUs not on Buy Box today",
        nextTurnId: "bb-off-today",
      },
    ],
  },
};
