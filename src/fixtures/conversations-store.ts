import type { FixtureEntry, TableCellValue } from "@/types";

function neg(text: string): TableCellValue {
  return { text, tone: "negative" };
}
function warn(text: string): TableCellValue {
  return { text, tone: "warning" };
}

/** Conv 3 · Turn 1 — SKUs off Buy Box today */
export const bbOffToday: FixtureEntry = {
  id: "bb-off-today",
  match: [
    "skus not on buy box today",
    "not on buy box",
    "buy box today",
    "out of stock or about to go out of stock",
  ],
  thinkingSteps: [
    "Pulling live Buy Box status as of 8:00 AM PT",
    "Grouping by issue type and daily OPS at risk",
  ],
  answer: {
    scopeLine: "Amazon US · Aug 30 · Buy Box status as of 8:00 AM PT",
    headline: {
      value: "11 SKUs",
      delta: "$47.2K avg daily OPS at risk",
      direction: "down",
    },
    why: [
      "11 SKUs are off Buy Box right now, worth $47.2K of average daily OPS.",
      "Three quarters of that sits in two issue types: undercut by 3P and out of stock.",
      "Four of the five undercut SKUs are being undercut by sellers we've seen before across categories.",
    ],
    sections: [
      {
        id: "bb-score",
        kind: "scorecard",
        tiles: [
          { label: "Off Buy Box", value: "11" },
          {
            label: "Daily OPS at risk",
            value: "$47.2K",
            direction: "down",
          },
          { label: "Undercut by 3P", value: "5 · $28.4K" },
          { label: "Suppressed again", value: "2 NutriPeak" },
        ],
      },
      {
        id: "bb-issue-types",
        kind: "table",
        title: "Issue types",
        table: {
          emphasis: "primary",
          columns: ["Issue", "SKUs", "Daily OPS at risk"],
          rows: [
            ["Undercut by 3P seller", "5", neg("$28.4K")],
            ["Out of stock (no offer from us)", "2", neg("$7.2K")],
            ["Listing suppressed", "2", neg("$6.9K")],
            ["Fulfilment advantage (3P is FBA)", "1", neg("$2.9K")],
            ["Other / pricing error", "1", neg("$1.8K")],
          ],
        },
      },
      {
        id: "bb-sku-list",
        kind: "table",
        title: "SKU list",
        table: {
          emphasis: "primary",
          stickyFirstColumn: true,
          columns: [
            "SKU",
            "ASIN",
            "Category",
            "Brand",
            "Winning 3P seller",
            "Issue",
            "Avg daily OPS",
          ],
          rows: [
            [
              "Sensitive Wipes 12-pack",
              "B0D4T8N1X3",
              "Baby Care",
              "Tinytide",
              "ValuMart Direct",
              warn("Undercut (−6.2%)"),
              "$9.1K",
            ],
            [
              "Overnight Diapers Size 5, 88ct",
              "B0C8L3P6R2",
              "Baby Care",
              "Tinytide",
              "Coastline Goods",
              warn("Undercut (−4.8%)"),
              "$6.4K",
            ],
            [
              "Vitamin C Serum 50ml",
              "B0F9M4T7B2",
              "Skin Care",
              "Kavi",
              "PrimeStock Depot",
              warn("Undercut (−7.1%)"),
              "$5.2K",
            ],
            [
              "Diaper Rash Cream 4oz",
              "B0B9Q3F7V2",
              "Baby Care",
              "Tinytide",
              "BrightBuy Wholesale",
              warn("Undercut (−4.1%)"),
              "$4.6K",
            ],
            [
              "Repair Shampoo 500ml",
              "B0A2V7K9D1",
              "Hair Care",
              "Aurelle",
              "NorthGate Retail",
              warn("Undercut (−3.4%)"),
              "$3.1K",
            ],
            [
              "Whitening Toothpaste 3-pack",
              "B0E5F2J8W4",
              "Oral Care",
              "Brightline",
              "—",
              warn("Out of stock"),
              "$4.3K",
            ],
            [
              "Multi-Surface Spray 32oz",
              "B0G1R4M7T9",
              "Home Cleaning",
              "Purecraft",
              "—",
              warn("Out of stock"),
              "$2.9K",
            ],
            [
              "Daily Multivitamin 120ct",
              "B0H6Y3N5Q8",
              "Vitamins",
              "NutriPeak",
              "—",
              warn("Suppressed (image)"),
              "$4.1K",
            ],
            [
              "Omega-3 90ct",
              "B0H2W8B1L6",
              "Vitamins",
              "NutriPeak",
              "—",
              warn("Suppressed (image)"),
              "$2.8K",
            ],
            [
              "Curl Cream 8oz",
              "B0A9X4C2S7",
              "Hair Care",
              "Aurelle",
              "Coastline Goods",
              "Fulfilment advantage",
              "$2.9K",
            ],
            [
              "Travel Serum 10ml",
              "B0F4C7S3H5",
              "Skin Care",
              "Kavi",
              "—",
              warn("Pricing error (list < MAP)"),
              "$1.8K",
            ],
          ],
        },
      },
      {
        id: "bb-callout",
        kind: "callout",
        callout: {
          title: "Standouts",
          body: "The two suppressed NutriPeak listings are the same ASINs fixed on Aug 20 — flagged again for the same image reason. ValuMart, Coastline, BrightBuy and PrimeStock show up across 3 categories.",
          tone: "warning",
        },
      },
    ],
    followups: [
      {
        type: "drill",
        label: "Which of these 3P sellers appear across multiple categories?",
        nextTurnId: "bb-sellers-cross-cat",
      },
      {
        type: "pivot",
        label: "Check if there are any MAP violations based on my policy file",
        nextTurnId: "map-violations",
      },
      {
        type: "pivot",
        label: "Are the promotions running as planned?",
        nextTurnId: "promo-compliance",
      },
    ],
  },
};

