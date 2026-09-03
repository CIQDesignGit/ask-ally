import { cn } from "@ciq-dev/ciq-design-system";

/**
 * Shared answer-table chrome.
 * DS TableHead ships `flex` + `!bg-violet-50`, which breaks HTML <table> layout
 * and paints a violet header. Override to the quiet insight style used in SectionCards.
 */
export const answerTableHeadClass = cn(
  "!table-cell h-8 border-0 border-b border-border-default !bg-transparent px-3 pb-2 align-middle text-[11px] font-semibold uppercase tracking-wide !text-fg-tertiary"
);

export const answerTableCellClass = "border-0 px-3 py-2.5";

/** Column alignment: first left, last center (status), middle numeric right */
export function answerColumnAlign(
  index: number,
  columnCount: number
): string {
  if (index === 0) return "text-left";
  if (index === columnCount - 1) return "text-center";
  return "text-right";
}
