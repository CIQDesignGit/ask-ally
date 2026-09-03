/**
 * Lead sentence + optional supporting points — plain body text, not a quote block.
 */
interface WhyListProps {
  bullets: string[];
  streamingText?: string;
  streaming?: boolean;
  onSkip?: () => void;
}

export function WhyList({
  bullets,
  streamingText,
  streaming,
  onSkip,
}: WhyListProps) {
  if (!bullets.length && !streamingText) return null;

  if (streaming) {
    return (
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
    );
  }

  return (
    <div className="space-y-2">
      {bullets.map((b, i) => (
        <p
          key={b.slice(0, 48)}
          className={
            i === 0
              ? "text-base leading-relaxed text-fg-primary"
              : "text-sm leading-relaxed text-fg-secondary"
          }
        >
          {b}
        </p>
      ))}
    </div>
  );
}