/** Conv 3 · Turn 2 — sellers across categories */
export const bbSellersCrossCat: FixtureEntry = {
  id: "bb-sellers-cross-cat",
  match: [
    "sellers appear across multiple categories",
    "3p sellers on your asins",
    "valumart",
  ],
  thinkingSteps: [
    "Rolling up 3P sellers across your ASINs · last 30 days",
  ],
  answer: {
    scopeLine: "Amazon US · 3P sellers on your ASINs · last 30 days",
    headline: { value: "4 sellers", delta: "Operating across portfolio" },
    why: [
      "Four sellers are operating across your portfolio, not just picking off one category.",
      "ValuMart is the one to deal with first — more than the other three combined, and ASIN coverage grew from 8 to 14 over 30 days.",
    ],
    sections: [
      {
        id: "sellers-table",
        kind: "table",
        title: "Cross-category sellers",
        table: {
          emphasis: "primary",
          stickyFirstColumn: true,
          columns: [
            "Seller",
            "Your ASINs they list",
            "Categories",
            "Days they held BB (30d)",
            "Avg. undercut",
            "Est. monthly OPS taken",
          ],
          rows: [
            [
              "ValuMart Direct",
              "14",
              "Baby Care, Home Cleaning, Oral Care",
              "187 SKU-days",
              neg("-6.0%"),
              neg("$184K"),
            ],
            [
              "Coastline Goods",
              "9",
              "Baby Care, Hair Care",
              "96 SKU-days",
              neg("-4.9%"),
              neg("$91K"),
            ],
            [
              "BrightBuy Wholesale",
              "7",
              "Baby Care, Vitamins",
              "74 SKU-days",
              neg("-4.3%"),
              neg("$63K"),
            ],
            [
              "PrimeStock Depot",
              "5",
              "Skin Care",
              "41 SKU-days",
              neg("-7.1%"),
              neg("$48K"),
            ],
          ],
        },
      },
    ],
    followups: [
      {
        type: "pivot",
        label: "Check all of these sellers against our MAP policy",
        nextTurnId: "map-violations",
      },
      {
        type: "pivot",
        label: "Alert me if MAP breaks again",
        nextTurnId: "automation-map",
      },
    ],
  },
};

