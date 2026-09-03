import type { FixtureEntry, TableCellValue } from "@/types";

function neg(text: string): TableCellValue {
  return { text, tone: "negative" };
}
function pos(text: string): TableCellValue {
  return { text, tone: "positive" };
}

/** Conv 2 · Turn 1 — WoW portfolio */
export const wowPortfolio: FixtureEntry = {
  id: "wow-portfolio",
  match: [
    "week-on-week analysis for the entire portfolio",
    "week on week analysis",
    "do a week-on-week",
    "wow portfolio",
    "how does this week compare to last week",
  ],
  thinkingSteps: [
    "Comparing Week 34 vs Week 33 across brands",
    "Building ads, traffic, and issue digests",
  ],
  scopePatch: { comparison: "vs_prior_period" },
  answer: {
    scopeLine:
      "Amazon US · Week 34 (Aug 17–23) vs Week 33 (Aug 10–16) · all brands",
    headline: {
      value: "$4.32M",
      delta: "−5.1% WoW (−$233K)",
      direction: "down",
    },
    why: [
      "The portfolio was down 5.1% week on week — $4.32M vs $4.55M.",
      "Traffic did most of the damage; pricing quietly helped.",
      "Skin Care and Baby Care are 96% of the decline. Everything else is noise.",
    ],
    sections: [
      {
        id: "wow-score",
        kind: "scorecard",
        tiles: [
          {
            label: "WoW sales",
            value: "−$233K",
            delta: "−5.1%",
            direction: "down",
          },
          {
            label: "Ad spend",
            value: "−10.5%",
            delta: "ACoS +1.7 pts",
            direction: "down",
          },
          {
            label: "Glance views",
            value: "−4.1%",
            direction: "down",
          },
          { label: "ASP", value: "+1.8%", direction: "up" },
        ],
      },
      {
        id: "wow-brands",
        kind: "table",
        title: "1 · Where the $233K went",
        table: {
          emphasis: "primary",
          stickyFirstColumn: true,
          columns: ["Brand", "Category", "W33", "W34", "Δ", "Δ %"],
          rows: [
            ["Aurelle", "Hair Care", "$1.28M", "$1.32M", pos("+$40K"), pos("+3.1%")],
            ["Kavi", "Skin Care", "$971K", "$842K", neg("-$129K"), neg("-13.3%")],
            ["Tinytide", "Baby Care", "$742K", "$648K", neg("-$94K"), neg("-12.7%")],
            ["Purecraft", "Home Cleaning", "$621K", "$598K", neg("-$23K"), neg("-3.7%")],
            ["Brightline", "Oral Care", "$498K", "$505K", pos("+$7K"), pos("+1.4%")],
            ["NutriPeak", "Vitamins", "$438K", "$407K", neg("-$31K"), neg("-7.1%")],
            ["Total", "—", "$4.55M", "$4.32M", neg("-$233K"), neg("-5.1%")],
          ],
        },
      },
      {
        id: "wow-ads",
        kind: "compareStrip",
        title: "2 · Advertising",
        priorLabel: "W33",
        currentLabel: "W34",
        rows: [
          {
            label: "Ad spend",
            prior: "$612K",
            current: "$548K",
            delta: "−10.5%",
            tone: "negative",
          },
          {
            label: "Ad sales",
            prior: "$2.41M",
            current: "$2.02M",
            delta: "−16.2%",
            tone: "negative",
          },
          {
            label: "ACoS",
            prior: "25.4%",
            current: "27.1%",
            delta: "+1.7 pts",
            tone: "negative",
          },
          {
            label: "TACoS",
            prior: "13.5%",
            current: "12.7%",
            delta: "−0.8 pts",
            tone: "positive",
          },
          {
            label: "Share of sales from ads",
            prior: "53%",
            current: "47%",
            delta: "−6 pts",
            tone: "negative",
          },
        ],
      },
      {
        id: "wow-tcp",
        kind: "compareStrip",
        title: "3 · Traffic, conversion, price",
        priorLabel: "W33",
        currentLabel: "W34",
        rows: [
          {
            label: "Glance views",
            prior: "1.43M",
            current: "1.37M",
            delta: "−4.1%",
            tone: "negative",
          },
          {
            label: "Conversion rate",
            prior: "11.2%",
            current: "10.9%",
            delta: "−0.3 pts",
            tone: "negative",
          },
          {
            label: "Units",
            prior: "160.2K",
            current: "149.5K",
            delta: "−6.7%",
            tone: "negative",
          },
          {
            label: "ASP",
            prior: "$28.40",
            current: "$28.90",
            delta: "+1.8%",
            tone: "positive",
          },
        ],
      },
      {
        id: "wow-cat-tcp",
        kind: "table",
        title: "By category — glance / conversion / ASP",
        table: {
          emphasis: "primary",
          columns: ["Category", "Glance views", "Conversion", "ASP"],
          rows: [
            ["Hair Care", pos("+2.4%"), pos("+0.2 pts"), pos("+1.1%")],
            ["Skin Care", neg("-16.8%"), "−0.1 pts", neg("-2.1%")],
            ["Baby Care", neg("-3.1%"), neg("-1.9 pts"), "+0.4%"],
            ["Home Cleaning", "−1.2%", "−0.2 pts", neg("-2.8%")],
            ["Oral Care", pos("+0.8%"), pos("+0.1 pts"), pos("+0.6%")],
            ["Vitamins", neg("-7.4%"), "−0.4 pts", pos("+2.2%")],
          ],
        },
      },
      {
        id: "wow-issues",
        kind: "table",
        title: "4 · Key issues last week",
        table: {
          emphasis: "primary",
          columns: ["Issue", "Where", "Estimated impact"],
          rows: [
            [
              "SC_SP_Hero_Exact budget cut $6K → $2K on Aug 16",
              "Skin Care",
              neg("-$93K"),
            ],
            [
              "Overnight Diapers Size 4 out of stock 5 days",
              "Baby Care",
              neg("-$47K"),
            ],
            [
              "Buy Box loss on Wipes + Rash Cream (chronic)",
              "Baby Care",
              neg("-$57K"),
            ],
            [
              "2 NutriPeak listings suppressed Aug 18–20",
              "Vitamins",
              neg("-$18K"),
            ],
            [
              "Purecraft Multi-Surface Spray deal ended 2 days early",
              "Home Cleaning",
              neg("-$11K"),
            ],
          ],
        },
      },
      {
        id: "wow-actions",
        kind: "actionLog",
        title: "5 · What we did last week",
        rows: [
          {
            action: "Restored Home Cleaning campaign budget",
            owner: "Priya S.",
            date: "Aug 18",
            result: "+$14K, ACoS held at 19%",
            status: "done",
          },
          {
            action: "Fixed 2 suppressed NutriPeak listings",
            owner: "Content team",
            date: "Aug 20",
            result: "Live in 14 hrs, recovered by Aug 22",
            status: "done",
          },
          {
            action: "Raised bids 15% on Oral Care hero terms",
            owner: "Rahul N.",
            date: "Aug 17",
            result: "+$7K sales, ACoS up 3.1 pts — roughly break-even",
            status: "mixed",
          },
          {
            action: "Submitted case for Baby Care Buy Box",
            owner: "Ops",
            date: "Aug 21",
            result: "No response yet, 9 days open",
            status: "waiting",
          },
          {
            action: "Expedited diaper replenishment PO",
            owner: "Supply",
            date: "Aug 19",
            result: "Received Aug 27, back in stock",
            status: "done",
          },
        ],
      },
      {
        id: "wow-callout",
        kind: "callout",
        callout: {
          title: "Bottom line",
          body: "Last week's decline is three fixable, specific things — not a demand softening. Restore the Skin Care budget, get repricing onto the two Baby Care SKUs, and the portfolio should be back at plan within two weeks.",
          tone: "brand",
        },
      },
    ],
    followups: [
      {
        type: "drill",
        label: "Break down Skin Care week on week",
        nextTurnId: "wow-skin-care",
      },
      {
        type: "drill",
        label: "Show me the top 20 SKUs by WoW decline",
        nextTurnId: "wow-serums-skus",
      },
      {
        type: "pivot",
        label: "Turn this whole week-on-week review into a deck",
        nextTurnId: "deck-outline",
      },
      {
        type: "pivot",
        label: "Which categories did not meet last week's plan?",
        nextTurnId: "gap-categories",
      },
    ],
  },
};

