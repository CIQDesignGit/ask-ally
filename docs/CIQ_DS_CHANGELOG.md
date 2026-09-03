# CIQ Design System — Ask Ally change log

Use this file during Ask Ally work. Whenever we customize a CIQ component locally, or need a new library variant, **add a row here**.

At the end of a session (or when a batch is ready):

1. Port the listed changes into [`ciq-design-system`](../ciq-design-system) (or your DS repo).
2. Bump / publish `@ciq-dev/ciq-design-system`.
3. Swap Ally local workarounds for the real library exports.
4. Mark items **Done** and note the DS PR / version.

---

## Status legend

| Status | Meaning |
|--------|---------|
| `Needed` | Spec’d; not built in Ally or DS yet |
| `Local workaround` | Ally has a temporary custom version |
| `Ready to port` | Local version is good enough to copy into DS |
| `Done` | Shipped in DS; Ally uses the package |

---

## Change log

| Date | Component | Change needed | Why (Ally use case) | Status | Ally notes / files | DS PR / version |
|------|-----------|---------------|---------------------|--------|--------------------|-----------------|
| 2026-09-01 | `PromptInput` | New layout variant (working name: `scoped` or `withContext`) that supports a **multi-chip context row** above or inside the input. Chips must allow interactive controls (Select / dropdown), not only static `PromptInputHeader` text. Keep attach + submit. Max content width in Ally ask area: **820px**. | Move ScopeBar (retailer · taxonomy · period · comparison) into the ask box. Existing `compact` / `stacked` + `PromptInputHeader` only support a single reply-style context string. | `Local workaround` | [`Messenger.tsx`](../src/components/chat/Messenger.tsx) + [`ScopeChips.tsx`](../src/components/chat/ScopeChips.tsx) — rounded shell with chips above `PromptInput` `compact`. | — |
| 2026-09-01 | `SuggestionChip` (new) | Interactive suggestion / follow-up chip atom (button, not the display-only `Chip`). **Shape:** `rounded-full`. **Typography:** `text-sm` / `text-[12.5px]` + **`font-medium`**. **Fill:** `bg-brand-25`, **border:** `border-brand-100`, **text:** `text-brand-800`. No leading icons. Hover → `bg-brand-50`. | Ally follow-ups after an answer. Existing `Chip` is a non-clickable `div`. | `Local workaround` | [`FollowupChips.tsx`](../src/components/answer/FollowupChips.tsx); Ally adds `--color-brand-25` in [`ciq-theme.css`](../src/styles/ciq-theme.css) | — |
| 2026-09-02 | `AnswerTable` / cell tones | Rich answer table with **primary (always open)** vs **secondary (collapsible)**, optional sticky first column, and per-cell tone (`positive` / `negative` / `warning`). Prefer elevating CIQ `Table` primitives (or a slim `InsightTable` recipe) rather than app-only markup. | Conversation scripts — almost every Ally turn is table-first. | `Local workaround` | [`AnswerTable.tsx`](../src/components/answer/AnswerTable.tsx) | — |
| 2026-09-02 | `SeverityGroup` / insight accordion | Status-grouped answer blocks (clean / attention / broken / unplanned) with badge + summary + nested table. Built on CIQ `Accordion` + `Badge` today; may want a dedicated compound. | Promo compliance + Buy Box issue buckets. | `Local workaround` | [`SeverityGroups.tsx`](../src/components/answer/SeverityGroups.tsx) | — |
| 2026-09-02 | `CompareStrip` / `ScorecardRow` / `InsightCallout` | Metric compare strip (prior / current / Δ), multi-tile scorecard, and left-border insight callout as reusable answer sections. | WoW portfolio, campaign change log, recommendations. | `Local workaround` | [`CompareStrip.tsx`](../src/components/answer/CompareStrip.tsx), [`ScorecardRow.tsx`](../src/components/answer/ScorecardRow.tsx), [`InsightCallout.tsx`](../src/components/answer/InsightCallout.tsx) | — |
| 2026-09-02 | `TableHead` | **Bug:** base classes include `flex` + `!bg-violet-50`. `display:flex` on `<th>` breaks HTML table layout (headers stack in one column). Remove `flex` from the atom (use `table-cell` / default); make violet background a variant, not default. | Ally answer tables look broken until locally overridden with `!table-cell !bg-transparent`. | `Local workaround` | [`AnswerTable.tsx`](../src/components/answer/AnswerTable.tsx) | — |
| 2026-09-02 | `Badge` | Status-only (non-interactive) variant without `shadow` / `hover:bg-*` / focus ring — or document that default Badge reads as a button. | Missed/Met pills in answer tables must not look clickable. | `Local workaround` | Ally uses a plain `<span>` pill in [`AnswerTable.tsx`](../src/components/answer/AnswerTable.tsx) | — |
| 2026-09-03 | `Table` / `TableHead` (insight recipe) | Quiet insight-table recipe: uppercase muted headers, horizontal row rules only, no violet header fill, no `flex` on `<th>`. Ally shares this via [`table-chrome.ts`](../src/components/answer/table-chrome.ts) + always frames answer tables in `SectionCard`. Prefer a DS `InsightTable` (or fixed TableHead defaults) later. | All conversation answer tables should match the framed “What drove the miss” look. | `Local workaround` | [`AnswerTable.tsx`](../src/components/answer/AnswerTable.tsx), [`table-chrome.ts`](../src/components/answer/table-chrome.ts) | — |

---

## How we work (session habit)

1. Prefer CIQ components as-is when they fit.
2. If they don’t fit:
   - Prefer a **small Ally-local composite** (wrapper around CIQ primitives) over forking the whole atom.
   - Log the gap in the table above (`Needed` or `Local workaround`).
3. Don’t invent permanent one-off UI in Ally that should be a DS variant — track it here instead.
4. End of session: review this file, open/update one DS PR for the batch, then sync this doc.

---

## PromptInput — desired `scoped` variant (spec sketch)

For the DS author — not implemented in Ally yet.

```text
┌─────────────────────────────────────────────────────────┐
│  [Amazon US ▾] [Beauty & PC ▾] [Week 34 ▾] [vs plan ▾] │  ← context chip row (interactive)
│─────────────────────────────────────────────────────────│
│  📎  Ask Ally about gap to plan…                   [↑]  │  ← compact ask row
└─────────────────────────────────────────────────────────┘
```

**Must support**

- Slot for multiple interactive chips (not a single string header)
- Compact ask row (leading / textarea / trailing submit) below chips
- Optional dismiss / clear on individual chips or the whole row
- Same Enter / Shift+Enter / loading-stop behavior as today’s PromptInput

**Not a fit today**

- `compact` — no header/chip row
- `stacked` + `PromptInputHeader` — one banner/chip string only
