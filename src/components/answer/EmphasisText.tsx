import type { ReactNode } from "react";

const EMPHASIS = /\*\*([^*]+)\*\*/g;

/**
 * Renders `**bold**` spans inside answer copy so the figures a reader scans for
 * are weighted, without turning the sentence into a chart.
 */
export function EmphasisText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parts: ReactNode[] = [];
  const pattern = new RegExp(EMPHASIS);
  let cursor = 0;
  let match = pattern.exec(text);

  while (match) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(
      <strong key={match.index} className="font-semibold">
        {match[1]}
      </strong>,
    );
    cursor = match.index + match[0].length;
    match = pattern.exec(text);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <p className={className}>{parts}</p>;
}
