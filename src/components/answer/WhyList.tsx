/**
 * Lead sentence + optional supporting points — plain body text, not a quote block.
 */
interface WhyListProps {
  bullets: string[];
  streamingText?: string;
  streaming?: boolean;
  onSkip?: () => void;
  /** When set (gap-to-plan report), shows a "Key finding" label above the body */
  label?: string;
}

export function WhyList({
  bullets,
  streamingText,
  streaming,
  onSkip,
  label,
}: WhyListProps) {
  if (!bullets.length && !streamingText) return null;

  const body = streaming ? (
    <div
      className="text-base leading-relaxed text-fg-primary"
      onClick={onSkip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSkip?.();
      }}
      role="button"
      tabIndex={0}
      title="Click to skip to full text"
    >
      <p>{streamingText}</p>
    </div>
  ) : (
    <div className="space-y-2">
      {bullets.map((b) => (
        <p
          key={b.slice(0, 48)}
          className="text-base leading-relaxed text-fg-primary"
        >
          {b}
        </p>
      ))}
    </div>
  );

  if (!label) return body;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-fg-primary">{label}</h3>
      {body}
    </div>
  );
}