/** Conv 2 · Turn 2 — Skin Care WoW */
export const wowSkinCare: FixtureEntry = {
  id: "wow-skin-care",
  match: [
    "break down skin care week on week",
    "skin care week on week",
    "how is this week trending for the hair care",
  ],
  thinkingSteps: [
    "Splitting Skin Care traffic into paid vs organic",
    "Ranking sub-categories by WoW delta",
  ],
  breadcrumbAppend: ["Skin Care WoW"],
  answer: {
    scopeLine: "Skin Care · Kavi · W34 vs W33",
    headline: {
      value: "−$129K",
      delta: "−13.3% · traffic is the story",
      direction: "down",
    },
    why: [
      "−$129K (−13.3%). Traffic is the whole story — conversion and price barely moved.",
      "Organic traffic actually grew — the entire loss is paid.",
      "Serums alone are −$109K; moisturizers, cleansers, and sunscreen are stable.",
    ],
    sections: [
      {
        id: "sc-wow-strip",
        kind: "compareStrip",
        title: "Skin Care KPIs",
        priorLabel: "W33",
        currentLabel: "W34",
        rows: [
          {
            label: "Sales",
            prior: "$971K",
            current: "$842K",
            delta: "−13.3%",
            tone: "negative",
          },
          {
            label: "Glance views",
            prior: "312K",
            current: "260K",
            delta: "−16.8%",
            tone: "negative",
          },
          {
            label: "— Paid glance views",
            prior: "149K",
            current: "71K",
            delta: "−52.3%",
            tone: "negative",
          },
          {
            label: "— Organic glance views",
            prior: "163K",
            current: "189K",
            delta: "+16.0%",
            tone: "positive",
          },
          {
            label: "Conversion rate",
            prior: "12.1%",
            current: "12.0%",
            delta: "−0.1 pts",
            tone: "neutral",
          },
          {
            label: "ASP",
            prior: "$25.70",
            current: "$25.16",
            delta: "−2.1%",
            tone: "negative",
          },
        ],
      },
      {
        id: "sc-subcat",
        kind: "table",
        title: "Sub-category view",
        table: {
          emphasis: "primary",
          columns: ["Sub-category", "W33", "W34", "Δ", "Note"],
          rows: [
            [
              "Serums",
              "$421K",
              "$312K",
              neg("-$109K"),
              "All 3 affected keywords live here",
            ],
            ["Moisturizers", "$288K", "$276K", neg("-$12K"), "Stable"],
            ["Cleansers", "$164K", "$158K", neg("-$6K"), "Stable"],
            ["Sunscreen", "$98K", "$96K", neg("-$2K"), "Seasonal taper"],
          ],
        },
      },
    ],
    followups: [
      {
        type: "drill",
        label: "Show me SKU-level detail for Serums",
        nextTurnId: "wow-serums-skus",
      },
      {
        type: "pivot",
        label: "Do the same breakdown for Baby Care",
        nextTurnId: "baby-care-availability",
      },
      {
        type: "pivot",
        label: "What changed in those campaigns — budget or bids?",
        nextTurnId: "campaign-budget-cut",
      },
    ],
  },
};