/** Conv 4 · Promo compliance */
export const promoCompliance: FixtureEntry = {
  id: "promo-compliance",
  match: [
    "are the promotions running as planned",
    "promo compliance",
    "promotions running",
  ],
  thinkingSteps: [
    "Matching live promos to the calendar",
    "Flagging badge gaps and unplanned discounts",
  ],
  answer: {
    scopeLine: "Amazon US · Aug 30 · 19 planned promotions live this week",
    headline: {
      value: "14 clean",
      delta: "5 need attention · 4 unplanned",
    },
    why: [
      "14 are running clean. 5 need attention — and there are 4 discounts live that were never planned at all.",
      "That's $6.7K/day of unplanned margin giveaway, roughly $47K a week.",
      "The Retinol and Wipes coupons have been auto-renewing since July — 39 and 44 days respectively.",
    ],
    sections: [
      {
        id: "promo-score",
        kind: "scorecard",
        tiles: [
          { label: "Running clean", value: "14", delta: "63 SKUs" },
          {
            label: "Badge missing",
            value: "3+",
            delta: "lift at risk",
            direction: "down",
          },
          {
            label: "Didn't start",
            value: "2",
            direction: "down",
          },
          {
            label: "Unplanned / day",
            value: "−$6.7K",
            direction: "down",
          },
        ],
      },
      {
        id: "promo-groups",
        kind: "severityGroup",
        groups: [
          {
            level: "clean",
            title: "Running as planned — 14 promotions, 63 SKUs",
            summary:
              "Deal price, badge, and schedule all match the plan. Nothing to do.",
            defaultExpanded: false,
            table: {
              emphasis: "secondary",
              columns: ["Note"],
              rows: [["63 SKUs across 14 promotions — collapsed detail available on request."]],
            },
          },
          {
            level: "attention",
            title: "Started, but the promo badge isn't showing — 7 SKUs",
            summary:
              "Discounted price is live (margin given up) but shoppers can't see a deal badge.",
            defaultExpanded: true,
            table: {
              emphasis: "primary",
              stickyFirstColumn: true,
              columns: [
                "SKU",
                "ASIN",
                "Brand",
                "Promo",
                "Price live?",
                "Badge?",
                "Started",
                "Est. lift lost/day",
              ],
              rows: [
                [
                  "Repair Shampoo 500ml",
                  "B0A2V7K9D1",
                  "Aurelle",
                  "20% Best Deal",
                  "Yes",
                  warn("No"),
                  "Aug 28",
                  neg("$2.4K"),
                ],
                [
                  "Repair Conditioner 500ml",
                  "B0A5T8G3N7",
                  "Aurelle",
                  "20% Best Deal",
                  "Yes",
                  warn("No"),
                  "Aug 28",
                  neg("$1.7K"),
                ],
                [
                  "Vitamin C Serum 30ml",
                  "B0F2H8L4M1",
                  "Kavi",
                  "Lightning Deal",
                  "Yes",
                  warn("No"),
                  "Aug 29",
                  neg("$3.1K"),
                ],
                [
                  "Daily Multivitamin 120ct",
                  "B0H6Y3N5Q8",
                  "NutriPeak",
                  "15% coupon",
                  "Yes",
                  warn("No"),
                  "Aug 27",
                  neg("$1.2K"),
                ],
              ],
            },
          },
          {
            level: "broken",
            title: "Didn't start as planned — 2 promotions, 5 SKUs",
            defaultExpanded: true,
            table: {
              emphasis: "primary",
              columns: ["SKU", "Brand", "Promo", "Planned start", "Status"],
              rows: [
                [
                  "Whitening Toothpaste 3-pack",
                  "Brightline",
                  "25% Best Deal",
                  "Aug 28",
                  warn("Rejected — out of stock at submission"),
                ],
                [
                  "Multi-Surface Spray 32oz + 3 SKUs",
                  "Purecraft",
                  "Bundle promo",
                  "Aug 29",
                  warn("Pending Amazon review, 26 hrs"),
                ],
              ],
            },
          },
          {
            level: "unplanned",
            title: "Unplanned discounts running — 4 SKUs",
            summary: "Not in the promo calendar · ~$47K/week margin giveaway",
            defaultExpanded: true,
            table: {
              emphasis: "primary",
              stickyFirstColumn: true,
              columns: [
                "SKU",
                "ASIN",
                "Brand",
                "Discount live",
                "Source",
                "Margin impact/day",
              ],
              rows: [
                [
                  "Curl Cream 8oz",
                  "B0A9X4C2S7",
                  "Aurelle",
                  "15% coupon",
                  "Vendor Central coupon, Aug 22",
                  neg("-$1.9K"),
                ],
                [
                  "Retinol Night Serum 30ml",
                  "B0F5J1P9K7",
                  "Kavi",
                  "10% coupon",
                  "Auto-renewed from July",
                  neg("-$2.6K"),
                ],
                [
                  "Omega-3 90ct",
                  "B0H2W8B1L6",
                  "NutriPeak",
                  "20% S&S boost",
                  "Rule Jun 4, never expired",
                  neg("-$1.4K"),
                ],
                [
                  "Sensitive Wipes 12-pack",
                  "B0D4T8N1X3",
                  "Tinytide",
                  "5% coupon",
                  "Auto-renewed",
                  neg("-$0.8K"),
                ],
              ],
            },
          },
        ],
      },
      {
        id: "promo-callout",
        kind: "callout",
        callout: {
          title: "Likely causes",
          body: "The Aurelle pair is off Buy Box (Amazon suppresses the badge when you don't hold it). The Kavi Lightning Deal is badge-eligible but hasn't rendered for 19 hours — raise a case.",
          tone: "warning",
        },
      },
    ],
    followups: [
      {
        type: "pivot",
        label: "This is useful. Can you turn this into a dashboard I can check every day?",
        nextTurnId: "promo-dashboard-preview",
      },
      {
        type: "pivot",
        label: "Give me the list of SKUs not on Buy Box today",
        nextTurnId: "bb-off-today",
      },
      {
        type: "pivot",
        label: "Alert me on unplanned coupons",
        nextTurnId: "automation-map",
      },
    ],
  },
};