/** Conv 2 · Turn 3 — Serums SKUs */
export const wowSerumsSkus: FixtureEntry = {
  id: "wow-serums-skus",
  match: [
    "sku-level detail for serums",
    "skus did not meet the plan for the last 6",
    "top 20 skus by wow",
  ],
  thinkingSteps: [
    "Loading 8 Serums SKUs WoW",
    "Checking Buy Box and stock flags",
  ],
  breadcrumbAppend: ["Serums"],
  answer: {
    scopeLine: "Skin Care · Serums · 8 SKUs · W34 vs W33",
    headline: { value: "3 SKUs down", delta: "All in SC_SP_Hero_Exact" },
    why: [
      "The three SKUs down are the three SKUs advertised in SC_SP_Hero_Exact. Everything else in the sub-category grew.",
      "Availability and Buy Box are clean across all 8 — this is purely the media cut showing up at SKU level.",
    ],
    sections: [
      {
        id: "serums-table",
        kind: "table",
        title: "SKU detail",
        table: {
          emphasis: "primary",
          stickyFirstColumn: true,
          columns: [
            "SKU",
            "ASIN",
            "W33",
            "W34",
            "Δ",
            "Glance views Δ",
            "BB win rate",
            "In stock",
          ],
          rows: [
            [
              "Kavi Vitamin C Serum 30ml",
              "B0F2H8L4M1",
              "$164K",
              "$98K",
              neg("-$66K"),
              neg("-48%"),
              "99%",
              "Yes",
            ],
            [
              "Kavi Retinol Night Serum 30ml",
              "B0F5J1P9K7",
              "$112K",
              "$71K",
              neg("-$41K"),
              neg("-44%"),
              "98%",
              "Yes",
            ],
            [
              "Kavi Hyaluronic Serum 30ml",
              "B0F7R3W2N8",
              "$74K",
              "$52K",
              neg("-$22K"),
              neg("-39%"),
              "99%",
              "Yes",
            ],
            [
              "Kavi Niacinamide Serum 30ml",
              "B0F1D6Y5C4",
              "$28K",
              "$30K",
              pos("+$2K"),
              pos("+6%"),
              "97%",
              "Yes",
            ],
            [
              "Kavi Vitamin C Serum 50ml",
              "B0F9M4T7B2",
              "$21K",
              "$22K",
              pos("+$1K"),
              pos("+3%"),
              "99%",
              "Yes",
            ],
            [
              "Kavi Peptide Serum 30ml",
              "B0F3K8V1Z6",
              "$12K",
              "$19K",
              pos("+$7K"),
              pos("+58%"),
              "96%",
              "Yes",
            ],
            [
              "Kavi Serum Duo Bundle",
              "B0F6N2X9Q3",
              "$6K",
              "$17K",
              pos("+$11K"),
              pos("+112%"),
              "94%",
              "Yes",
            ],
            [
              "Kavi Travel Serum 10ml",
              "B0F4C7S3H5",
              "$4K",
              "$3K",
              neg("-$1K"),
              neg("-18%"),
              "99%",
              "Yes",
            ],
          ],
        },
      },
    ],
    followups: [
      {
        type: "pivot",
        label: "Turn this whole week-on-week review into a deck",
        nextTurnId: "deck-outline",
      },
      {
        type: "drill",
        label: "What changed in those campaigns — budget or bids?",
        nextTurnId: "campaign-budget-cut",
      },
    ],
  },
};
